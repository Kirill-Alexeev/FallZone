import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Сервис для работы с локальным хранилищем
 * Предоставляет типизированные методы для сохранения и загрузки данных
 * Обрабатывает ошибки и предоставляет fallback значения
 */
class StorageService {
    /**
     * Сохраняет данные в AsyncStorage
     * @param key - ключ для хранения
     * @param value - значение для сохранения
     * @returns Promise<boolean> - true если сохранение успешно
     */
    static async setItem<T>(key: string, value: T): Promise<boolean> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
            return true;
        } catch (error) {
            console.error(`Ошибка сохранения в AsyncStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Загружает данные из AsyncStorage
     * @param key - ключ для загрузки
     * @param defaultValue - значение по умолчанию если данных нет
     * @returns Promise<T | null> - загруженные данные или null при ошибке
     */
    static async getItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            if (jsonValue !== null) {
                return JSON.parse(jsonValue) as T;
            }
            return defaultValue;
        } catch (error) {
            console.error(`Ошибка загрузки из AsyncStorage (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * Удаляет данные из AsyncStorage
     * @param key - ключ для удаления
     * @returns Promise<boolean> - true если удаление успешно
     */
    static async removeItem(key: string): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Ошибка удаления из AsyncStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Очищает все данные из AsyncStorage
     * @returns Promise<boolean> - true если очистка успешна
     */
    static async clear(): Promise<boolean> {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (error) {
            console.error('Ошибка очистки AsyncStorage:', error);
            return false;
        }
    }

    /**
     * Получает все ключи из AsyncStorage
     * @returns Promise<string[]> - массив ключей
     */
    static async getAllKeys(): Promise<string[]> {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (error) {
            console.error('Ошибка получения ключей из AsyncStorage:', error);
            return [];
        }
    }

    /**
     * Получает несколько элементов по ключам
     * @param keys - массив ключей
     * @returns Promise<Record<string, any>> - объект с данными
     */
    static async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
        try {
            const values = await AsyncStorage.multiGet(keys);
            const result: Record<string, T | null> = {};
            
            values.forEach(([key, value]) => {
                if (value !== null) {
                    try {
                        result[key] = JSON.parse(value) as T;
                    } catch {
                        result[key] = null;
                    }
                } else {
                    result[key] = null;
                }
            });
            
            return result;
        } catch (error) {
            console.error('Ошибка получения множественных данных из AsyncStorage:', error);
            return {};
        }
    }

    /**
     * Сохраняет несколько элементов
     * @param keyValuePairs - массив пар [ключ, значение]
     * @returns Promise<boolean> - true если сохранение успешно
     */
    static async setMultiple(keyValuePairs: [string, any][]): Promise<boolean> {
        try {
            const serializedPairs = keyValuePairs.map(([key, value]) => [
                key,
                JSON.stringify(value)
            ]);
            
            await AsyncStorage.multiSet(serializedPairs);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения множественных данных в AsyncStorage:', error);
            return false;
        }
    }

    /**
     * Удаляет несколько элементов
     * @param keys - массив ключей для удаления
     * @returns Promise<boolean> - true если удаление успешно
     */
    static async removeMultiple(keys: string[]): Promise<boolean> {
        try {
            await AsyncStorage.multiRemove(keys);
            return true;
        } catch (error) {
            console.error('Ошибка удаления множественных данных из AsyncStorage:', error);
            return false;
        }
    }

    /**
     * Проверяет существование ключа
     * @param key - ключ для проверки
     * @returns Promise<boolean> - true если ключ существует
     */
    static async hasKey(key: string): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value !== null;
        } catch (error) {
            console.error(`Ошибка проверки ключа в AsyncStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Получает размер хранилища в байтах (приблизительно)
     * @returns Promise<number> - размер в байтах
     */
    static async getSize(): Promise<number> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const values = await AsyncStorage.multiGet(keys);
            
            let totalSize = 0;
            values.forEach(([key, value]) => {
                totalSize += key.length;
                if (value) {
                    totalSize += value.length;
                }
            });
            
            return totalSize;
        } catch (error) {
            console.error('Ошибка получения размера AsyncStorage:', error);
            return 0;
        }
    }
}

export default StorageService;
