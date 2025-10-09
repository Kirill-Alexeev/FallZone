// Основной экран игры
// Заглушка для будущей игровой механики

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Obstacle from '../components/Obstacle';
import Player from '../components/Player';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomText from '../components/ui/CustomText';
import useGameLoop from '../hooks/useGameLoop';
import GameEngine from '../services/gameEngine';

interface PlayerState {
    x: number;
    y: number;
    velocityY: number;
    size: number;
}

interface ObstacleState {
    x: number;
    y: number;
    width: number;
    height: number;
    gap: number;
    id: string;
    passed?: boolean;
}

interface GameState {
    player: PlayerState;
    obstacles: ObstacleState[];
    score: number;
    gameOver: boolean;
    gameStarted: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen = () => {
    const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [countdown, setCountdown] = useState(0); // Новое состояние для обратного отсчета
    const [gameStarted, setGameStarted] = useState(false); // Флаг для отслеживания начала игры

    const gameEngineRef = useRef<GameEngine | null>(null);

    const handleGameOver = useCallback((score: number) => {
        setIsRunning(false);
        setCountdown(0); // Сбрасываем отсчет
        // Не показываем Alert, счет будет отображаться на экране
    }, []);

    const handleScoreUpdate = useCallback((score: number) => {
        setGameState(prev => prev ? ({ ...prev, score }) : null);
    }, []);

    useEffect(() => {
        const newGameEngine = new GameEngine(handleGameOver, handleScoreUpdate, screenHeight);
        gameEngineRef.current = newGameEngine;
        setGameEngine(newGameEngine);
        setGameState(newGameEngine.getInitialState());
    }, [handleGameOver, handleScoreUpdate]);

    const updateGame = useCallback((deltaTime: number) => {
        if (gameEngineRef.current) {
            gameEngineRef.current.update(deltaTime);
            setGameState({ ...gameEngineRef.current.getCurrentState() });
        }
    }, []);

    const { resetLoop } = useGameLoop({ onUpdate: updateGame, isRunning });

    const startGame = () => {
        if (gameEngine) {
            setGameStarted(true); // Отмечаем, что игра была начата пользователем
            setIsRunning(false); // Сначала останавливаем игру
            setCountdown(3); // Начинаем отсчет с 3
            resetLoop();
        }
    };

    const restartGame = () => {
        if (gameEngine) {
            setGameStarted(true); // Отмечаем, что игра была начата пользователем
            setIsRunning(false); // Сначала останавливаем игру
            setCountdown(3); // Начинаем отсчет с 3
            gameEngine.resetGame();
            const newState = gameEngine.getInitialState();
            setGameState(newState);
            resetLoop();
        }
    };

    const handlePress = () => {
        if (!isRunning && !gameState?.gameStarted && countdown === 0 && !gameState?.gameOver) {
            startGame();
        } else if (isRunning && gameEngine) {
            gameEngine.jump();
        } else if (gameState?.gameOver) {
            // Если игра окончена, ничего не делаем при нажатии, ждем кнопки "Начать заново"
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (countdown === 0 && !isRunning && gameEngine && gameState && !gameState.gameOver && gameStarted) {
            // Когда отсчет завершен и игра была начата пользователем, запускаем игру
            gameEngine.startGame();
            setIsRunning(true);
        }
        return () => clearTimeout(timer);
    }, [countdown, isRunning, gameEngine, gameState, gameStarted]);

    if (!gameState) {
        return (
            <BackgroundWithStars>
                <CustomText style={styles.title}>Загрузка...</CustomText>
            </BackgroundWithStars>
        );
    }

    return (
        <BackgroundWithStars>
            <View style={styles.fullScreen}>
                <CustomText style={styles.scoreText}>Счет: {gameState.score}</CustomText>
                {!gameState.gameStarted && !gameState.gameOver && countdown === 0 && !gameStarted && (
                    <TouchableWithoutFeedback onPress={handlePress}>
                        <CustomText style={styles.tapToStart}>Нажмите, чтобы начать</CustomText>
                    </TouchableWithoutFeedback>
                )}
                {gameState.gameOver && (
                    <>
                        <CustomText style={styles.gameOverText}>Игра окончена!</CustomText>
                        <CustomText style={styles.finalScoreText}>Ваш счет: {gameState.score}</CustomText>
                        <TouchableWithoutFeedback onPress={restartGame}>
                            <View style={styles.restartButtonContainer}>
                                <CustomText style={styles.restartButton}>Начать заново</CustomText>
                            </View>
                        </TouchableWithoutFeedback>
                    </>
                )}
                {countdown > 0 && (
                    <CustomText style={styles.countdownText}>{countdown}</CustomText>
                )}
                {countdown === 0 && gameState?.gameStarted && !isRunning && !gameState.gameOver && (
                    <CustomText style={styles.countdownText}>GO!</CustomText>
                )}

                {!gameState.gameOver && (
                    <TouchableWithoutFeedback onPress={handlePress} style={styles.gameArea}>
                        <View style={styles.gameArea}>
                            <Player
                                x={gameState.player.x}
                                y={gameState.player.y}
                                size={gameState.player.size}
                                character="default"
                            />
                            {gameState.obstacles.map(obstacle => (
                                <Obstacle
                                    key={obstacle.id}
                                    x={obstacle.x}
                                    y={obstacle.y}
                                    width={obstacle.width}
                                    height={obstacle.height}
                                    gap={obstacle.gap}
                                    color="green"
                                    screenHeight={screenHeight}
                                />
                            ))}
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </View>
        </BackgroundWithStars>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
    },
    placeholder: {
        color: '#888',
        textAlign: 'center',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    fullScreen: {
        flex: 1,
        width: screenWidth,
        height: screenHeight,
        position: 'relative',
    },
    scoreText: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 30,
        width: '100%',
        textAlign: 'center',
        fontSize: 30,
        color: 'white',
        zIndex: 100,
    },
    tapToStart: {
        position: 'absolute',
        top: screenHeight / 2 - 20,
        width: '100%',
        textAlign: 'center',
        fontSize: 25,
        color: 'yellow',
        zIndex: 100,
    },
    gameOverText: {
        position: 'absolute',
        top: screenHeight / 2 - 50,
        width: '100%',
        textAlign: 'center',
        fontSize: 40,
        color: 'red',
        fontWeight: 'bold',
        zIndex: 100,
    },
    countdownText: {
        position: 'absolute',
        top: screenHeight / 2 - 20,
        width: '100%',
        textAlign: 'center',
        fontSize: 80,
        color: 'white',
        fontWeight: 'bold',
        zIndex: 200,
    },
    restartButton: {
        fontSize: 30,
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    restartButtonContainer: {
        position: 'absolute',
        top: screenHeight / 2 + 60,
        left: 0,
        right: 0,
        padding: 20,
        zIndex: 200,
    },
    finalScoreText: {
        position: 'absolute',
        top: screenHeight / 2 + 20,
        width: '100%',
        textAlign: 'center',
        fontSize: 25,
        color: 'yellow',
        fontWeight: 'bold',
        zIndex: 200,
    },
    gameArea: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default GameScreen;