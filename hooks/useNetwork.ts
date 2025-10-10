import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';

// Интерфейс для состояния сети
interface NetworkState {
    isConnected: boolean;
    type: string | null;
    isInternetReachable: boolean | null;
}

// Интерфейс для настроек запроса
interface RequestConfig {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

// Интерфейс для результата запроса
interface RequestResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    retry: () => void;
}

/**
 * Хук для управления сетевыми запросами и состоянием подключения
 * Предоставляет автоматические повторы, таймауты и обработку ошибок
 */
function useNetwork() {
    // Состояние сети
    const [networkState, setNetworkState] = useState<NetworkState>({
        isConnected: true,
        type: null,
        isInternetReachable: null,
    });

    // Ref для хранения активных запросов
    const activeRequestsRef = useRef<Set<AbortController>>(new Set());

    /**
     * Обновляет состояние сети
     */
    const updateNetworkState = useCallback((state: any) => {
        setNetworkState({
            isConnected: state.isConnected ?? false,
            type: state.type,
            isInternetReachable: state.isInternetReachable,
        });
    }, []);

    // Подписываемся на изменения состояния сети
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(updateNetworkState);
        
        // Получаем начальное состояние
        NetInfo.fetch().then(updateNetworkState);

        return unsubscribe;
    }, [updateNetworkState]);

    /**
     * Выполняет HTTP запрос с автоматическими повторами и таймаутом
     * @param url - URL для запроса
     * @param options - опции fetch
     * @param config - конфигурация запроса
     */
    const makeRequest = useCallback(async <T>(
        url: string,
        options: RequestInit = {},
        config: RequestConfig = {}
    ): Promise<T> => {
        const {
            timeout = 10000, // 10 секунд по умолчанию
            retries = 3,
            retryDelay = 1000,
        } = config;

        // Проверяем подключение к интернету
        if (!networkState.isConnected || networkState.isInternetReachable === false) {
            throw new Error('Нет подключения к интернету');
        }

        // Создаем AbortController для отмены запроса
        const controller = new AbortController();
        activeRequestsRef.current.add(controller);

        // Настраиваем таймаут
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            activeRequestsRef.current.delete(controller);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            clearTimeout(timeoutId);
            activeRequestsRef.current.delete(controller);

            // Если это ошибка сети и у нас есть попытки, повторяем запрос
            if (retries > 0 && (error as Error).name === 'TypeError') {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return makeRequest<T>(url, options, { ...config, retries: retries - 1 });
            }

            throw error;
        }
    }, [networkState]);

    /**
     * Хук для выполнения GET запроса
     * @param url - URL для запроса
     * @param config - конфигурация запроса
     */
    const useGetRequest = useCallback(<T>(url: string, config?: RequestConfig): RequestResult<T> => {
        const [data, setData] = useState<T | null>(null);
        const [loading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        const executeRequest = useCallback(async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await makeRequest<T>(url, { method: 'GET' }, config);
                setData(result);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
                setError(errorMessage);
                console.error(`Ошибка GET запроса к ${url}:`, err);
            } finally {
                setLoading(false);
            }
        }, [url, config]);

        // Выполняем запрос при монтировании
        useEffect(() => {
            executeRequest();
        }, [executeRequest]);

        return {
            data,
            loading,
            error,
            retry: executeRequest,
        };
    }, [makeRequest]);

    /**
     * Выполняет POST запрос
     * @param url - URL для запроса
     * @param body - тело запроса
     * @param config - конфигурация запроса
     */
    const postRequest = useCallback(async <T>(
        url: string,
        body: any,
        config?: RequestConfig
    ): Promise<T> => {
        return makeRequest<T>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }, config);
    }, [makeRequest]);

    /**
     * Выполняет PUT запрос
     * @param url - URL для запроса
     * @param body - тело запроса
     * @param config - конфигурация запроса
     */
    const putRequest = useCallback(async <T>(
        url: string,
        body: any,
        config?: RequestConfig
    ): Promise<T> => {
        return makeRequest<T>(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }, config);
    }, [makeRequest]);

    /**
     * Выполняет DELETE запрос
     * @param url - URL для запроса
     * @param config - конфигурация запроса
     */
    const deleteRequest = useCallback(async <T>(
        url: string,
        config?: RequestConfig
    ): Promise<T> => {
        return makeRequest<T>(url, { method: 'DELETE' }, config);
    }, [makeRequest]);

    /**
     * Отменяет все активные запросы
     */
    const cancelAllRequests = useCallback(() => {
        activeRequestsRef.current.forEach(controller => {
            controller.abort();
        });
        activeRequestsRef.current.clear();
    }, []);

    // Отменяем все запросы при размонтировании
    useEffect(() => {
        return () => {
            cancelAllRequests();
        };
    }, [cancelAllRequests]);

    return {
        // Состояние сети
        networkState,
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
        
        // Методы запросов
        makeRequest,
        useGetRequest,
        postRequest,
        putRequest,
        deleteRequest,
        cancelAllRequests,
    };
}

export default useNetwork;
