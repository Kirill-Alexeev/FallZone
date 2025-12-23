// services/leaderboardService.ts
import { User } from 'firebase/auth';
import {
    collection,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    email: string;
    highScore: number;
    coins: number;
    totalGames: number;
    lastPlayed: Date;
    character?: string;
    createdAt?: Date;
}

export interface LeaderboardStats {
    entries: LeaderboardEntry[];
    userRank?: number;
    totalPlayers: number;
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

class LeaderboardService {
    private readonly COLLECTION_NAME = 'leaderboard';
    private readonly MAX_ENTRIES = 1000;
    private readonly PAGE_SIZE = 20;

    // Обновить или создать запись пользователя в лидерборде
    async updateUserScore(user: User, gameData: any): Promise<void> {
        try {
            if (!user || !user.email) {
                console.warn('Cannot update leaderboard: no user or email');
                return;
            }

            const userRef = doc(db, this.COLLECTION_NAME, user.uid);

            // Получаем текущие данные пользователя
            const userDoc = await getDoc(userRef);
            const currentData = userDoc.exists() ? userDoc.data() : {};

            const entry: LeaderboardEntry = {
                userId: user.uid,
                displayName: user.displayName || user.email.split('@')[0],
                email: user.email,
                highScore: Math.max(currentData.highScore || 0, gameData.highScore || 0),
                coins: gameData.coins || 0,
                totalGames: gameData.stats?.totalGames || 0,
                lastPlayed: new Date(),
                character: gameData.currentSkinId || 'default',
                createdAt: currentData.createdAt || new Date()
            };

            await setDoc(userRef, entry, { merge: true });
            console.log(`Leaderboard updated for ${user.email}: ${entry.highScore} points`);

        } catch (error) {
            console.error('Error updating leaderboard:', error);
            throw error;
        }
    }

    // Получить топ N игроков
    async getTopPlayers(limitCount: number = 20): Promise<LeaderboardEntry[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                orderBy('highScore', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const entries: LeaderboardEntry[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                entries.push({
                    ...data,
                    lastPlayed: data.lastPlayed?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date()
                } as LeaderboardEntry);
            });

            return entries;
        } catch (error) {
            console.error('Error fetching top players:', error);
            return [];
        }
    }

    // Получить таблицу лидеров с пагинацией
    async getLeaderboard(): Promise<LeaderboardStats> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                orderBy('highScore', 'desc'),
                limit(50) // Увеличиваем лимит вместо пагинации
            );

            const querySnapshot = await getDocs(q);
            const totalPlayers = querySnapshot.size;

            const entries: LeaderboardEntry[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                entries.push({
                    ...data,
                    lastPlayed: data.lastPlayed?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date()
                } as LeaderboardEntry);
            });

            return {
                entries,
                totalPlayers,
                hasMore: false, // Отключаем пагинацию для простоты
                lastDoc: undefined
            };
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return {
                entries: [],
                totalPlayers: 0,
                hasMore: false
            };
        }
    }

    // Получить позицию пользователя в рейтинге
    async getUserRank(userId: string): Promise<number> {
        try {
            // Получаем все записи отсортированные
            const q = query(
                collection(db, this.COLLECTION_NAME),
                orderBy('highScore', 'desc')
            );

            const querySnapshot = await getDocs(q);
            let rank = 1;

            for (const doc of querySnapshot.docs) {
                if (doc.id === userId) {
                    return rank;
                }
                rank++;
            }

            return -1; // Пользователь не найден в таблице лидеров
        } catch (error) {
            console.error('Error getting user rank:', error);
            return -1;
        }
    }

    // Получить статистику пользователя
    async getUserStats(userId: string): Promise<LeaderboardEntry | null> {
        try {
            const userRef = doc(db, this.COLLECTION_NAME, userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    ...data,
                    lastPlayed: data.lastPlayed?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date()
                } as LeaderboardEntry;
            }
            return null;
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    }

    // Поиск игрока по имени или email
    async searchPlayers(searchTerm: string, limitCount: number = 10): Promise<LeaderboardEntry[]> {
        try {
            const allPlayers = await this.getTopPlayers(100);
            const term = searchTerm.toLowerCase();

            return allPlayers.filter(player =>
                player.displayName.toLowerCase().includes(term) ||
                player.email.toLowerCase().includes(term)
            ).slice(0, limitCount);
        } catch (error) {
            console.error('Error searching players:', error);
            return [];
        }
    }
}

export default new LeaderboardService();