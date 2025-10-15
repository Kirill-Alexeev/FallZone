// app/game.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

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
    const { recordGameSession, updateHighScore, addCoins, gameData } = useGame();

    const handleGameOver = useCallback((score: number, coins: number) => {
        console.log('GAME SCREEN: Game Over received - Score:', score, 'Coins:', coins);

        // НЕМЕДЛЕННО останавливаем игру
        setIsRunning(false);
        setFinalScore(score);
        setShowGameOver(true);
        setGamePhase('gameOver');

        // Сохраняем статистику и обновляем рекорд
        if (gameEngineRef.current) {
            const sessionData = gameEngineRef.current.getSessionData();
            console.log('GAME SCREEN: Saving session data:', sessionData);

            recordGameSession(sessionData);

            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Всегда обновляем рекорд
            if (score > gameData.highScore) {
                console.log('New high score!', score, '>', gameData.highScore);
                updateHighScore(score);
            }

            if (coins > 0) {
                addCoins(coins);
            }
        }
    }, [recordGameSession, updateHighScore, addCoins, gameData.highScore]);

    const handleScoreUpdate = useCallback((score: number, coins: number) => {
        setGameState(prev => prev ? ({ ...prev, score, coins }) : null);
    }, []);

    // Инициализация игрового движка
    useEffect(() => {
        const newGameEngine = new SpaceGameEngine(handleGameOver, handleScoreUpdate);
        gameEngineRef.current = newGameEngine;
        setGameEngine(newGameEngine);
        setGameState(newGameEngine.getInitialState());
        setGamePhase('idle'); // Начинаем в режиме ожидания

        return () => {
            gameEngineRef.current = null;
        };
    }, [handleGameOver, handleScoreUpdate]);

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
            startNewGame();
        } else if (gamePhase === 'playing' && gameEngineRef.current) {
            // Во время игры - прыжок
            gameEngineRef.current.jump();
        }
    };

    // Обратный отсчет
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (gamePhase === 'countdown' && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (gamePhase === 'countdown' && countdown === 0) {
            handleGameStart();
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown, gamePhase]);

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
                            Рекорд: {gameData.highScore}
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
                                <View
                                    key={bonus.id}
                                    style={{
                                        position: 'absolute',
                                        left: bonus.x,
                                        top: bonus.y,
                                        width: 30,
                                        height: 30,
                                        backgroundColor:
                                            bonus.type === 'shield' ? 'cyan' :
                                                bonus.type === 'magnet' ? 'yellow' :
                                                    bonus.type === 'slowmo' ? 'purple' : 'gold',
                                        borderRadius: 15,
                                    }}
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