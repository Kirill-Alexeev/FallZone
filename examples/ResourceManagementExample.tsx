import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { GameProvider, useGameContext } from '../context/GameContext';
import useAudio from '../hooks/useAudio';
import useLocalStorage from '../hooks/useLocalStorage';
import useNetwork from '../hooks/useNetwork';
import firebaseService from '../services/firebase';
import StorageService from '../services/storage';

/**
 * Пример компонента, демонстрирующий использование всех хуков и сервисов
 * для управления ресурсами приложения
 */
const ResourceManagementExample: React.FC = () => {
    // Использование хука для локального хранилища
    const [userPreferences, setUserPreferences, prefsLoading, prefsError] = useLocalStorage('userPreferences', {
        theme: 'dark',
        language: 'ru',
        notifications: true,
    });

    // Использование хука для аудио
    const audioSettings = {
        soundEnabled: userPreferences.notifications,
        musicEnabled: true,
        vibrationEnabled: true,
        soundVolume: 0.8,
        musicVolume: 0.6,
    };
    const { playJumpSound, playScoreSound, loading: audioLoading, error: audioError } = useAudio(audioSettings);

    // Использование хука для сети
    const { isConnected, postRequest, useGetRequest } = useNetwork();

    // Загрузка данных с сервера
    const { data: leaderboardData, loading: leaderboardLoading, error: leaderboardError, retry } = useGetRequest('/api/leaderboard');

    // Состояние для демонстрации
    const [demoCounter, setDemoCounter] = useState(0);

    /**
     * Демонстрация работы с локальным хранилищем
     */
    const handleToggleTheme = async () => {
        const newTheme = userPreferences.theme === 'dark' ? 'light' : 'dark';
        await setUserPreferences(prev => ({ ...prev, theme: newTheme }));
        
        // Воспроизводим звук при изменении темы
        playJumpSound();
    };

    /**
     * Демонстрация работы с сетью
     */
    const handleSendScore = async () => {
        if (!isConnected) {
            Alert.alert('Ошибка', 'Нет подключения к интернету');
            return;
        }

        try {
            await postRequest('/api/scores', {
                score: demoCounter,
                timestamp: Date.now(),
            });
            
            playScoreSound();
            Alert.alert('Успех', 'Счет отправлен на сервер');
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось отправить счет');
        }
    };

    /**
     * Демонстрация работы с Firebase
     */
    const handleFirebaseTest = async () => {
        try {
            const isConnected = await firebaseService.checkConnection();
            Alert.alert('Firebase', `Подключение: ${isConnected ? 'Успешно' : 'Ошибка'}`);
        } catch (error) {
            Alert.alert('Ошибка', 'Проблема с Firebase');
        }
    };

    /**
     * Демонстрация работы с StorageService
     */
    const handleStorageTest = async () => {
        const testData = { counter: demoCounter, timestamp: Date.now() };
        
        // Сохраняем данные
        const saved = await StorageService.setItem('testData', testData);
        
        if (saved) {
            // Загружаем данные обратно
            const loaded = await StorageService.getItem('testData');
            Alert.alert('Storage', `Данные ${loaded ? 'сохранены и загружены' : 'не найдены'}`);
        } else {
            Alert.alert('Ошибка', 'Не удалось сохранить данные');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Управление ресурсами</Text>
            
            {/* Статус подключения */}
            <View style={styles.statusContainer}>
                <Text style={[styles.statusText, { color: isConnected ? 'green' : 'red' }]}>
                    Сеть: {isConnected ? 'Подключено' : 'Отключено'}
                </Text>
                <Text style={[styles.statusText, { color: audioLoading ? 'orange' : 'green' }]}>
                    Аудио: {audioLoading ? 'Загрузка...' : 'Готово'}
                </Text>
            </View>

            {/* Пользовательские настройки */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Настройки пользователя</Text>
                <Text>Тема: {userPreferences.theme}</Text>
                <Text>Язык: {userPreferences.language}</Text>
                <Text>Уведомления: {userPreferences.notifications ? 'Включены' : 'Выключены'}</Text>
                
                <TouchableOpacity style={styles.button} onPress={handleToggleTheme}>
                    <Text style={styles.buttonText}>Переключить тему</Text>
                </TouchableOpacity>
            </View>

            {/* Демонстрация счетчика */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Демо счетчик: {demoCounter}</Text>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => {
                        setDemoCounter(prev => prev + 1);
                        playJumpSound();
                    }}
                >
                    <Text style={styles.buttonText}>Увеличить счетчик</Text>
                </TouchableOpacity>
            </View>

            {/* Тестирование сервисов */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Тестирование сервисов</Text>
                
                <TouchableOpacity style={styles.button} onPress={handleSendScore}>
                    <Text style={styles.buttonText}>Отправить счет на сервер</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={handleFirebaseTest}>
                    <Text style={styles.buttonText}>Тест Firebase</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={handleStorageTest}>
                    <Text style={styles.buttonText}>Тест Storage</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={retry}>
                    <Text style={styles.buttonText}>Перезагрузить лидерборд</Text>
                </TouchableOpacity>
            </View>

            {/* Лидерборд */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Лидерборд</Text>
                {leaderboardLoading ? (
                    <Text>Загрузка...</Text>
                ) : leaderboardError ? (
                    <Text style={styles.errorText}>Ошибка: {leaderboardError}</Text>
                ) : leaderboardData ? (
                    <Text>Данные загружены: {JSON.stringify(leaderboardData).substring(0, 100)}...</Text>
                ) : (
                    <Text>Нет данных</Text>
                )}
            </View>

            {/* Ошибки */}
            {(prefsError || audioError) && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Ошибки:</Text>
                    {prefsError && <Text style={styles.errorText}>Настройки: {prefsError}</Text>}
                    {audioError && <Text style={styles.errorText}>Аудио: {audioError}</Text>}
                </View>
            )}
        </View>
    );
};

/**
 * Компонент, демонстрирующий использование контекстов
 */
const ContextExample: React.FC = () => {
    const { gameStats, currentGame, startGame, endGame, updateScore } = useGameContext();
    const { user, isAuthenticated, login, logout } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Использование контекстов</Text>
            
            {/* Аутентификация */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Аутентификация</Text>
                {isAuthenticated ? (
                    <View>
                        <Text>Пользователь: {user?.username}</Text>
                        <TouchableOpacity style={styles.button} onPress={logout}>
                            <Text style={styles.buttonText}>Выйти</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={() => login('test@example.com', 'password')}
                    >
                        <Text style={styles.buttonText}>Войти</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Игровая статистика */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Игровая статистика</Text>
                <Text>Рекорд: {gameStats.highScore}</Text>
                <Text>Игр сыграно: {gameStats.totalGamesPlayed}</Text>
                <Text>Текущий счет: {currentGame.score}</Text>
                
                <TouchableOpacity style={styles.button} onPress={startGame}>
                    <Text style={styles.buttonText}>Начать игру</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={() => updateScore(currentGame.score + 10)}>
                    <Text style={styles.buttonText}>+10 очков</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={() => endGame(currentGame.score)}>
                    <Text style={styles.buttonText}>Завершить игру</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

/**
 * Главный компонент с провайдерами
 */
const ResourceManagementExampleWithProviders: React.FC = () => {
    return (
        <AuthProvider>
            <GameProvider>
                <View style={styles.appContainer}>
                    <ResourceManagementExample />
                    <ContextExample />
                </View>
            </GameProvider>
        </AuthProvider>
    );
};

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        padding: 20,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        marginVertical: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
    },
});

export default ResourceManagementExampleWithProviders;
