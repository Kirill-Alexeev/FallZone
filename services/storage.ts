// services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface Settings {
    sound: boolean;
    music: boolean;
    vibration: boolean;
}

export interface GameData {
    highScore: number;
    coins: number;
    stats: GameStats;
    settings: Settings;
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
    settings: {
        sound: true,
        music: true,
        vibration: true
    },
    skins: DEFAULT_SKINS,
    currentSkinId: 'default'
};

const STORAGE_KEY = 'fallzone_game_data';

export const loadGameData = async (): Promise<GameData> => {
    try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const data = JSON.parse(storedData);
            console.log('Loaded game data:', data);
            return data;
        }
        // Если данных нет, сохраняем дефолтные
        await saveGameData(DEFAULT_GAME_DATA);
        return DEFAULT_GAME_DATA;
    } catch (error) {
        console.error('Error loading game data:', error);
        return DEFAULT_GAME_DATA;
    }
};

export const saveGameData = async (data: GameData): Promise<void> => {
    try {
        console.log('Saving game data:', data);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving game data:', error);
    }
};

export const resetGameData = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GAME_DATA));
    } catch (error) {
        console.error('Error resetting game data:', error);
    }
};