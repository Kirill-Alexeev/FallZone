// services/dataMigration.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import { GameData } from './storage';

export const migrateGuestToUser = async (user: User, userData: GameData): Promise<GameData> => {
    try {
        const guestKey = 'fallzone_game_data_session';
        const guestDataStr = await AsyncStorage.getItem(guestKey);

        if (!guestDataStr) {
            return userData;
        }

        const guestData: GameData = JSON.parse(guestDataStr);

        // Сравниваем рекорды
        if (guestData.highScore > userData.highScore) {
            console.log(`Migrating guest high score (${guestData.highScore}) to user account`);

            // Объединяем статистику
            const mergedData: GameData = {
                ...userData,
                highScore: guestData.highScore,
                coins: userData.coins + guestData.coins,
                stats: {
                    totalGames: userData.stats.totalGames + guestData.stats.totalGames,
                    totalTaps: userData.stats.totalTaps + guestData.stats.totalTaps,
                    totalPlayTime: userData.stats.totalPlayTime + guestData.stats.totalPlayTime,
                    totalCoinsEarned: userData.stats.totalCoinsEarned + guestData.stats.totalCoinsEarned,
                    totalScore: userData.stats.totalScore + guestData.stats.totalScore,
                    totalDeaths: userData.stats.totalDeaths + guestData.stats.totalDeaths,
                    deathsByObstacle: {
                        asteroid: userData.stats.deathsByObstacle.asteroid + guestData.stats.deathsByObstacle.asteroid,
                        drone: userData.stats.deathsByObstacle.drone + guestData.stats.deathsByObstacle.drone,
                        wall: userData.stats.deathsByObstacle.wall + guestData.stats.deathsByObstacle.wall,
                    },
                    totalBonuses: userData.stats.totalBonuses + guestData.stats.totalBonuses,
                    bonusesByType: {
                        shield: userData.stats.bonusesByType.shield + guestData.stats.bonusesByType.shield,
                        magnet: userData.stats.bonusesByType.magnet + guestData.stats.bonusesByType.magnet,
                        coin: userData.stats.bonusesByType.coin + guestData.stats.bonusesByType.coin,
                    }
                },
                audioSettings: userData.audioSettings // Сохраняем настройки пользователя
            };

            // Очищаем гостевые данные
            await AsyncStorage.removeItem(guestKey);

            return mergedData;
        }

        // Если рекорд пользователя лучше, просто очищаем гостевые данные
        await AsyncStorage.removeItem(guestKey);
        return userData;

    } catch (error) {
        console.error('Error migrating guest data:', error);
        return userData;
    }
};