import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import Obstacle from '../components/Obstacle';
import Player from '../components/Player';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomText from '../components/ui/CustomText';
import useGameLoop from '../hooks/useGameLoop';
import SpaceGameEngine from '../services/gameEngine';
import { gameStyles } from './game.styles';

// Типы для игры
interface PlayerState {
    x: number;
    y: number;
    velocityY: number;
    size: number;
    rotation: number;
}

interface ObstacleState {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'comet' | 'asteroid' | 'drone' | 'wall';
    id: string;
    passed?: boolean;
    gap?: number; // Для стен с отверстиями
    trajectory?: { x: number; y: number }[]; // Для движения по траектории
    speed?: number;
}

interface BonusState {
    x: number;
    y: number;
    type: 'shield' | 'magnet' | 'slowmo' | 'coin';
    id: string;
    collected?: boolean;
}

interface GameState {
    player: PlayerState;
    obstacles: ObstacleState[];
    bonuses: BonusState[];
    score: number;
    coins: number;
    gameOver: boolean;
    gameStarted: boolean;
    activeBonuses: {
        shield: boolean;
        magnet: boolean;
        slowmo: boolean;
    };
}

const GameScreen = () => {
    const [gameEngine, setGameEngine] = useState<SpaceGameEngine | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    const gameEngineRef = useRef<SpaceGameEngine | null>(null);

    const handleGameOver = useCallback((score: number, coins: number) => {
        setIsRunning(false);
        setCountdown(0);
        // Сохраняем рекорд и монеты
        console.log('Game Over - Score:', score, 'Coins:', coins);
    }, []);

    const handleScoreUpdate = useCallback((score: number, coins: number) => {
        setGameState(prev => prev ? ({ ...prev, score, coins }) : null);
    }, []);

    useEffect(() => {
        const newGameEngine = new SpaceGameEngine(handleGameOver, handleScoreUpdate);
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
            setGameStarted(true);
            setIsRunning(false);
            setCountdown(3);
            resetLoop();
        }
    };

    const restartGame = () => {
        if (gameEngine) {
            setGameStarted(true);
            setIsRunning(false);
            setCountdown(3);
            gameEngine.resetGame();
            const newState = gameEngine.getInitialState();
            setGameState(newState);
            resetLoop();
        }
    };

    const handleTap = () => {
        if (!isRunning && !gameState?.gameStarted && countdown === 0 && !gameState?.gameOver) {
            startGame();
        } else if (isRunning && gameEngine) {
            gameEngine.jump();
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (countdown === 0 && !isRunning && gameEngine && gameState && !gameState.gameOver && gameStarted) {
            gameEngine.startGame();
            setIsRunning(true);
        }
        return () => clearTimeout(timer);
    }, [countdown, isRunning, gameEngine, gameState, gameStarted]);

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
                {!gameState.gameStarted && !gameState.gameOver && countdown === 0 && !gameStarted && (
                    <TouchableWithoutFeedback onPress={handleTap}>
                        <CustomText style={gameStyles.tapToStart}>
                            Нажмите, чтобы начать
                        </CustomText>
                    </TouchableWithoutFeedback>
                )}

                {/* Экран завершения игры */}
                {gameState.gameOver && (
                    <>
                        <CustomText style={gameStyles.gameOverText}>Игра окончена!</CustomText>
                        <CustomText style={gameStyles.finalScoreText}>
                            Ваш счет: {gameState.score}
                        </CustomText>
                        <TouchableWithoutFeedback onPress={restartGame}>
                            <View style={gameStyles.restartButtonContainer}>
                                <CustomText style={gameStyles.restartButton}>
                                    Начать заново
                                </CustomText>
                            </View>
                        </TouchableWithoutFeedback>
                    </>
                )}

                {/* Обратный отсчет */}
                {countdown > 0 && (
                    <CustomText style={gameStyles.countdownText}>{countdown}</CustomText>
                )}
                {countdown === 0 && gameState?.gameStarted && !isRunning && !gameState.gameOver && (
                    <CustomText style={gameStyles.countdownText}>GO!</CustomText>
                )}

                {/* Игровая область */}
                {!gameState.gameOver && (
                    <TouchableWithoutFeedback onPress={handleTap} style={gameStyles.gameArea}>
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
                            {gameState.obstacles.map(obstacle => (
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
                            {gameState.bonuses.map(bonus => (
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