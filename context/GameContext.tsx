// context/GameContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_GAME_DATA, GameData, GameStats, loadGameData, saveGameData, Settings, Skin } from '../services/storage';

interface GameContextType {
    gameData: GameData;
    updateStats: (newStats: Partial<GameStats>) => void;
    addCoins: (amount: number) => void;
    updateHighScore: (score: number) => void;
    updateSettings: (settings: Partial<Settings>) => void;
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
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gameData, setGameData] = useState<GameData>(DEFAULT_GAME_DATA);
    const [isInitialized, setIsInitialized] = useState(false);

    const refreshGameData = async () => {
        const data = await loadGameData();
        setGameData(data);
        console.log('Game data refreshed:', data);
    };

    useEffect(() => {
        const initializeData = async () => {
            const data = await loadGameData();
            setGameData(data);
            setIsInitialized(true);
            console.log('GameContext initialized with data:', data);
        };
        initializeData();
    }, []);

    const saveData = async (newData: GameData) => {
        setGameData(newData);
        await saveGameData(newData);
        console.log('Game data saved:', newData);
    };

    const updateStats = (newStats: Partial<GameStats>) => {
        const updatedData = {
            ...gameData,
            stats: { ...gameData.stats, ...newStats }
        };
        saveData(updatedData);
    };

    const addCoins = (amount: number) => {
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
        console.log('Updating high score:', score, 'Current:', gameData.highScore);
        if (score > gameData.highScore) {
            const updatedData = {
                ...gameData,
                highScore: score
            };
            console.log('New high score saved:', score);
            saveData(updatedData);
        } else {
            console.log('Score is not higher than current record');
        }
    };

    const updateSettings = (settings: Partial<Settings>) => {
        const updatedData = {
            ...gameData,
            settings: { ...gameData.settings, ...settings }
        };
        saveData(updatedData);
    };

    const unlockSkin = (skinId: string) => {
        const updatedSkins = gameData.skins.map(skin =>
            skin.id === skinId ? { ...skin, unlocked: true } : skin
        );
        const updatedData = { ...gameData, skins: updatedSkins };
        saveData(updatedData);
    };

    const equipSkin = (skinId: string) => {
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
        console.log('Recording game session:', sessionData);

        const bonusesByType = { ...gameData.stats.bonusesByType };

        if (sessionData.bonusesCollected) {
            sessionData.bonusesCollected.forEach(bonus => {
                bonusesByType[bonus.type] += bonus.count;
            });
        }

        const deathsByObstacle = { ...gameData.stats.deathsByObstacle };
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

        // Обновляем рекорд если нужно
        if (sessionData.score > gameData.highScore) {
            updatedData.highScore = sessionData.score;
            console.log('New record in session data:', sessionData.score);
        }

        saveData(updatedData);
    };

    if (!isInitialized) {
        return null; // или loading indicator
    }

    return (
        <GameContext.Provider value={{
            gameData,
            updateStats,
            addCoins,
            updateHighScore,
            updateSettings,
            unlockSkin,
            equipSkin,
            getCurrentSkin,
            recordGameSession,
            refreshGameData
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within GameProvider');
    return context;
};