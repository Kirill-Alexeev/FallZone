// services/gameEngine.ts

export interface PlayerState {
    x: number;
    y: number;
    velocityY: number;
    size: number;
    rotation: number;
}

export interface ObstacleState {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'comet' | 'asteroid' | 'drone' | 'wall';
    id: string;
    passed?: boolean;
    gap?: number;
    trajectory?: { x: number; y: number }[];
    speed?: number;
    trajectoryIndex?: number;
    outOfBoundsTime?: number; // Время когда препятствие вышло за границы
}

export interface BonusState {
    x: number;
    y: number;
    type: 'shield' | 'magnet' | 'slowmo' | 'coin';
    id: string;
    collected?: boolean;
}

export interface GameState {
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
    gameSpeed: number;
}

export interface SessionData {
    score: number;
    coins: number;
    playTime: number;
    tapCount: number;
    deathBy?: 'comet' | 'asteroid' | 'drone' | 'wall';
    bonusesCollected?: { type: 'shield' | 'magnet' | 'slowmo' | 'coin'; count: number }[];
}

class SpaceGameEngine {
    private state: GameState;
    private onGameOver: (score: number, coins: number) => void;
    private onScoreUpdate: (score: number, coins: number) => void;
    private onSoundPlay?: (soundName: string) => void;
    private onVibrate?: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning') => void;

    // Таймеры
    private obstacleSpawnTimer: number = 0;
    private bonusSpawnTimer: number = 0;
    private bonusTimers: { [key: string]: number } = {};

    // Статистика сессии
    private tapCount: number = 0;
    private gameStartTime: number = 0;
    private playTime: number = 0;
    private lastObstacleCollision: 'comet' | 'asteroid' | 'drone' | 'wall' | null = null;
    private collectedBonuses: { type: 'shield' | 'magnet' | 'slowmo' | 'coin'; count: number }[] = [
        { type: 'shield', count: 0 },
        { type: 'magnet', count: 0 },
        { type: 'slowmo', count: 0 },
        { type: 'coin', count: 0 }
    ];

    // Константы
    private readonly screenWidth: number = 400;
    private readonly screenHeight: number = 800;
    private readonly GRAVITY = 0.4;
    private readonly JUMP_STRENGTH = -10;
    private readonly BASE_SPEED = 2; // Уменьшили базовую скорость с 3 до 2
    private readonly PLAYER_SIZE = 40;

    private readonly BONUS_DURATION = {
        shield: 3000,
        magnet: 5000,
        slowmo: 2000
    };

    private readonly OBSTACLE_REMOVAL_DELAY = 3000; // 3 секунды задержки перед удалением

    // Флаг для предотвращения повторных вызовов game over
    private gameOverCalled: boolean = false;

    constructor(
        onGameOver: (score: number, coins: number) => void,
        onScoreUpdate: (score: number, coins: number) => void,
        onSoundPlay?: (soundName: string) => void,
        onVibrate?: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning') => void
    ) {
        this.onGameOver = onGameOver;
        this.onScoreUpdate = onScoreUpdate;
        this.onSoundPlay = onSoundPlay;
        this.onVibrate = onVibrate;
        this.state = this.getInitialState();
    }

    getInitialState(): GameState {
        return {
            player: {
                x: 100,
                y: this.screenHeight / 2 - this.PLAYER_SIZE / 2,
                velocityY: 0,
                size: this.PLAYER_SIZE,
                rotation: 0,
            },
            obstacles: [],
            bonuses: [],
            score: 0,
            coins: 0,
            gameOver: false,
            gameStarted: false,
            activeBonuses: {
                shield: false,
                magnet: false,
                slowmo: false,
            },
            gameSpeed: 1.0,
        };
    }

    startGame() {
        this.state = this.getInitialState();
        this.state.gameStarted = true;
        this.state.gameOver = false;
        this.gameOverCalled = false;

        // Сбрасываем статистику сессии
        this.tapCount = 0;
        this.gameStartTime = Date.now();
        this.playTime = 0;
        this.lastObstacleCollision = null;
        this.collectedBonuses = [
            { type: 'shield', count: 0 },
            { type: 'magnet', count: 0 },
            { type: 'slowmo', count: 0 },
            { type: 'coin', count: 0 }
        ];

        this.onScoreUpdate(this.state.score, this.state.coins);
    }

    jump() {
        if (!this.state.gameOver && this.state.gameStarted) {
            this.state.player.velocityY = this.JUMP_STRENGTH;
            this.tapCount++;
            this.onSoundPlay?.('jump');
        }
    }

    update(deltaTime: number) {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не обновляем игру если она завершена
        if (this.state.gameOver || !this.state.gameStarted) {
            return;
        }

        this.playTime += deltaTime;

        this.updatePlayer(deltaTime);
        this.updateObstacles(deltaTime);
        this.updateBonuses(deltaTime);
        this.updateBonusesTimers(deltaTime);
        this.spawnObjects(deltaTime);
        this.checkCollisions();
        this.updateScore();
        this.increaseDifficulty();
    }

    private updatePlayer(deltaTime: number) {
        const gravity = this.state.activeBonuses.slowmo ? this.GRAVITY * 0.3 : this.GRAVITY;
        this.state.player.velocityY += gravity;
        this.state.player.y += this.state.player.velocityY;

        this.state.player.rotation = Math.max(-30, Math.min(30, this.state.player.velocityY * 3));

        // Проверка границ экрана
        if (this.state.player.y < 0 || this.state.player.y + this.state.player.size > this.screenHeight) {
            if (!this.state.activeBonuses.shield) {
                this.endGame();
            } else {
                // Отскок при щите
                if (this.state.player.y < 0) {
                    this.state.player.y = 0;
                    this.state.player.velocityY = Math.abs(this.state.player.velocityY) * 0.5;
                } else {
                    this.state.player.y = this.screenHeight - this.state.player.size;
                    this.state.player.velocityY = -Math.abs(this.state.player.velocityY) * 0.5;
                }
            }
        }
    }

    private updateObstacles(deltaTime: number) {
        const speed = this.BASE_SPEED * this.state.gameSpeed * (this.state.activeBonuses.slowmo ? 0.5 : 1);

        // Оптимизированное обновление препятствий
        for (let i = this.state.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.state.obstacles[i];

            switch (obstacle.type) {
                case 'comet':
                    obstacle.y += speed * 1.2; // Уменьшенная скорость
                    obstacle.x -= speed * 0.3; // Уменьшенное горизонтальное движение
                    break;
                case 'asteroid':
                    obstacle.x -= speed;
                    break;
                case 'drone':
                    if (obstacle.trajectory && obstacle.trajectoryIndex !== undefined) {
                        const point = obstacle.trajectory[obstacle.trajectoryIndex];
                        const dx = point.x - obstacle.x;
                        const dy = point.y - obstacle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < speed) {
                            obstacle.trajectoryIndex = (obstacle.trajectoryIndex + 1) % obstacle.trajectory.length;
                        } else {
                            obstacle.x += (dx / distance) * speed;
                            obstacle.y += (dy / distance) * speed;
                        }
                    }
                    break;
                case 'wall':
                    obstacle.x -= speed;
                    break;
            }

            // РАЗДЕЛЬНАЯ ПРОВЕРКА ДЛЯ КАЖДОГО ТИПА ПРЕПЯТСТВИЙ
            let isOutOfBounds = false;

            switch (obstacle.type) {
                case 'comet':
                    // Комету удаляем если ушла за нижнюю границу
                    isOutOfBounds = obstacle.y > this.screenHeight + 100;
                    break;
                case 'asteroid':
                    // Астероид удаляем если ушел за левую границу
                    isOutOfBounds = obstacle.x + obstacle.width < -50;
                    break;
                case 'drone':
                    // Дрона удаляем если прошел достаточно далеко за левую границу
                    // ИЛИ если он завершил свою траекторию и ушел за границы
                    const hasCompletedTrajectory = obstacle.trajectory &&
                        obstacle.trajectoryIndex !== undefined &&
                        obstacle.trajectoryIndex === obstacle.trajectory.length - 1 &&
                        obstacle.x < -100;

                    isOutOfBounds = obstacle.x + obstacle.width < -100 || hasCompletedTrajectory!;
                    break;
                case 'wall':
                    // Стену удаляем если ушла за левую границу
                    isOutOfBounds = obstacle.x + obstacle.width < -50;
                    break;
            }

            if (isOutOfBounds) {
                this.state.obstacles.splice(i, 1);
            }
        }
    }

    private updateBonuses(deltaTime: number) {
        const speed = this.BASE_SPEED * this.state.gameSpeed * (this.state.activeBonuses.slowmo ? 0.5 : 1);

        this.state.bonuses.forEach(bonus => {
            if (!bonus.collected) {
                bonus.x -= speed;

                // Магнит для монет
                if (this.state.activeBonuses.magnet && bonus.type === 'coin') {
                    const dx = this.state.player.x - bonus.x;
                    const dy = this.state.player.y - bonus.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 200) {
                        const force = 5;
                        bonus.x += (dx / distance) * force;
                        bonus.y += (dy / distance) * force;
                    }
                }
            }
        });

        this.state.bonuses = this.state.bonuses.filter(bonus =>
            !bonus.collected && bonus.x + 30 > 0
        );
    }

    private spawnObjects(deltaTime: number) {
        this.obstacleSpawnTimer += deltaTime;
        this.bonusSpawnTimer += deltaTime;

        // Увеличиваем частоту спавна препятствий и ограничиваем их количество
        const obstacleSpawnRate = Math.max(1000, 1500 - this.state.score * 8); // Быстрее спавн
        const maxObstaclesOnScreen = 4; // Максимум 8 препятствий на экране

        if (this.obstacleSpawnTimer > obstacleSpawnRate && this.state.obstacles.length < maxObstaclesOnScreen) {
            this.spawnRandomObstacle();
            this.obstacleSpawnTimer = 0;
        }

        if (this.bonusSpawnTimer > 5000) {
            this.spawnRandomBonus();
            this.bonusSpawnTimer = 0;
        }
    }

    private spawnRandomObstacle() {
        const types: ObstacleState['type'][] = ['comet', 'asteroid', 'drone', 'wall'];
        const weights = [0.15, 0.4, 0.25, 0.2];
        const random = Math.random();
        let type: ObstacleState['type'] = 'asteroid';

        if (random < weights[0]) type = 'comet';
        else if (random < weights[0] + weights[1]) type = 'asteroid';
        else if (random < weights[0] + weights[1] + weights[2]) type = 'drone';
        else type = 'wall';

        let obstacle: ObstacleState;

        switch (type) {
            case 'comet':
                obstacle = {
                    x: Math.random() * (this.screenWidth - 100),
                    y: -100,
                    width: 35,
                    height: 35,
                    type: 'comet',
                    id: Math.random().toString(),
                };
                break;
            case 'asteroid':
                obstacle = {
                    x: this.screenWidth,
                    y: Math.random() * (this.screenHeight - 150) + 50,
                    width: 50,
                    height: 50,
                    type: 'asteroid',
                    id: Math.random().toString(),
                };
                break;
            case 'drone':
                const startY = Math.random() * (this.screenHeight - 100) + 50;
                // Упрощаем траекторию - только движение влево с небольшими отклонениями
                obstacle = {
                    x: this.screenWidth,
                    y: startY,
                    width: 45,
                    height: 25,
                    type: 'drone',
                    id: Math.random().toString(),
                    trajectory: [
                        { x: this.screenWidth - 200, y: startY },
                        { x: this.screenWidth - 400, y: startY + 60 },
                        { x: this.screenWidth - 600, y: startY - 40 }, // Финальная точка за экраном
                    ],
                    trajectoryIndex: 0,
                };
                break;
            case 'wall':
                const minGap = 180;
                const maxGap = 220;
                const gapSize = minGap + Math.random() * (maxGap - minGap);
                const minWallHeight = 80;
                const maxAvailableHeight = this.screenHeight - gapSize - minWallHeight;
                const topWallHeight = minWallHeight + Math.random() * maxAvailableHeight;

                obstacle = {
                    x: this.screenWidth,
                    y: 0,
                    width: 70,
                    height: topWallHeight,
                    type: 'wall',
                    id: Math.random().toString(),
                    gap: gapSize,
                };
                break;
        }

        this.state.obstacles.push(obstacle);
    }

    private isPositionOccupied(x: number, y: number, size: number = 30): boolean {
        // Проверяем пересечение с препятствиями
        for (const obstacle of this.state.obstacles) {
            const obstacleLeft = obstacle.x;
            const obstacleRight = obstacle.x + (obstacle.width || 0);
            const obstacleTop = obstacle.y;
            const obstacleBottom = obstacle.y + (obstacle.height || 0);

            const bonusLeft = x;
            const bonusRight = x + size;
            const bonusTop = y;
            const bonusBottom = y + size;

            if (bonusRight > obstacleLeft &&
                bonusLeft < obstacleRight &&
                bonusBottom > obstacleTop &&
                bonusTop < obstacleBottom) {
                return true; // Позиция занята препятствием
            }
        }
        return false;
    }

    private spawnRandomBonus() {
        const types: BonusState['type'][] = ['shield', 'magnet', 'slowmo', 'coin'];
        const type = types[Math.floor(Math.random() * types.length)];

        let attempts = 0;
        let x: number, y: number;

        // Пытаемся найти свободную позицию (максимум 10 попыток)
        do {
            x = this.screenWidth;
            y = Math.random() * (this.screenHeight - 50);
            attempts++;
        } while (this.isPositionOccupied(x, y, 30) && attempts < 10);

        // Если не нашли свободную позицию после 10 попыток, не спавним бонус
        if (attempts >= 10) {
            return;
        }

        const bonus: BonusState = {
            x: x,
            y: y,
            type,
            id: Math.random().toString(),
        };

        this.state.bonuses.push(bonus);
    }

    private checkCollisions() {
        const player = this.state.player;

        // Столкновения с препятствиями
        for (const obstacle of this.state.obstacles) {
            if (this.checkCollision(player, obstacle)) {
                if (!this.state.activeBonuses.shield) {
                    this.lastObstacleCollision = obstacle.type;
                    this.onSoundPlay?.('obstacle_hit');
                    this.onVibrate?.('heavy');
                    this.endGame();
                    return;
                } else {
                    obstacle.passed = true;
                }
            }
        }

        // Сбор бонусов
        for (const bonus of this.state.bonuses) {
            if (!bonus.collected && this.checkCollision(player, bonus)) {
                this.collectBonus(bonus);
            }
        }
    }

    private checkCollision(player: PlayerState, object: any): boolean {
        const playerLeft = player.x;
        const playerRight = player.x + player.size;
        const playerTop = player.y;
        const playerBottom = player.y + player.size;

        const objectLeft = object.x;
        const objectRight = object.x + (object.width || 30);
        const objectTop = object.y;
        const objectBottom = object.y + (object.height || 30);

        if (object.type === 'wall') {
            const gapStart = object.height;
            const gapEnd = object.height + (object.gap || 0);

            const horizontalOverlap = playerRight > objectLeft && playerLeft < objectRight;

            if (horizontalOverlap) {
                const playerInGap = playerBottom > gapStart && playerTop < gapEnd;
                if (!playerInGap) {
                    return true;
                }
                const playerFitsInGap = (playerBottom - playerTop) <= (gapEnd - gapStart);
                if (!playerFitsInGap) {
                    return true;
                }
            }
            return false;
        }

        return playerRight > objectLeft &&
            playerLeft < objectRight &&
            playerBottom > objectTop &&
            playerTop < objectBottom;
    }

    private collectBonus(bonus: BonusState) {
        bonus.collected = true;

        // Обновляем статистику бонусов
        const bonusType = this.collectedBonuses.find(b => b.type === bonus.type);
        if (bonusType) {
            bonusType.count++;
        }

        // Звуки и вибрация
        if (bonus.type === 'coin') {
            this.onSoundPlay?.('coin_collect');
            this.onVibrate?.('light');
        } else {
            this.onSoundPlay?.('bonus_collect');
            this.onVibrate?.('medium');
        }

        switch (bonus.type) {
            case 'shield':
                this.activateBonus('shield');
                break;
            case 'magnet':
                this.activateBonus('magnet');
                break;
            case 'slowmo':
                this.activateBonus('slowmo');
                break;
            case 'coin':
                this.state.coins += 1;
                break;
        }

        this.onScoreUpdate(this.state.score, this.state.coins);
    }

    private activateBonus(type: 'shield' | 'magnet' | 'slowmo') {
        this.state.activeBonuses[type] = true;
        this.bonusTimers[type] = this.BONUS_DURATION[type];
    }

    private updateBonusesTimers(deltaTime: number) {
        Object.keys(this.bonusTimers).forEach(type => {
            this.bonusTimers[type] -= deltaTime;
            if (this.bonusTimers[type] <= 0) {
                this.state.activeBonuses[type as keyof typeof this.state.activeBonuses] = false;
                delete this.bonusTimers[type];
            }
        });
    }

    private updateScore() {
        const oldScore = this.state.score;

        this.state.obstacles.forEach(obstacle => {
            if (!obstacle.passed && this.state.player.x > obstacle.x + (obstacle.width || 0)) {
                obstacle.passed = true;
                this.state.score += 1;
            }
        });

        if (this.state.score !== oldScore) {
            this.onScoreUpdate(this.state.score, this.state.coins);
        }
    }

    private increaseDifficulty() {
        // Более плавное увеличение сложности
        this.state.gameSpeed = 1.0 + Math.floor(this.state.score / 15) * 0.05;
    }

    private endGame() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Вызываем game over только один раз
        if (this.gameOverCalled) {
            return;
        }

        this.state.gameOver = true;
        this.gameOverCalled = true;

        console.log('ENGINE: Game Over triggered with score:', this.state.score);

        // Вызываем колбэк с финальными результатами
        this.onGameOver(this.state.score, this.state.coins);
    }

    getSessionData(): SessionData {
        const sessionData: SessionData = {
            score: this.state.score,
            coins: this.state.coins,
            playTime: Math.floor(this.playTime),
            tapCount: this.tapCount,
            bonusesCollected: this.collectedBonuses.filter(b => b.count > 0)
        };

        if (this.lastObstacleCollision) {
            sessionData.deathBy = this.lastObstacleCollision;
        }

        return sessionData;
    }

    getCurrentState(): GameState {
        return this.state;
    }

    resetGame() {
        this.state = this.getInitialState();
        this.gameOverCalled = false;
    }
}

export default SpaceGameEngine;