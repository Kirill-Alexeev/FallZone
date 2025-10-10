import { useCallback, useRef, useState } from 'react';
import useLocalStorage from './useLocalStorage';

// Интерфейсы для типизации состояния игры
interface GameStats {
    highScore: number;
    totalGamesPlayed: number;
    totalScore: number;
    bestStreak: number;
    currentStreak: number;
}

interface GameSettings {
    soundEnabled: boolean;
    musicEnabled: boolean;
    vibrationEnabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface GameProgress {
    level: number;
    experience: number;
    coins: number;
    unlockedCharacters: string[];
    selectedCharacter: string;
}

/**
 * Хук для управления глобальным состоянием игры
 * Объединяет статистику, настройки и прогресс игрока
 * Автоматически сохраняет данные в локальное хранилище
 */
function useGameState() {
    // Состояние статистики игры с автоматическим сохранением
    const [gameStats, setGameStats, statsLoading, statsError] = useLocalStorage<GameStats>('gameStats', {
        highScore: 0,
        totalGamesPlayed: 0,
        totalScore: 0,
        bestStreak: 0,
        currentStreak: 0,
    });

    // Состояние настроек игры
    const [gameSettings, setGameSettings, settingsLoading, settingsError] = useLocalStorage<GameSettings>('gameSettings', {
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        difficulty: 'medium',
    });

    // Состояние прогресса игрока
    const [gameProgress, setGameProgress, progressLoading, progressError] = useLocalStorage<GameProgress>('gameProgress', {
        level: 1,
        experience: 0,
        coins: 0,
        unlockedCharacters: ['default'],
        selectedCharacter: 'default',
    });

    // Локальное состояние для текущей игровой сессии
    const [currentGame, setCurrentGame] = useState({
        score: 0,
        isPlaying: false,
        gameOver: false,
        startTime: 0,
    });

    // Ref для отслеживания изменений без лишних ререндеров
    const lastUpdateRef = useRef<number>(0);

    /**
     * Обновляет статистику после завершения игры
     * @param finalScore - финальный счет игры
     */
    const updateGameStats = useCallback(async (finalScore: number) => {
        const now = Date.now();
        
        // Предотвращаем слишком частые обновления (не чаще раза в секунду)
        if (now - lastUpdateRef.current < 1000) {
            return;
        }
        lastUpdateRef.current = now;

        setGameStats(prevStats => {
            const newStats = {
                ...prevStats,
                highScore: Math.max(prevStats.highScore, finalScore),
                totalGamesPlayed: prevStats.totalGamesPlayed + 1,
                totalScore: prevStats.totalScore + finalScore,
                currentStreak: finalScore > 0 ? prevStats.currentStreak + 1 : 0,
                bestStreak: Math.max(prevStats.bestStreak, prevStats.currentStreak + (finalScore > 0 ? 1 : 0)),
            };

            // Обновляем опыт и уровень на основе счета
            updateExperience(finalScore);
            
            return newStats;
        });
    }, [setGameStats]);

    /**
     * Обновляет опыт и уровень игрока
     * @param score - полученные очки
     */
    const updateExperience = useCallback((score: number) => {
        const experienceGain = Math.floor(score * 10); // 10 опыта за очко
        
        setGameProgress(prevProgress => {
            const newExperience = prevProgress.experience + experienceGain;
            const newLevel = Math.floor(newExperience / 1000) + 1; // Новый уровень каждые 1000 опыта
            
            return {
                ...prevProgress,
                experience: newExperience,
                level: newLevel,
                coins: prevProgress.coins + Math.floor(score / 10), // 1 монета за 10 очков
            };
        });
    }, [setGameProgress]);

    /**
     * Начинает новую игровую сессию
     */
    const startGame = useCallback(() => {
        setCurrentGame({
            score: 0,
            isPlaying: true,
            gameOver: false,
            startTime: Date.now(),
        });
    }, []);

    /**
     * Завершает текущую игровую сессию
     * @param finalScore - финальный счет
     */
    const endGame = useCallback((finalScore: number) => {
        setCurrentGame(prev => ({
            ...prev,
            isPlaying: false,
            gameOver: true,
            score: finalScore,
        }));

        // Обновляем статистику
        updateGameStats(finalScore);
    }, [updateGameStats]);

    /**
     * Обновляет счет во время игры
     * @param newScore - новый счет
     */
    const updateScore = useCallback((newScore: number) => {
        setCurrentGame(prev => ({
            ...prev,
            score: newScore,
        }));
    }, []);

    /**
     * Сбрасывает текущую игру
     */
    const resetGame = useCallback(() => {
        setCurrentGame({
            score: 0,
            isPlaying: false,
            gameOver: false,
            startTime: 0,
        });
    }, []);

    /**
     * Обновляет настройки игры
     * @param newSettings - новые настройки
     */
    const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
        setGameSettings(prev => ({
            ...prev,
            ...newSettings,
        }));
    }, [setGameSettings]);

    /**
     * Разблокирует нового персонажа
     * @param characterId - ID персонажа
     */
    const unlockCharacter = useCallback((characterId: string) => {
        setGameProgress(prev => {
            if (prev.unlockedCharacters.includes(characterId)) {
                return prev; // Персонаж уже разблокирован
            }
            
            return {
                ...prev,
                unlockedCharacters: [...prev.unlockedCharacters, characterId],
            };
        });
    }, [setGameProgress]);

    /**
     * Выбирает персонажа для игры
     * @param characterId - ID персонажа
     */
    const selectCharacter = useCallback((characterId: string) => {
        setGameProgress(prev => ({
            ...prev,
            selectedCharacter: characterId,
        }));
    }, [setGameProgress]);

    /**
     * Тратит монеты
     * @param amount - количество монет
     * @returns true если транзакция успешна, false если недостаточно монет
     */
    const spendCoins = useCallback((amount: number): boolean => {
        if (gameProgress.coins < amount) {
            return false; // Недостаточно монет
        }

        setGameProgress(prev => ({
            ...prev,
            coins: prev.coins - amount,
        }));

        return true;
    }, [gameProgress.coins, setGameProgress]);

    // Состояние загрузки (любой из источников данных)
    const loading = statsLoading || settingsLoading || progressLoading;
    
    // Ошибки (любой из источников данных)
    const error = statsError || settingsError || progressError;

    return {
        // Состояние
        gameStats,
        gameSettings,
        gameProgress,
        currentGame,
        loading,
        error,
        
        // Действия
        startGame,
        endGame,
        updateScore,
        resetGame,
        updateSettings,
        unlockCharacter,
        selectCharacter,
        spendCoins,
        updateGameStats,
    };
}

export default useGameState;
