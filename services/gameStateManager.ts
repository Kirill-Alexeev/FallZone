// services/gameStateManager.ts
import { User } from 'firebase/auth';
import LeaderboardService from './leaderboardService';
import { DEFAULT_GAME_DATA, GameData, loadGameData, saveGameData } from './storage';

class GameStateManager {
    private currentData: GameData | null = null;
    private user: User | null = null;
    private isSaving = false;
    private pendingSave: (() => Promise<void>) | null = null;

    async initialize(user: User | null) {
        this.user = user;
        if (user) {
            this.currentData = await loadGameData(user);
            console.log('GameStateManager initialized for user:', user.email);
        } else {
            this.currentData = DEFAULT_GAME_DATA;
            console.log('GameStateManager initialized for guest');
        }
    }

    getCurrentData(): GameData | null {
        return this.currentData;
    }

    // ОЧЕРЕДЬ для сохранения - предотвращает гонки данных
    async saveWithQueue(saveOperation: (currentData: GameData) => GameData): Promise<void> {
        if (!this.currentData || !this.user) {
            console.error('Cannot save: no data or user');
            return;
        }

        // Если уже идет сохранение, добавляем в очередь
        if (this.isSaving) {
            console.log('Save in progress, queueing operation...');
            this.pendingSave = async () => {
                const newData = saveOperation(this.currentData!);
                await this.performSave(newData);
            };
            return;
        }

        // Выполняем сохранение сразу
        this.isSaving = true;
        try {
            const newData = saveOperation(this.currentData!);
            await this.performSave(newData);
        } finally {
            this.isSaving = false;

            // Выполняем отложенную операцию если есть
            if (this.pendingSave) {
                const nextSave = this.pendingSave;
                this.pendingSave = null;
                await nextSave();
            }
        }
    }

    private async performSave(newData: GameData): Promise<void> {
        if (!this.user) return;

        // Обновляем локальное состояние
        this.currentData = newData;

        // Сохраняем в AsyncStorage
        await saveGameData(this.user, newData);
        console.log('✅ Game data saved:', {
            highScore: newData.highScore,
            games: newData.stats.totalGames,
            coins: newData.coins
        });

        // Синхронизируем с лидербордом
        try {
            await LeaderboardService.updateUserScore(this.user, newData);
            console.log('✅ Leaderboard synced');
        } catch (error) {
            console.error('Error syncing with leaderboard:', error);
        }
    }

    // Атомарные операции
    async recordGameSession(sessionData: {
        score: number;
        coins: number;
        playTime: number;
        tapCount: number;
        deathBy?: 'asteroid' | 'drone' | 'wall';
        bonusesCollected?: { type: 'shield' | 'magnet' | 'coin'; count: number }[];
    }) {
        await this.saveWithQueue((current) => {
            console.log('Recording session:', sessionData);

            const bonusesByType = { ...current.stats.bonusesByType };
            const deathsByObstacle = { ...current.stats.deathsByObstacle };

            if (sessionData.bonusesCollected) {
                sessionData.bonusesCollected.forEach(bonus => {
                    bonusesByType[bonus.type] += bonus.count;
                });
            }

            if (sessionData.deathBy) {
                deathsByObstacle[sessionData.deathBy] += 1;
            }

            // Считаем общее количество бонусов
            const totalBonusesCollected = sessionData.bonusesCollected?.reduce((sum, b) => sum + b.count, 0) || 0;

            const updatedData = {
                ...current,
                coins: current.coins + sessionData.coins,
                highScore: Math.max(current.highScore, sessionData.score), // ВАЖНО: обновляем рекорд здесь
                stats: {
                    totalGames: current.stats.totalGames + 1,
                    totalTaps: current.stats.totalTaps + sessionData.tapCount,
                    totalPlayTime: current.stats.totalPlayTime + sessionData.playTime,
                    totalCoinsEarned: current.stats.totalCoinsEarned + sessionData.coins,
                    totalScore: current.stats.totalScore + sessionData.score,
                    totalDeaths: current.stats.totalDeaths + (sessionData.deathBy ? 1 : 0),
                    deathsByObstacle,
                    totalBonuses: current.stats.totalBonuses + totalBonusesCollected,
                    bonusesByType
                }
            };

            console.log('Session recorded successfully');
            return updatedData;
        });
    }

    async updateHighScore(score: number) {
        await this.saveWithQueue((current) => {
            if (score > current.highScore) {
                console.log('Updating high score from', current.highScore, 'to', score);
                return {
                    ...current,
                    highScore: score
                };
            }
            return current;
        });
    }

    async addCoins(amount: number) {
        await this.saveWithQueue((current) => {
            return {
                ...current,
                coins: current.coins + amount,
                stats: {
                    ...current.stats,
                    totalCoinsEarned: current.stats.totalCoinsEarned + amount
                }
            };
        });
    }

    async updateStats(newStats: Partial<GameData['stats']>) {
        await this.saveWithQueue((current) => {
            return {
                ...current,
                stats: { ...current.stats, ...newStats }
            };
        });
    }

    async reset() {
        this.currentData = DEFAULT_GAME_DATA;
        this.user = null;
        this.isSaving = false;
        this.pendingSave = null;
    }
}

export default new GameStateManager();