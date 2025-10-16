// app/game.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import Bonus from '../components/Bonus';
import Obstacle from '../components/Obstacle';
import Player from '../components/Player';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomText from '../components/ui/CustomText';
import { useGame } from '../context/GameContext';
import useGameLoop from '../hooks/useGameLoop';
import SpaceGameEngine, { GameState } from '../services/gameEngine';
import { gameStyles } from './game.styles';

const GameScreen = () => {
    const [gameEngine, setGameEngine] = useState<SpaceGameEngine | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showGameOver, setShowGameOver] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [gamePhase, setGamePhase] = useState<'idle' | 'countdown' | 'playing' | 'gameOver'>('idle');

    const gameEngineRef = useRef<SpaceGameEngine | null>(null);
    const { recordGameSession, updateHighScore, addCoins, gameData, playSound, switchToGameMusic, switchToMenuMusic, vibrate } = useGame();

    // Безопасное получение highScore
    const currentHighScore = gameData?.highScore || 0;

    // Переключаем музыку при входе/выходе с экрана
    useFocusEffect(
        React.useCallback(() => {
            // При входе на экран игры включаем игровую музыку
            switchToGameMusic();

            return () => {
                // При выходе с экрана игры включаем музыку меню
                switchToMenuMusic();
            };
        }, [switchToGameMusic, switchToMenuMusic])
    );

    const handleGameOver = useCallback((score: number, coins: number) => {
        console.log('GAME SCREEN: Game Over received - Score:', score, 'Coins:', coins);

        // НЕМЕДЛЕННО останавливаем игру
        setIsRunning(false);
        setFinalScore(score);
        setShowGameOver(true);
        setGamePhase('gameOver');

        // Звук окончания игры
        playSound('game_over');
        vibrate('heavy');

        // Сохраняем статистику и обновляем рекорд
        if (gameEngineRef.current) {
            const sessionData = gameEngineRef.current.getSessionData();
            console.log('GAME SCREEN: Saving session data:', sessionData);

            recordGameSession(sessionData);

            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Всегда обновляем рекорд
            if (score > currentHighScore) {
                console.log('New high score!', score, '>', currentHighScore);
                updateHighScore(score);
            }

            if (coins > 0) {
                addCoins(coins);
            }
        }
    }, [recordGameSession, updateHighScore, addCoins, currentHighScore, playSound, vibrate]);

    const handleScoreUpdate = useCallback((score: number, coins: number) => {
        setGameState(prev => prev ? ({ ...prev, score, coins }) : null);
    }, []);

    const handleSoundPlay = useCallback((soundName: string) => {
        playSound(soundName);
    }, [playSound]);

    const handleVibrate = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning') => {
        vibrate(type);
    }, [vibrate]);

    // Инициализация игрового движка
    useEffect(() => {
        const newGameEngine = new SpaceGameEngine(
            handleGameOver,
            handleScoreUpdate,
            handleSoundPlay,
            handleVibrate
        );
        gameEngineRef.current = newGameEngine;
        setGameEngine(newGameEngine);
        setGameState(newGameEngine.getInitialState());
        setGamePhase('idle'); // Начинаем в режиме ожидания

        return () => {
            gameEngineRef.current = null;
        };
    }, [handleGameOver, handleScoreUpdate, handleSoundPlay, handleVibrate]);

    const updateGame = useCallback((deltaTime: number) => {
        if (gameEngineRef.current && isRunning && gamePhase === 'playing') {
            gameEngineRef.current.update(deltaTime);
            setGameState({ ...gameEngineRef.current.getCurrentState() });
        }
    }, [isRunning, gamePhase]);

    const { resetLoop } = useGameLoop({ onUpdate: updateGame, isRunning });

    const startNewGame = () => {
        if (gameEngineRef.current) {
            console.log('Starting new game...');
            setShowGameOver(false);
            setFinalScore(0);
            setCountdown(3);
            setGamePhase('countdown');
            setIsRunning(false);
            resetLoop();
        }
    };

    const handleGameStart = () => {
        if (gameEngineRef.current && countdown === 0 && gamePhase === 'countdown') {
            console.log('Game starting now!');
            gameEngineRef.current.startGame();
            setIsRunning(true);
            setGamePhase('playing');
        }
    };

    const restartGame = () => {
        if (gameEngineRef.current) {
            console.log('Restarting game...');
            gameEngineRef.current.resetGame();
            setGameState(gameEngineRef.current.getInitialState());
            startNewGame();
        }
    };

    const handleTap = () => {
        if (showGameOver) {
            return; // Игнорируем тапы на экране game over
        }

        if (gamePhase === 'idle') {
            // Первый тап - начинаем обратный отсчет
            vibrate('medium'); // Вибрация при начале игры
            startNewGame();
        } else if (gamePhase === 'playing' && gameEngineRef.current) {
            // Во время игры - прыжок (звук прыжка воспроизводится внутри gameEngine)
            gameEngineRef.current.jump();
        }
    };

    // Обратный отсчет
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (gamePhase === 'countdown' && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
                // Вибрация при отсчете
                if (countdown > 1) {
                    vibrate('light');
                }
            }, 1000);
        } else if (gamePhase === 'countdown' && countdown === 0) {
            vibrate('medium'); // Вибрация при старте
            handleGameStart();
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown, gamePhase, vibrate]);

    if (!gameState) {
        return (
            <BackgroundWithStars>
                <CustomText style={gameStyles.loadingText}>Загрузка...</CustomText>
            </BackgroundWithStars>
        );
    }

    return (
        <BackgroundWithStars>
            <View style={gameStyles.fullScreen}>
                {/* HUD */}
                <CustomText style={gameStyles.scoreText}>
                    Счет: {gameState.score} | Монеты: {gameState.coins}
                </CustomText>

                {/* Активные бонусы */}
                {gameState.activeBonuses.shield && (
                    <CustomText style={{ position: 'absolute', top: 100, left: 20, color: 'cyan' }}>
                        Щит активен!
                    </CustomText>
                )}
                {gameState.activeBonuses.magnet && (
                    <CustomText style={{ position: 'absolute', top: 130, left: 20, color: 'yellow' }}>
                        Магнит активен!
                    </CustomText>
                )}
                {gameState.activeBonuses.slowmo && (
                    <CustomText style={{ position: 'absolute', top: 160, left: 20, color: 'purple' }}>
                        Замедление!
                    </CustomText>
                )}

                {/* Экран начала игры */}
                {gamePhase === 'idle' && (
                    <TouchableWithoutFeedback onPress={handleTap}>
                        <View style={gameStyles.tapToStartContainer}>
                            <CustomText style={gameStyles.tapToStart}>
                                Нажмите, чтобы начать
                            </CustomText>
                        </View>
                    </TouchableWithoutFeedback>
                )}

                {/* Экран завершения игры */}
                {showGameOver && (
                    <View style={gameStyles.gameOverContainer}>
                        <CustomText style={gameStyles.gameOverText}>Игра окончена!</CustomText>
                        <CustomText style={gameStyles.finalScoreText}>
                            Ваш счет: {finalScore}
                        </CustomText>
                        <CustomText style={gameStyles.highScoreText}>
                            Рекорд: {currentHighScore}
                        </CustomText>
                        <TouchableWithoutFeedback onPress={restartGame}>
                            <View style={gameStyles.restartButtonContainer}>
                                <CustomText style={gameStyles.restartButton}>
                                    Начать заново
                                </CustomText>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                )}

                {/* Обратный отсчет */}
                {gamePhase === 'countdown' && countdown > 0 && (
                    <CustomText style={gameStyles.countdownText}>{countdown}</CustomText>
                )}
                {gamePhase === 'countdown' && countdown === 0 && (
                    <CustomText style={gameStyles.countdownText}>GO!</CustomText>
                )}

                {/* Игровая область */}
                {!showGameOver && gamePhase !== 'idle' && (
                    <TouchableWithoutFeedback onPress={handleTap}>
                        <View style={gameStyles.gameArea}>
                            {/* Игрок */}
                            <Player
                                x={gameState.player.x}
                                y={gameState.player.y}
                                size={gameState.player.size}
                                rotation={gameState.player.rotation}
                                character="astronaut"
                            />

                            {/* Препятствия */}
                            {gameState.obstacles.map((obstacle) => (
                                <Obstacle
                                    key={obstacle.id}
                                    x={obstacle.x}
                                    y={obstacle.y}
                                    width={obstacle.width}
                                    height={obstacle.height}
                                    type={obstacle.type}
                                    gap={obstacle.gap}
                                />
                            ))}

                            {/* Бонусы */}
                            {gameState.bonuses.map((bonus) => (
                                <Bonus
                                    key={bonus.id}
                                    x={bonus.x}
                                    y={bonus.y}
                                    type={bonus.type}
                                    size={30}
                                />
                            ))}
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </View>
        </BackgroundWithStars>
    );
};

export default GameScreen;