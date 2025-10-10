import React, { createContext, ReactNode, useContext } from 'react';
import useGameState from '../hooks/useGameState';

// Интерфейс для контекста игры
interface GameContextType {
    // Состояние игры
    gameStats: {
        highScore: number;
        totalGamesPlayed: number;
        totalScore: number;
        bestStreak: number;
        currentStreak: number;
    };
    gameSettings: {
        soundEnabled: boolean;
        musicEnabled: boolean;
        vibrationEnabled: boolean;
        difficulty: 'easy' | 'medium' | 'hard';
    };
    gameProgress: {
        level: number;
        experience: number;
        coins: number;
        unlockedCharacters: string[];
        selectedCharacter: string;
    };
    currentGame: {
        score: number;
        isPlaying: boolean;
        gameOver: boolean;
        startTime: number;
    };
    
    // Состояние загрузки и ошибок
    loading: boolean;
    error: string | null;
    
    // Действия
    startGame: () => void;
    endGame: (finalScore: number) => void;
    updateScore: (newScore: number) => void;
    resetGame: () => void;
    updateSettings: (newSettings: Partial<typeof gameSettings>) => void;
    unlockCharacter: (characterId: string) => void;
    selectCharacter: (characterId: string) => void;
    spendCoins: (amount: number) => boolean;
    updateGameStats: (finalScore: number) => Promise<void>;
}

// Создаем контекст с начальным значением
const GameContext = createContext<GameContextType | undefined>(undefined);

// Интерфейс для провайдера
interface GameProviderProps {
    children: ReactNode;
}

/**
 * Провайдер контекста игры
 * Обеспечивает доступ к состоянию игры во всем приложении
 * Использует хук useGameState для управления состоянием
 */
export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    const gameState = useGameState();

    return (
        <GameContext.Provider value={gameState}>
            {children}
        </GameContext.Provider>
    );
};

/**
 * Хук для использования контекста игры
 * @returns объект с состоянием и методами игры
 * @throws Error если используется вне GameProvider
 */
export const useGameContext = (): GameContextType => {
    const context = useContext(GameContext);
    
    if (context === undefined) {
        throw new Error('useGameContext должен использоваться внутри GameProvider');
    }
    
    return context;
};

export default GameContext;
