// services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';

export interface GameStats {
    totalGames: number;
    totalTaps: number;
    totalPlayTime: number;
    totalCoinsEarned: number;
    totalScore: number;
    totalDeaths: number;
    deathsByObstacle: {
        comet: number;
        asteroid: number;
        drone: number;
        wall: number;
    };
    totalBonuses: number;
    bonusesByType: {
        shield: number;
        magnet: number;
        slowmo: number;
        coin: number;
    };
}

export interface Skin {
    id: string;
    name: string;
    price: number;
    unlocked: boolean;
    equipped: boolean;
    preview: string;
    animationFrames?: number;
    animationSpeed?: number;
}

export interface AudioSettings {
    sound: boolean;
    music: boolean;
    vibration: boolean;
    notifications?: boolean;
}

export interface GameData {
    highScore: number;
    coins: number;
    stats: GameStats;
    audioSettings: AudioSettings;
    skins: Skin[];
    currentSkinId: string;
}

export const DEFAULT_SKINS: Skin[] = [
    {
        id: 'default',
        name: 'Космонавт',
        price: 0,
        unlocked: true,
        equipped: true,
        preview: 'assets/sprites/characters/player_default_idle.png',
        animationFrames: 4,
        animationSpeed: 5
    },
    {
        id: 'alien',
        name: 'Инопланетянин',
        price: 100,
        unlocked: false,
        equipped: false,
        preview: 'assets/sprites/characters/player_alien_idle.png',
        animationFrames: 4,
        animationSpeed: 5
    },
    {
        id: 'robot',
        name: 'Робот',
        price: 200,
        unlocked: false,
        equipped: false,
        preview: 'assets/sprites/characters/player_robot_idle.png',
        animationFrames: 4,
        animationSpeed: 5
    }
];

export const DEFAULT_GAME_DATA: GameData = {
    highScore: 0,
    coins: 0,
    stats: {
        totalGames: 0,
        totalTaps: 0,
        totalPlayTime: 0,
        totalCoinsEarned: 0,
        totalScore: 0,
        totalDeaths: 0,
        deathsByObstacle: {
            comet: 0,
            asteroid: 0,
            drone: 0,
            wall: 0
        },
        totalBonuses: 0,
        bonusesByType: {
            shield: 0,
            magnet: 0,
            slowmo: 0,
            coin: 0
        }
    },
    audioSettings: {
        sound: true,
        music: true,
        vibration: true,
        notifications: true
    },
    skins: DEFAULT_SKINS,
    currentSkinId: 'default'
};

// Функция для получения ключа хранения для конкретного пользователя
export const getStorageKey = (user: User | null): string => {
    if (!user) {
        return 'fallzone_game_data_session';
    }
    return `fallzone_game_data_${user.uid}`;
};

// Загрузить данные игры для пользователя
export const loadGameData = async (user: User | null): Promise<GameData> => {
    try {
        const storageKey = getStorageKey(user);
        console.log(`Loading game data for key: ${storageKey}, user: ${user?.email}`);

        const storedData = await AsyncStorage.getItem(storageKey);

        if (storedData) {
            const data = JSON.parse(storedData);
            console.log('Loaded existing game data:', data);
            return data;
        }

        // Для нового пользователя возвращаем DEFAULT_GAME_DATA
        // НЕ сохраняем автоматически - сохраним когда будут изменения
        console.log('No existing game data found, using default');
        return DEFAULT_GAME_DATA;

    } catch (error) {
        console.error('Error loading game data:', error);
        return DEFAULT_GAME_DATA;
    }
};

// Сохранить данные игры для пользователя
export const saveGameData = async (user: User | null, data: GameData): Promise<void> => {
    try {
        if (!user) {
            console.log('Cannot save game data: no user (guest mode)');
            return;
        }

        const storageKey = getStorageKey(user);
        console.log(`Saving game data for user ${user.email}:`, data);
        await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving game data:', error);
        throw error;
    }
};

// Удалить данные пользователя (при logout или удалении аккаунта)
export const deleteUserGameData = async (user: User | null): Promise<void> => {
    try {
        const storageKey = getStorageKey(user);
        await AsyncStorage.removeItem(storageKey);
        console.log(`Deleted game data for user: ${user?.uid}`);
    } catch (error) {
        console.error('Error deleting game data:', error);
    }
};

// Сбросить данные к значениям по умолчанию
export const resetGameData = async (user: User | null): Promise<void> => {
    try {
        await saveGameData(user, DEFAULT_GAME_DATA);
    } catch (error) {
        console.error('Error resetting game data:', error);
    }
};