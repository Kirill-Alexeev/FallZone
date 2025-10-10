import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Конфигурация Firebase (замените на ваши данные)
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

/**
 * Сервис для работы с Firebase
 * Инициализирует все необходимые сервисы Firebase
 * Предоставляет типизированные методы для работы с базой данных
 */
class FirebaseService {
    private static instance: FirebaseService;
    private app: any;
    private auth: any;
    private firestore: any;
    private storage: any;
    private analytics: any;
    private initialized: boolean = false;

    private constructor() {
        this.initializeFirebase();
    }

    /**
     * Получает единственный экземпляр сервиса (Singleton)
     */
    public static getInstance(): FirebaseService {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }

    /**
     * Инициализирует Firebase сервисы
     */
    private initializeFirebase(): void {
        try {
            // Инициализируем Firebase приложение
            this.app = initializeApp(firebaseConfig);

            // Инициализируем аутентификацию с AsyncStorage для React Native
            this.auth = initializeAuth(this.app, {
                persistence: getReactNativePersistence(AsyncStorage)
            });

            // Инициализируем Firestore
            this.firestore = initializeFirestore(this.app, {
                experimentalForceLongPolling: true, // Для React Native
            });

            // Инициализируем Storage
            this.storage = getStorage(this.app);

            // Инициализируем Analytics (только для веб)
            if (typeof window !== 'undefined') {
                this.analytics = getAnalytics(this.app);
            }

            this.initialized = true;
            console.log('Firebase успешно инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации Firebase:', error);
            this.initialized = false;
        }
    }

    /**
     * Проверяет, инициализирован ли Firebase
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Получает экземпляр аутентификации
     */
    public getAuth() {
        if (!this.initialized) {
            throw new Error('Firebase не инициализирован');
        }
        return this.auth;
    }

    /**
     * Получает экземпляр Firestore
     */
    public getFirestore() {
        if (!this.initialized) {
            throw new Error('Firebase не инициализирован');
        }
        return this.firestore;
    }

    /**
     * Получает экземпляр Storage
     */
    public getStorage() {
        if (!this.initialized) {
            throw new Error('Firebase не инициализирован');
        }
        return this.storage;
    }

    /**
     * Получает экземпляр Analytics
     */
    public getAnalytics() {
        if (!this.initialized) {
            throw new Error('Firebase не инициализирован');
        }
        return this.analytics;
    }

    /**
     * Получает текущего пользователя
     */
    public getCurrentUser() {
        const auth = this.getAuth();
        return auth.currentUser;
    }

    /**
     * Проверяет, авторизован ли пользователь
     */
    public isUserAuthenticated(): boolean {
        const user = this.getCurrentUser();
        return user !== null;
    }

    /**
     * Получает ID текущего пользователя
     */
    public getCurrentUserId(): string | null {
        const user = this.getCurrentUser();
        return user ? user.uid : null;
    }

    /**
     * Логирует событие в Analytics
     * @param eventName - название события
     * @param parameters - параметры события
     */
    public logEvent(eventName: string, parameters?: Record<string, any>): void {
        if (this.analytics) {
            try {
                this.analytics.logEvent(eventName, parameters);
            } catch (error) {
                console.error('Ошибка логирования события в Analytics:', error);
            }
        }
    }

    /**
     * Устанавливает пользовательские свойства в Analytics
     * @param properties - свойства пользователя
     */
    public setUserProperties(properties: Record<string, any>): void {
        if (this.analytics) {
            try {
                Object.entries(properties).forEach(([key, value]) => {
                    this.analytics.setUserProperties({ [key]: value });
                });
            } catch (error) {
                console.error('Ошибка установки пользовательских свойств:', error);
            }
        }
    }

    /**
     * Получает версию Firebase SDK
     */
    public getVersion(): string {
        return '9.0.0'; // Замените на актуальную версию
    }

    /**
     * Проверяет подключение к Firebase
     */
    public async checkConnection(): Promise<boolean> {
        try {
            if (!this.initialized) {
                return false;
            }

            // Простая проверка подключения через Firestore
            const firestore = this.getFirestore();
            const testDoc = firestore.collection('_test').doc('connection');
            await testDoc.get();
            
            return true;
        } catch (error) {
            console.error('Ошибка проверки подключения к Firebase:', error);
            return false;
        }
    }

    /**
     * Очищает все данные Firebase (для тестирования)
     */
    public async clearAllData(): Promise<boolean> {
        try {
            if (!this.initialized) {
                return false;
            }

            // ВНИМАНИЕ: Этот метод удаляет все данные!
            // Используйте только для тестирования
            console.warn('Очистка всех данных Firebase - это действие необратимо!');
            
            // Здесь можно добавить логику очистки данных
            // В реальном приложении это должно быть защищено дополнительными проверками
            
            return true;
        } catch (error) {
            console.error('Ошибка очистки данных Firebase:', error);
            return false;
        }
    }
}

// Экспортируем единственный экземпляр сервиса
const firebaseService = FirebaseService.getInstance();

export default firebaseService;

// Экспортируем также отдельные сервисы для удобства
export const auth = firebaseService.getAuth();
export const firestore = firebaseService.getFirestore();
export const storage = firebaseService.getStorage();
export const analytics = firebaseService.getAnalytics();
