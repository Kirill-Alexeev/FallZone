// context/AuthContext.tsx
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth } from '../config/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<{ success: boolean, error?: string }>;
    signIn: (email: string, password: string) => Promise<{ success: boolean, error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [firebaseError, setFirebaseError] = useState<string | null>(null);
    const isMounted = useRef(true);
    const unsubscribeRef = useRef<() => void>(() => { });

    useEffect(() => {
        console.log('🔄 Инициализация Firebase Auth...');
        isMounted.current = true;

        // Проверяем что auth инициализирован
        if (!auth) {
            console.error('❌ Firebase Auth не инициализирован');
            if (isMounted.current) {
                setLoading(false);
                setFirebaseError('Firebase не инициализирован');
            }
            return;
        }

        // Отписываемся от предыдущего слушателя если есть
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
        }

        const unsubscribe = onAuthStateChanged(auth,
            (user) => {
                if (!isMounted.current) return;

                console.log('✅ Firebase Auth состояние изменено');
                console.log('👤 Пользователь:', user ? user.email : 'null');
                setUser(user);
                setLoading(false);
                setFirebaseError(null);
            },
            (error) => {
                if (!isMounted.current) return;

                console.error('❌ Ошибка Firebase Auth:', error);
                setFirebaseError(error.message);
                setLoading(false);
            }
        );

        unsubscribeRef.current = unsubscribe;

        return () => {
            console.log('🧹 Очистка Firebase Auth слушателя');
            isMounted.current = false;
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    const signUp = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
        console.log('📝 Регистрация:', email);

        // Проверяем что auth инициализирован
        if (!auth) {
            return {
                success: false,
                error: 'Firebase не инициализирован'
            };
        }

        // Проверяем наличие ошибки подключения
        if (firebaseError) {
            return {
                success: false,
                error: 'Проблема с подключением к серверу. Проверьте интернет.'
            };
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ Пользователь создан:', userCredential.user.email);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Ошибка регистрации:', error.code, error.message);

            let errorMessage = 'Ошибка регистрации';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Этот email уже используется';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Неверный формат email';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Пароль должен быть не менее 6 символов';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Проблема с интернет соединением';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Регистрация по email отключена. Проверьте настройки Firebase';
                    break;
                default:
                    errorMessage = `Ошибка: ${error.code}`;
            }

            return { success: false, error: errorMessage };
        }
    };

    const signIn = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
        console.log('🔐 Вход:', email);

        // Проверяем что auth инициализирован
        if (!auth) {
            return {
                success: false,
                error: 'Firebase не инициализирован'
            };
        }

        // Проверяем наличие ошибки подключения
        if (firebaseError) {
            return {
                success: false,
                error: 'Проблема с подключением к серверу. Проверьте интернет.'
            };
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ Успешный вход:', userCredential.user.email);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Ошибка входа:', error.code, error.message);

            let errorMessage = 'Ошибка входа';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Неверный формат email';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Аккаунт отключен';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Пользователь не найден';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Неверный пароль';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Слишком много попыток. Попробуйте позже';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Проблема с интернет соединением';
                    break;
                case 'auth/internal-error':
                    errorMessage = 'Внутренняя ошибка сервера';
                    break;
                default:
                    errorMessage = `Ошибка: ${error.code}`;
            }

            return { success: false, error: errorMessage };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            console.log('🚪 Начинаем выход...');
            if (!auth) {
                console.error('❌ Firebase Auth не инициализирован');
                return;
            }

            await signOut(auth);
            console.log('✅ Пользователь успешно вышел');

            // Явно сбрасываем состояние
            setUser(null);
            setFirebaseError(null);

        } catch (error: any) {
            console.error('❌ Ошибка выхода:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signUp,
        signIn,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};