import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Хук для работы с локальным хранилищем (AsyncStorage)
 * Предоставляет типизированный интерфейс для сохранения и загрузки данных
 * 
 * @param key - ключ для хранения данных
 * @param initialValue - начальное значение, если данных нет в хранилище
 * @returns [value, setValue, loading, error] - текущее значение, функция обновления, состояние загрузки и ошибка
 */
function useLocalStorage<T>(key: string, initialValue: T) {
    // Состояние для хранения текущего значения
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    // Состояние загрузки для отслеживания процесса чтения/записи
    const [loading, setLoading] = useState<boolean>(true);
    // Состояние ошибки для обработки проблем с хранилищем
    const [error, setError] = useState<string | null>(null);

    /**
     * Функция для обновления значения в хранилище и состоянии
     * @param value - новое значение для сохранения
     */
    const setValue = useCallback(async (value: T | ((val: T) => T)) => {
        try {
            setLoading(true);
            setError(null);
            
            // Определяем новое значение (может быть функцией для обновления)
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            // Сохраняем в AsyncStorage
            await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
            
            // Обновляем локальное состояние
            setStoredValue(valueToStore);
        } catch (err) {
            // Обработка ошибок при записи
            const errorMessage = err instanceof Error ? err.message : 'Ошибка сохранения данных';
            setError(errorMessage);
            console.error(`Ошибка сохранения в AsyncStorage (${key}):`, err);
        } finally {
            setLoading(false);
        }
    }, [key, storedValue]);

    /**
     * Функция для загрузки данных из хранилища при инициализации
     */
    const loadStoredValue = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Читаем данные из AsyncStorage
            const item = await AsyncStorage.getItem(key);
            
            if (item !== null) {
                // Парсим JSON и обновляем состояние
                const parsedValue = JSON.parse(item) as T;
                setStoredValue(parsedValue);
            } else {
                // Если данных нет, используем начальное значение
                setStoredValue(initialValue);
            }
        } catch (err) {
            // Обработка ошибок при чтении
            const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных';
            setError(errorMessage);
            console.error(`Ошибка чтения из AsyncStorage (${key}):`, err);
            setStoredValue(initialValue);
        } finally {
            setLoading(false);
        }
    }, [key, initialValue]);

    // Загружаем данные при монтировании компонента
    useEffect(() => {
        loadStoredValue();
    }, [loadStoredValue]);

    /**
     * Функция для очистки данных из хранилища
     */
    const clearValue = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            await AsyncStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка очистки данных';
            setError(errorMessage);
            console.error(`Ошибка очистки AsyncStorage (${key}):`, err);
        } finally {
            setLoading(false);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, loading, error, clearValue] as const;
}

export default useLocalStorage;
