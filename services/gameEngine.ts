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
    gap?: number;
    trajectory?: { x: number; y: number }[];
    speed?: number;
    trajectoryIndex?: number;
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
    gameSpeed: number;
}

class SpaceGameEngine {
    private state: GameState;
    private onGameOver: (score: number, coins: number) => void;
    private onScoreUpdate: (score: number, coins: number) => void;
    private obstacleSpawnTimer: number = 0;
    private bonusSpawnTimer: number = 0;
    private bonusTimers: { [key: string]: number } = {};
    private readonly screenWidth: number = 400;
    private readonly screenHeight: number = 800;

    // Константы игры
    private readonly GRAVITY = 0.4;
    private readonly JUMP_STRENGTH = -10;
    private readonly BASE_SPEED = 3;
    private readonly PLAYER_SIZE = 40;

    // Время действия бонусов (в мс)
    private readonly BONUS_DURATION = {
        shield: 3000,
        magnet: 5000,
        slowmo: 2000
    };

    constructor(onGameOver: (score: number, coins: number) => void, onScoreUpdate: (score: number, coins: number) => void) {
        this.onGameOver = onGameOver;
        this.onScoreUpdate = onScoreUpdate;
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
        this.onScoreUpdate(this.state.score, this.state.coins);
    }

    jump() {
        if (!this.state.gameOver && this.state.gameStarted) {
            this.state.player.velocityY = this.JUMP_STRENGTH;
        }
    }

    update(deltaTime: number) {
        if (this.state.gameOver || !this.state.gameStarted) return;

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
        // Применяем гравитацию (уменьшаем при замедлении)
        const gravity = this.state.activeBonuses.slowmo ? this.GRAVITY * 0.3 : this.GRAVITY;
        this.state.player.velocityY += gravity;

        // Обновляем позицию
        this.state.player.y += this.state.player.velocityY;

        // Обновляем вращение в зависимости от скорости
        this.state.player.rotation = Math.max(-30, Math.min(30, this.state.player.velocityY * 3));

        // Проверка границ экрана
        if (this.state.player.y < 0 || this.state.player.y + this.state.player.size > this.screenHeight) {
            if (!this.state.activeBonuses.shield) {
                this.endGame();
            } else {
                // Отскок от границ при щите
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

        this.state.obstacles.forEach(obstacle => {
            // Движение препятствий
            switch (obstacle.type) {
                case 'comet':
                    // Кометы падают сверху
                    obstacle.y += speed * 1.5;
                    obstacle.x -= speed * 0.5;
                    break;

                case 'asteroid':
                    // Астероиды движутся навстречу
                    obstacle.x -= speed;
                    break;

                case 'drone':
                    // Дроны движутся по траектории
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
                    // Стены с отверстиями движутся навстречу
                    obstacle.x -= speed;
                    break;
            }

            // Удаление вышедших за экран препятствий
            if (obstacle.x + obstacle.width < 0 ||
                obstacle.y > this.screenHeight ||
                (obstacle.type === 'comet' && obstacle.y > this.screenHeight)) {
                obstacle.passed = true;
            }
        });

        // Фильтрация препятствий
        this.state.obstacles = this.state.obstacles.filter(obstacle =>
            !obstacle.passed && obstacle.x + obstacle.width > 0
        );
    }

    private updateBonuses(deltaTime: number) {
        const speed = this.BASE_SPEED * this.state.gameSpeed * (this.state.activeBonuses.slowmo ? 0.5 : 1);

        this.state.bonuses.forEach(bonus => {
            if (!bonus.collected) {
                bonus.x -= speed;

                // Магнит при активном бонусе
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

        // Спавн препятствий
        const obstacleSpawnRate = Math.max(1500, 2500 - this.state.score * 10); // Увеличивается с ростом счета
        if (this.obstacleSpawnTimer > obstacleSpawnRate) {
            this.spawnRandomObstacle();
            this.obstacleSpawnTimer = 0;
        }

        // Спавн бонусов
        if (this.bonusSpawnTimer > 5000) {
            this.spawnRandomBonus();
            this.bonusSpawnTimer = 0;
        }
    }

    private spawnRandomObstacle() {
        const types: ObstacleState['type'][] = ['comet', 'asteroid', 'drone', 'wall'];
        // Увеличиваем шанс появления стен и уменьшаем комет
        const weights = [0.2, 0.3, 0.2, 0.3]; // Веса для типов: comet, asteroid, drone, wall
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
                    x: Math.random() * (this.screenWidth - 100), // Не спавним слишком близко к краям
                    y: -100, // Начинаем выше экрана
                    width: 35, // Уменьшаем размер
                    height: 35,
                    type: 'comet',
                    id: Math.random().toString(),
                    speed: 2,
                };
                break;

            case 'asteroid':
                obstacle = {
                    x: this.screenWidth,
                    y: Math.random() * (this.screenHeight - 150) + 50, // Не спавним слишком близко к краям
                    width: 50, // Уменьшаем размер
                    height: 50,
                    type: 'asteroid',
                    id: Math.random().toString(),
                };
                break;

            case 'drone':
                const startY = Math.random() * (this.screenHeight - 100) + 50;
                obstacle = {
                    x: this.screenWidth,
                    y: startY,
                    width: 45,
                    height: 25,
                    type: 'drone',
                    id: Math.random().toString(),
                    trajectory: [
                        { x: this.screenWidth - 150, y: startY },
                        { x: this.screenWidth - 300, y: startY + 80 },
                        { x: this.screenWidth - 450, y: startY - 60 },
                    ],
                    trajectoryIndex: 0,
                };
                break;

            case 'wall':
                const minGap = 180; // Увеличиваем минимальный зазор
                const maxGap = 220;
                const gapSize = minGap + Math.random() * (maxGap - minGap);

                const minWallHeight = 80;
                const maxAvailableHeight = this.screenHeight - gapSize - minWallHeight;
                const topWallHeight = minWallHeight + Math.random() * maxAvailableHeight;

                obstacle = {
                    x: this.screenWidth,
                    y: 0,
                    width: 70, // Уменьшаем ширину стены
                    height: topWallHeight,
                    type: 'wall',
                    id: Math.random().toString(),
                    gap: gapSize,
                };
                break;
        }

        this.state.obstacles.push(obstacle);
    }

    private spawnRandomBonus() {
        const types: BonusState['type'][] = ['shield', 'magnet', 'slowmo', 'coin'];
        const type = types[Math.floor(Math.random() * types.length)];

        const bonus: BonusState = {
            x: this.screenWidth,
            y: Math.random() * (this.screenHeight - 50),
            type,
            id: Math.random().toString(),
        };

        this.state.bonuses.push(bonus);
    }

    private checkCollisions() {
        const player = this.state.player;

        // Проверка столкновений с препятствиями
        for (const obstacle of this.state.obstacles) {
            if (this.checkCollision(player, obstacle)) {
                if (!this.state.activeBonuses.shield) {
                    this.endGame();
                    return;
                } else {
                    // При щите уничтожаем препятствие
                    obstacle.passed = true;
                }
            }
        }

        // Проверка сбора бонусов
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

        // Для стен с отверстиями - исправленная логика
        if (object.type === 'wall') {
            const gapStart = object.height; // Начало зазора (низ верхней стены)
            const gapEnd = object.height + (object.gap || 0); // Конец зазора (верх нижней стены)

            // Проверяем пересечение по X
            const horizontalOverlap = playerRight > objectLeft && playerLeft < objectRight;

            if (horizontalOverlap) {
                // Игрок пересекает стену по горизонтали
                // Проверяем, находится ли игрок в зазоре
                const playerInGap = playerBottom > gapStart && playerTop < gapEnd;

                // Если игрок не полностью в зазоре - столкновение
                if (!playerInGap) {
                    return true;
                }

                // Дополнительная проверка: если игрок слишком большой для зазора
                const playerFitsInGap = (playerBottom - playerTop) <= (gapEnd - gapStart);
                if (!playerFitsInGap) {
                    return true;
                }
            }
            return false;
        }

        // Для остальных объектов - обычная проверка AABB
        return playerRight > objectLeft &&
            playerLeft < objectRight &&
            playerBottom > objectTop &&
            playerTop < objectBottom;
    }

    private collectBonus(bonus: BonusState) {
        bonus.collected = true;

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
        // Увеличиваем сложность каждые 10 очков
        this.state.gameSpeed = 1.0 + Math.floor(this.state.score / 10) * 0.1;
    }

    private endGame() {
        this.state.gameOver = true;
        this.onGameOver(this.state.score, this.state.coins);
    }

    getCurrentState(): GameState {
        return this.state;
    }

    resetGame() {
        this.state = this.getInitialState();
    }
}

export default SpaceGameEngine;