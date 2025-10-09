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

const GRAVITY = 0.3; // Ускорение свободного падения
const JUMP_STRENGTH = -8; // Сила прыжка (отрицательное значение для движения вверх)
const OBSTACLE_SPEED = 2; // Скорость движения препятствий
const OBSTACLE_WIDTH = 70; // Ширина препятствия
const OBSTACLE_GAP = 300; // Промежуток между трубами
const PLAYER_SIZE = 50;
const SCREEN_WIDTH = 400; // Ширина экрана (для примера)

class GameEngine {
    private state: GameState;
    private onGameOver: (score: number) => void;
    private onScoreUpdate: (score: number) => void;
    private screenHeight: number;

    constructor(onGameOver: (score: number) => void, onScoreUpdate: (score: number) => void, screenHeight: number) {
        this.onGameOver = onGameOver;
        this.onScoreUpdate = onScoreUpdate;
        this.screenHeight = screenHeight;
        this.state = this.getInitialState();
    }

    getInitialState(): GameState {
        return {
            player: {
                x: 50,
                y: this.screenHeight / 2 - PLAYER_SIZE / 2,
                velocityY: 0,
                size: PLAYER_SIZE,
            },
            obstacles: [],
            score: 0,
            gameOver: false,
            gameStarted: false,
        };
    }

    // Метод для запуска игры
    startGame() {
        this.state = this.getInitialState(); // Сбросить состояние игры
        this.state.gameStarted = true;
        this.state.gameOver = false;
        this.generateInitialObstacles();
        this.onScoreUpdate(this.state.score);
    }

    // Метод для обработки прыжка птички
    jump() {
        if (!this.state.gameOver && this.state.gameStarted) {
            this.state.player.velocityY = JUMP_STRENGTH;
        }
    }

    // Обновление состояния игры
    update(deltaTime: number) {
        if (this.state.gameOver || !this.state.gameStarted) return;

        // Обновление позиции птички
        this.state.player.velocityY += GRAVITY;
        this.state.player.y += this.state.player.velocityY;

        // Проверка на выход за границы экрана (верх/низ)
        if (this.state.player.y < 0 || this.state.player.y + this.state.player.size > this.screenHeight) {
            this.endGame();
            return;
        }

        // Обновление позиции препятствий и генерация новых
        this.state.obstacles.forEach(obstacle => {
            obstacle.x -= OBSTACLE_SPEED;
        });

        // Удаление препятствий, вышедших за левый край экрана
        this.state.obstacles = this.state.obstacles.filter(obstacle => obstacle.x + OBSTACLE_WIDTH > 0);

        // Генерация новых препятствий
        if (this.state.obstacles.length === 0 || this.state.obstacles[this.state.obstacles.length - 1].x < SCREEN_WIDTH - 350) {
            this.generateNewObstacle();
        }

        // Обнаружение столкновений
        this.checkCollisions();

        // Обновление очков
        this.updateScore();
    }

    private generateInitialObstacles() {
        this.state.obstacles = [];
        // Генерируем несколько препятствий для старта игры
        for (let i = 0; i < 3; i++) {
            this.generateNewObstacle(SCREEN_WIDTH + i * (SCREEN_WIDTH / 2));
        }
    }

    private generateNewObstacle(startX: number = SCREEN_WIDTH) {
        const minHeight = 50;
        const maxHeight = this.screenHeight - OBSTACLE_GAP - 50;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

        this.state.obstacles.push({
            x: startX,
            y: 0,
            width: OBSTACLE_WIDTH,
            height: height,
            gap: OBSTACLE_GAP,
            id: Math.random().toString(),
        });
    }

    private checkCollisions() {
        const player = this.state.player;

        for (const obstacle of this.state.obstacles) {
            const playerRight = player.x + player.size;
            const playerBottom = player.y + player.size;

            const obstacleRight = obstacle.x + obstacle.width;
            const bottomObstacleTop = obstacle.height + obstacle.gap;

            // Проверка на пересечение по X
            if (playerRight > obstacle.x && player.x < obstacleRight) {
                // Проверка на пересечение с верхней частью препятствия
                if (player.y < obstacle.height) {
                    this.endGame();
                    return;
                }
                // Проверка на пересечение с нижней частью препятствия
                if (playerBottom > bottomObstacleTop) {
                    this.endGame();
                    return;
                }
            }
        }
    }

    private updateScore() {
        const oldScore = this.state.score;
        // Увеличиваем очки, когда птичка проходит препятствие
        this.state.obstacles.forEach(obstacle => {
            if (!obstacle.passed && this.state.player.x > obstacle.x + obstacle.width) {
                obstacle.passed = true; // Отмечаем препятствие как пройденное
                this.state.score += 1;
            }
        });
        if (this.state.score !== oldScore) {
            this.onScoreUpdate(this.state.score);
        }
    }

    private endGame() {
        this.state.gameOver = true;
        this.onGameOver(this.state.score);
    }

    getCurrentState(): GameState {
        return this.state;
    }

    // Метод для сброса игры (после Game Over)
    resetGame() {
        this.state = this.getInitialState();
        // Не вызываем onScoreUpdate здесь, чтобы избежать лишних обновлений
    }
}

export default GameEngine;
