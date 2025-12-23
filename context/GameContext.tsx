// context/GameContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoadingScreen } from '../app/_layout';
import AudioService from '../services/audioService';
import { migrateGuestToUser } from '../services/dataMigration';
import LeaderboardService from '../services/leaderboardService';
import NotificationService from '../services/notificationService';
import {
    AudioSettings,
    DEFAULT_GAME_DATA,
    GameData,
    GameStats,
    getStorageKey,
    loadGameData,
    saveGameData,
    Skin
} from '../services/storage';
import { useAuth } from './AuthContext';

interface GameContextType {
    gameData: GameData | null;
    isLoading: boolean;
    updateStats: (newStats: Partial<GameStats>) => void;
    addCoins: (amount: number) => void;
    updateHighScore: (score: number) => void;
    updateAudioSettings: (settings: Partial<AudioSettings>) => void;
    unlockSkin: (skinId: string) => void;
    equipSkin: (skinId: string) => void;
    getCurrentSkin: () => Skin | undefined;
    recordGameSession: (sessionData: {
        score: number;
        coins: number;
        playTime: number;
        tapCount: number;
        deathBy?: 'comet' | 'asteroid' | 'drone' | 'wall';
        bonusesCollected?: { type: 'shield' | 'magnet' | 'slowmo' | 'coin'; count: number }[];
    }) => void;
    refreshGameData: () => Promise<void>;
    playSound: (soundName: string) => void;
    playMusic: (musicType: 'menu' | 'game') => void;
    stopMusic: () => void;
    switchToMenuMusic: () => void;
    switchToGameMusic: () => void;
    vibrate: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning') => void;
    scheduleNotification: (title: string, body: string, seconds?: number) => Promise<string | null>;
    cancelAllNotifications: () => Promise<void>;
    syncWithLeaderboard: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [guestData, setGuestData] = useState<GameData | null>(null);

    // Получаем безопасные настройки аудио
    const getSafeAudioSettings = (): AudioSettings => {
        return gameData?.audioSettings || DEFAULT_GAME_DATA.audioSettings;
    };

    // Инициализация аудио сервиса
    useEffect(() => {
        const initializeAudio = async () => {
            try {
                await AudioService.loadSounds();
                console.log('AudioService initialized successfully');
            } catch (error) {
                console.error('Error initializing AudioService:', error);
            }
        };

        initializeAudio();
    }, []);

    // Загрузка данных пользователя
    useEffect(() => {
        let isMounted = true;

        const loadUserData = async () => {
            try {
                setIsLoading(true);

                let data: GameData;

                if (user) {
                    // Загружаем данные пользователя
                    data = await loadGameData(user);

                    // Переносим гостевые данные если есть
                    data = await migrateGuestToUser(user, data);

                    console.log('Loaded user game data:', data);

                    // Синхронизируем с лидербордом
                    if (data.highScore > 0) {
                        try {
                            await LeaderboardService.updateUserScore(user, data);
                        } catch (error) {
                            console.error('Error syncing with leaderboard:', error);
                        }
                    }
                } else {
                    // Для гостя
                    data = await loadGameData(null);
                    console.log('Loaded guest game data:', data);
                }

                if (!isMounted) return;

                setGameData(data);

                // Применяем настройки звука
                const audioSettings = data.audioSettings;
                AudioService.setMuted(!audioSettings.sound);
                AudioService.setMusicMuted(!audioSettings.music);

                if (audioSettings.vibration !== undefined) {
                    AudioService.setVibrationEnabled(audioSettings.vibration);
                }

                setIsInitialized(true);
            } catch (error) {
                console.error('Error loading game data:', error);
                if (isMounted) {
                    setGameData(DEFAULT_GAME_DATA);
                    setIsInitialized(true);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadUserData();

        return () => {
            isMounted = false;
        };
    }, [user]);

    const saveData = async (newData: GameData) => {
        if (!isInitialized) return;

        setGameData(newData);

        try {
            if (user) {
                // Сохраняем данные пользователя
                await saveGameData(user, newData);
                console.log('Game data saved for user:', user.email);
            } else {
                // Для гостя сохраняем в локальное состояние
                setGuestData(newData);
                // И в сессию на случай перезагрузки
                const guestKey = getStorageKey(null);
                await AsyncStorage.setItem(guestKey, JSON.stringify(newData));
                console.log('Game data saved for guest session');
            }
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    };

    const updateStats = (newStats: Partial<GameStats>) => {
        if (!gameData || !isInitialized || !user) return;

        const updatedData = {
            ...gameData,
            stats: { ...gameData.stats, ...newStats }
        };
        saveData(updatedData);
    };

    const addCoins = (amount: number) => {
        if (!gameData || !isInitialized || !user) return;

        const updatedData = {
            ...gameData,
            coins: gameData.coins + amount,
            stats: {
                ...gameData.stats,
                totalCoinsEarned: gameData.stats.totalCoinsEarned + amount
            }
        };
        saveData(updatedData);
    };

    const updateHighScore = (score: number) => {
        if (!gameData || !isInitialized) return;

        console.log('Updating high score:', score, 'Current:', gameData.highScore);
        if (score > gameData.highScore) {
            const updatedData = {
                ...gameData,
                highScore: score
            };
            console.log('New high score saved:', score);
            saveData(updatedData);

            // Синхронизируем с таблицей лидеров только если есть пользователь
            if (user) {
                LeaderboardService.updateUserScore(user, updatedData).catch(error => {
                    console.error('Error updating leaderboard:', error);
                });
            }
        } else {
            console.log('Score is not higher than current record');
        }
    };

    const updateAudioSettings = (settings: Partial<AudioSettings>) => {
        if (!gameData || !isInitialized) return;

        const updatedData = {
            ...gameData,
            audioSettings: { ...gameData.audioSettings, ...settings }
        };

        // Применяем настройки к аудио сервису
        if (settings.sound !== undefined) {
            AudioService.setMuted(!settings.sound);
        }
        if (settings.music !== undefined) {
            AudioService.setMusicMuted(!settings.music);
        }
        if (settings.vibration !== undefined) {
            AudioService.setVibrationEnabled(settings.vibration);
        }
        if (settings.notifications !== undefined) {
            if (settings.notifications) {
                NotificationService.initNotifications()
                    .then(() => NotificationService.scheduleNotification({
                        title: 'FallZone',
                        body: 'Уведомления включены! Загляните в игру.',
                        seconds: 10
                    }))
                    .catch(e => console.error('Notification schedule error:', e));
            } else {
                NotificationService.cancelAllScheduled().catch(e => console.error('Notification cancel error:', e));
            }
        }

        saveData(updatedData);
    };

    const unlockSkin = (skinId: string) => {
        if (!gameData || !isInitialized || !user) return;

        const updatedSkins = gameData.skins.map(skin =>
            skin.id === skinId ? { ...skin, unlocked: true } : skin
        );
        const updatedData = { ...gameData, skins: updatedSkins };
        saveData(updatedData);
    };

    const equipSkin = (skinId: string) => {
        if (!gameData || !isInitialized || !user) return;

        const updatedSkins = gameData.skins.map(skin =>
            ({ ...skin, equipped: skin.id === skinId })
        );
        const updatedData = {
            ...gameData,
            skins: updatedSkins,
            currentSkinId: skinId
        };
        saveData(updatedData);
    };

    const getCurrentSkin = () => {
        if (!gameData || !isInitialized) return undefined;
        return gameData.skins.find(skin => skin.id === gameData.currentSkinId);
    };

    const recordGameSession = (sessionData: {
        score: number;
        coins: number;
        playTime: number;
        tapCount: number;
        deathBy?: 'comet' | 'asteroid' | 'drone' | 'wall';
        bonusesCollected?: { type: 'shield' | 'magnet' | 'slowmo' | 'coin'; count: number }[];
    }) => {
        if (!gameData || !isInitialized || !user) return;

        console.log('Recording game session:', sessionData);

        const bonusesByType = { ...gameData.stats.bonusesByType };
        const deathsByObstacle = { ...gameData.stats.deathsByObstacle };

        if (sessionData.bonusesCollected) {
            sessionData.bonusesCollected.forEach(bonus => {
                bonusesByType[bonus.type] += bonus.count;
            });
        }

        if (sessionData.deathBy) {
            deathsByObstacle[sessionData.deathBy] += 1;
        }

        const updatedData = {
            ...gameData,
            coins: gameData.coins + sessionData.coins,
            stats: {
                totalGames: gameData.stats.totalGames + 1,
                totalTaps: gameData.stats.totalTaps + sessionData.tapCount,
                totalPlayTime: gameData.stats.totalPlayTime + sessionData.playTime,
                totalCoinsEarned: gameData.stats.totalCoinsEarned + sessionData.coins,
                totalScore: gameData.stats.totalScore + sessionData.score,
                totalDeaths: gameData.stats.totalDeaths + (sessionData.deathBy ? 1 : 0),
                deathsByObstacle,
                totalBonuses: gameData.stats.totalBonuses + (sessionData.bonusesCollected?.reduce((sum, b) => sum + b.count, 0) || 0),
                bonusesByType
            }
        };

        if (sessionData.score > updatedData.highScore) {
            updatedData.highScore = sessionData.score;
            console.log('New record in session data:', sessionData.score);
        }

        saveData(updatedData);

        // Синхронизируем с таблицей лидеров
        LeaderboardService.updateUserScore(user, updatedData).catch(error => {
            console.error('Error updating leaderboard after session:', error);
        });
    };

    const refreshGameData = async () => {
        if (!user) return;

        try {
            const data = await loadGameData(user);
            if (isInitialized) {
                setGameData(data);
                console.log('Game data refreshed successfully');
            }
        } catch (error) {
            console.error('Error refreshing game data:', error);
        }
    };

    // Аудио методы
    const playSound = (soundName: string) => {
        if (!isInitialized) return;

        const audioSettings = getSafeAudioSettings();
        if (audioSettings.sound) {
            try {
                AudioService.playSound(soundName);
            } catch (error) {
                console.error(`Error playing sound ${soundName}:`, error);
            }
        }
    };

    const playMusic = (musicType: 'menu' | 'game') => {
        if (!isInitialized) return;

        const audioSettings = getSafeAudioSettings();
        if (audioSettings.music) {
            try {
                AudioService.playBackgroundMusic(musicType);
            } catch (error) {
                console.error(`Error playing ${musicType} music:`, error);
            }
        }
    };

    const stopMusic = () => {
        try {
            AudioService.stopBackgroundMusic();
        } catch (error) {
            console.error('Error stopping music:', error);
        }
    };

    const switchToMenuMusic = () => {
        if (!isInitialized) return;

        const audioSettings = getSafeAudioSettings();
        if (audioSettings.music) {
            try {
                AudioService.playBackgroundMusic('menu');
            } catch (error) {
                console.error('Error switching to menu music:', error);
            }
        }
    };

    const switchToGameMusic = () => {
        if (!isInitialized) return;

        const audioSettings = getSafeAudioSettings();
        if (audioSettings.music) {
            try {
                AudioService.playBackgroundMusic('game');
            } catch (error) {
                console.error('Error switching to game music:', error);
            }
        }
    };

    const vibrate = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning') => {
        if (!isInitialized) return;

        const audioSettings = getSafeAudioSettings();
        if (audioSettings.vibration) {
            try {
                AudioService.vibrate(type);
            } catch (error) {
                console.error('Error with vibration:', error);
            }
        }
    };

    const syncWithLeaderboard = async () => {
        if (!user || !gameData) return;

        try {
            await LeaderboardService.updateUserScore(user, gameData);
            console.log('Game data synced with leaderboard');
        } catch (error) {
            console.error('Error syncing with leaderboard:', error);
        }
    };

    // Показываем loading пока данные не загружены
    if (isLoading) {
        // Вместо null возвращаем пустой View с фоном
        return <LoadingScreen />;
    }

    const contextValue: GameContextType = {
        gameData: gameData || DEFAULT_GAME_DATA,
        isLoading,
        updateStats,
        addCoins,
        updateHighScore,
        updateAudioSettings,
        unlockSkin,
        equipSkin,
        getCurrentSkin,
        recordGameSession,
        refreshGameData,
        playSound,
        playMusic,
        stopMusic,
        switchToMenuMusic,
        switchToGameMusic,
        vibrate,
        scheduleNotification: async (title: string, body: string, seconds = 1) => {
            try {
                await NotificationService.initNotifications();
                const id = await NotificationService.scheduleNotification({ title, body, seconds });
                return id;
            } catch (e) {
                console.error('scheduleNotification error:', e);
                return null;
            }
        },
        cancelAllNotifications: async () => {
            try {
                await NotificationService.cancelAllScheduled();
            } catch (e) {
                console.error('cancelAllNotifications error:', e);
            }
        },
        syncWithLeaderboard
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within GameProvider');
    return context;
};