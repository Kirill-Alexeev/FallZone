// context/GameContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import CustomText from '../components/ui/CustomText';
import AudioService from '../services/audioService';
import GameStateManager from '../services/gameStateManager';
import NotificationService from '../services/notificationService';
import {
    AudioSettings,
    DEFAULT_GAME_DATA,
    GameData,
    GameStats,
    Skin
} from '../services/storage';
import { useAuth } from './AuthContext';

interface GameContextType {
    gameData: GameData | null;
    isLoading: boolean;
    updateStats: (newStats: Partial<GameStats>) => Promise<void>;
    addCoins: (amount: number) => Promise<void>;
    updateHighScore: (score: number) => Promise<void>;
    updateAudioSettings: (settings: Partial<AudioSettings>) => Promise<void>;
    unlockSkin: (skinId: string) => Promise<void>;
    equipSkin: (skinId: string) => Promise<void>;
    getCurrentSkin: () => Skin | undefined;
    recordGameSession: (sessionData: {
        score: number;
        coins: number;
        playTime: number;
        tapCount: number;
        deathBy?: 'asteroid' | 'drone' | 'wall';
        bonusesCollected?: { type: 'shield' | 'magnet' | 'coin'; count: number }[];
    }) => Promise<void>;
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

    // Инициализация
    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            try {
                setIsLoading(true);

                // Инициализируем GameStateManager
                await GameStateManager.initialize(user);

                if (!isMounted) return;

                // Получаем текущие данные
                const currentData = GameStateManager.getCurrentData();
                setGameData(currentData);

                // Применяем настройки звука
                if (currentData) {
                    const audioSettings = currentData.audioSettings;
                    AudioService.setMuted(!audioSettings.sound);
                    AudioService.setMusicMuted(!audioSettings.music);

                    if (audioSettings.vibration !== undefined) {
                        AudioService.setVibrationEnabled(audioSettings.vibration);
                    }
                }

                setIsInitialized(true);
                console.log('✅ GameContext initialized');
            } catch (error) {
                console.error('Error initializing GameContext:', error);
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

        initialize();

        return () => {
            isMounted = false;
        };
    }, [user]);

    // Обновляем локальное состояние когда GameStateManager изменяет данные
    useEffect(() => {
        if (!isInitialized) return;

        const checkForUpdates = () => {
            const currentData = GameStateManager.getCurrentData();
            if (currentData && currentData !== gameData) {
                console.log('Updating local state from GameStateManager');
                setGameData(currentData);
            }
        };

        // Проверяем обновления каждые 500мс
        const interval = setInterval(checkForUpdates, 500);
        return () => clearInterval(interval);
    }, [isInitialized, gameData]);

    // Все методы теперь просто делегируют GameStateManager
    const recordGameSession = async (sessionData: any) => {
        if (!isInitialized || !user) return;

        try {
            await GameStateManager.recordGameSession(sessionData);
            // Локальное состояние обновится через эффект выше
        } catch (error) {
            console.error('Error recording game session:', error);
        }
    };

    const updateHighScore = async (score: number) => {
        if (!isInitialized || !user) return;

        try {
            await GameStateManager.updateHighScore(score);
        } catch (error) {
            console.error('Error updating high score:', error);
        }
    };

    const addCoins = async (amount: number) => {
        if (!isInitialized || !user) return;

        try {
            await GameStateManager.addCoins(amount);
        } catch (error) {
            console.error('Error adding coins:', error);
        }
    };

    const updateStats = async (newStats: Partial<GameStats>) => {
        if (!isInitialized || !user) return;

        try {
            await GameStateManager.updateStats(newStats);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    };

    const updateAudioSettings = async (settings: Partial<AudioSettings>) => {
        if (!isInitialized || !gameData) return;

        const updatedData = {
            ...gameData,
            audioSettings: { ...gameData.audioSettings, ...settings }
        };

        setGameData(updatedData);

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

        // Сохраняем через GameStateManager
        if (user) {
            try {
                await GameStateManager.saveWithQueue(() => updatedData);
            } catch (error) {
                console.error('Error saving audio settings:', error);
            }
        }
    };

    // ... остальные методы (unlockSkin, equipSkin и т.д.) аналогично

    const syncWithLeaderboard = async () => {
        if (!user || !gameData) return;

        try {
            // GameStateManager уже синхронизирует с лидербордом автоматически
            console.log('Manual sync requested');
            // Принудительная синхронизация если нужно
            await GameStateManager.saveWithQueue((current) => current);
        } catch (error) {
            console.error('Error syncing with leaderboard:', error);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color="#00FFFF" />
                <CustomText style={{ color: '#00FFFF', fontSize: 20, marginTop: 20 }}>Загрузка...</CustomText>
            </View>
        );
    }

    const contextValue: GameContextType = {
        gameData: gameData || DEFAULT_GAME_DATA,
        isLoading,
        updateStats,
        addCoins,
        updateHighScore,
        updateAudioSettings,
        unlockSkin: async (skinId: string) => {
            if (!gameData || !isInitialized || !user) return;
            // ... реализация
        },
        equipSkin: async (skinId: string) => {
            if (!gameData || !isInitialized || !user) return;
            // ... реализация
        },
        getCurrentSkin: () => {
            if (!gameData) return undefined;
            return gameData.skins.find(skin => skin.id === gameData.currentSkinId);
        },
        recordGameSession,
        refreshGameData: async () => {
            // Перезагружаем данные
            setIsLoading(true);
            await GameStateManager.initialize(user);
            const currentData = GameStateManager.getCurrentData();
            setGameData(currentData);
            setIsLoading(false);
        },
        playSound: (soundName: string) => {
            const audioSettings = gameData?.audioSettings || DEFAULT_GAME_DATA.audioSettings;
            if (audioSettings.sound) {
                try {
                    AudioService.playSound(soundName);
                } catch (error) {
                    console.error(`Error playing sound ${soundName}:`, error);
                }
            }
        },
        playMusic: (musicType: 'menu' | 'game') => {
            const audioSettings = gameData?.audioSettings || DEFAULT_GAME_DATA.audioSettings;
            if (audioSettings.music) {
                try {
                    AudioService.playBackgroundMusic(musicType);
                } catch (error) {
                    console.error(`Error playing ${musicType} music:`, error);
                }
            }
        },
        stopMusic: () => {
            try {
                AudioService.stopBackgroundMusic();
            } catch (error) {
                console.error('Error stopping music:', error);
            }
        },
        switchToMenuMusic: () => {
            const audioSettings = gameData?.audioSettings || DEFAULT_GAME_DATA.audioSettings;
            if (audioSettings.music) {
                try {
                    AudioService.playBackgroundMusic('menu');
                } catch (error) {
                    console.error('Error switching to menu music:', error);
                }
            }
        },
        switchToGameMusic: () => {
            const audioSettings = gameData?.audioSettings || DEFAULT_GAME_DATA.audioSettings;
            if (audioSettings.music) {
                try {
                    AudioService.playBackgroundMusic('game');
                } catch (error) {
                    console.error('Error switching to game music:', error);
                }
            }
        },
        vibrate: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning') => {
            const audioSettings = gameData?.audioSettings || DEFAULT_GAME_DATA.audioSettings;
            if (audioSettings.vibration) {
                try {
                    AudioService.vibrate(type);
                } catch (error) {
                    console.error('Error with vibration:', error);
                }
            }
        },
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