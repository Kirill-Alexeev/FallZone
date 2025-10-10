import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import useNetwork from '../hooks/useNetwork';

// Интерфейс для пользователя
interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    createdAt: string;
    lastLoginAt: string;
}

// Интерфейс для контекста аутентификации
interface AuthContextType {
    // Состояние пользователя
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    
    // Состояние сети
    isOnline: boolean;
    
    // Методы аутентификации
    login: (email: string, password: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<boolean>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
    
    // Методы восстановления
    resetPassword: (email: string) => Promise<boolean>;
    verifyEmail: (token: string) => Promise<boolean>;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Интерфейс для провайдера
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Провайдер контекста аутентификации
 * Управляет состоянием пользователя, сессиями и сетевыми запросами
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Состояние пользователя с автоматическим сохранением
    const [user, setUser, userLoading, userError] = useLocalStorage<User | null>('user', null);
    
    // Локальное состояние
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Хук для работы с сетью
    const { isConnected, postRequest, putRequest } = useNetwork();
    
    // Определяем состояние аутентификации
    const isAuthenticated = user !== null;

    /**
     * Очищает ошибки
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Устанавливает ошибку
     * @param errorMessage - сообщение об ошибке
     */
    const setAuthError = useCallback((errorMessage: string) => {
        setError(errorMessage);
        console.error('Auth Error:', errorMessage);
    }, []);

    /**
     * Выполняет вход в систему
     * @param email - email пользователя
     * @param password - пароль
     * @returns true если вход успешен
     */
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        if (!isConnected) {
            setAuthError('Нет подключения к интернету');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Отправляем запрос на сервер
            const response = await postRequest<{ user: User; token: string }>('/api/auth/login', {
                email,
                password,
            });

            if (response.user) {
                setUser(response.user);
                // Здесь можно сохранить токен для последующих запросов
                return true;
            }

            return false;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка входа в систему';
            setAuthError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, postRequest, setUser, setAuthError]);

    /**
     * Регистрирует нового пользователя
     * @param username - имя пользователя
     * @param email - email
     * @param password - пароль
     * @returns true если регистрация успешна
     */
    const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
        if (!isConnected) {
            setAuthError('Нет подключения к интернету');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await postRequest<{ user: User; token: string }>('/api/auth/register', {
                username,
                email,
                password,
            });

            if (response.user) {
                setUser(response.user);
                return true;
            }

            return false;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
            setAuthError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, postRequest, setUser, setAuthError]);

    /**
     * Выходит из системы
     */
    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            // Уведомляем сервер о выходе (если есть подключение)
            if (isConnected) {
                try {
                    await postRequest('/api/auth/logout', {});
                } catch (err) {
                    // Игнорируем ошибки сервера при выходе
                    console.warn('Ошибка уведомления сервера о выходе:', err);
                }
            }

            // Очищаем локальные данные
            setUser(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка выхода из системы';
            setAuthError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, postRequest, setUser, setAuthError]);

    /**
     * Обновляет профиль пользователя
     * @param updates - обновления профиля
     * @returns true если обновление успешно
     */
    const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
        if (!user || !isConnected) {
            setAuthError('Нет подключения к интернету или пользователь не авторизован');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await putRequest<{ user: User }>(`/api/users/${user.id}`, updates);

            if (response.user) {
                setUser(response.user);
                return true;
            }

            return false;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления профиля';
            setAuthError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user, isConnected, putRequest, setUser, setAuthError]);

    /**
     * Изменяет пароль пользователя
     * @param oldPassword - старый пароль
     * @param newPassword - новый пароль
     * @returns true если изменение успешно
     */
    const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
        if (!user || !isConnected) {
            setAuthError('Нет подключения к интернету или пользователь не авторизован');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            await putRequest(`/api/users/${user.id}/password`, {
                oldPassword,
                newPassword,
            });

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка изменения пароля';
            setAuthError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user, isConnected, putRequest, setAuthError]);

    /**
     * Сбрасывает пароль
     * @param email - email пользователя
     * @returns true если запрос успешен
     */
    const resetPassword = useCallback(async (email: string): Promise<boolean> => {
        if (!isConnected) {
            setAuthError('Нет подключения к интернету');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            await postRequest('/api/auth/reset-password', { email });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка сброса пароля';
            setAuthError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, postRequest, setAuthError]);

    /**
     * Подтверждает email
     * @param token - токен подтверждения
     * @returns true если подтверждение успешно
     */
    const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
        if (!isConnected) {
            setAuthError('Нет подключения к интернету');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await postRequest<{ user: User }>('/api/auth/verify-email', { token });

            if (response.user) {
                setUser(response.user);
                return true;
            }

            return false;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка подтверждения email';
            setAuthError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, postRequest, setUser, setAuthError]);

    // Очищаем ошибки при изменении состояния сети
    useEffect(() => {
        if (isConnected) {
            clearError();
        }
    }, [isConnected, clearError]);

    // Объединяем ошибки из разных источников
    const combinedError = error || userError;

    const contextValue: AuthContextType = {
        // Состояние
        user,
        isAuthenticated,
        isLoading: isLoading || userLoading,
        error: combinedError,
        isOnline: isConnected,
        
        // Методы
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        resetPassword,
        verifyEmail,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Хук для использования контекста аутентификации
 * @returns объект с состоянием и методами аутентификации
 * @throws Error если используется вне AuthProvider
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    
    return context;
};

export default AuthContext;
