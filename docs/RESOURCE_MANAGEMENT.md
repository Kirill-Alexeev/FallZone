# Управление ресурсами и хуки в FallZone

Этот документ описывает систему управления ресурсами приложения и использование хуков для оптимизации производительности и управления состоянием.

## 📋 Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Хуки для управления ресурсами](#хуки-для-управления-ресурсами)
3. [Контексты](#контексты)
4. [Сервисы](#сервисы)
5. [Примеры использования](#примеры-использования)
6. [Лучшие практики](#лучшие-практики)

## 🏗️ Обзор архитектуры

Приложение использует многоуровневую архитектуру для управления ресурсами:

```
┌─────────────────────────────────────┐
│           UI Components             │
├─────────────────────────────────────┤
│           Custom Hooks              │
├─────────────────────────────────────┤
│           Context Providers         │
├─────────────────────────────────────┤
│           Services Layer            │
├─────────────────────────────────────┤
│        External Resources           │
│  (AsyncStorage, Network, Firebase)  │
└─────────────────────────────────────┘
```

## 🎣 Хуки для управления ресурсами

### 1. `useGameLoop` - Управление игровым циклом

**Назначение**: Управляет анимационным циклом игры с использованием `requestAnimationFrame`.

**Особенности**:
- Автоматическая очистка ресурсов при размонтировании
- Управление deltaTime для плавной анимации
- Возможность сброса цикла

```typescript
const { resetLoop } = useGameLoop({ 
    onUpdate: (deltaTime) => {
        // Обновление игровой логики
        gameEngine.update(deltaTime);
    },
    isRunning: isGameActive 
});
```

**Управление ресурсами**:
- ✅ Отменяет `requestAnimationFrame` при размонтировании
- ✅ Сбрасывает состояние при остановке
- ✅ Предотвращает утечки памяти

### 2. `useLocalStorage` - Работа с локальным хранилищем

**Назначение**: Типизированная работа с AsyncStorage с автоматической синхронизацией.

**Особенности**:
- Автоматическая загрузка при монтировании
- Обработка ошибок с fallback значениями
- Состояние загрузки и ошибок

```typescript
const [userSettings, setUserSettings, loading, error] = useLocalStorage('userSettings', {
    theme: 'dark',
    soundEnabled: true
});
```

**Управление ресурсами**:
- ✅ Автоматическая сериализация/десериализация
- ✅ Обработка ошибок без краша приложения
- ✅ Оптимизированные обновления

### 3. `useGameState` - Глобальное состояние игры

**Назначение**: Централизованное управление состоянием игры, статистикой и прогрессом.

**Особенности**:
- Объединяет статистику, настройки и прогресс
- Автоматическое сохранение в локальное хранилище
- Предотвращение частых обновлений

```typescript
const {
    gameStats,
    gameSettings,
    gameProgress,
    startGame,
    endGame,
    updateScore
} = useGameState();
```

**Управление ресурсами**:
- ✅ Дебаунсинг обновлений (не чаще раза в секунду)
- ✅ Автоматическое сохранение состояния
- ✅ Оптимизированные ререндеры

### 4. `useAudio` - Управление звуковыми ресурсами

**Назначение**: Централизованное управление звуковыми эффектами и вибрацией.

**Особенности**:
- Ленивая загрузка звуков
- Автоматическая выгрузка при размонтировании
- Управление громкостью и настройками

```typescript
const { playJumpSound, playScoreSound, loading, error } = useAudio({
    soundEnabled: true,
    soundVolume: 0.8
});
```

**Управление ресурсами**:
- ✅ Ленивая загрузка звуков (только при необходимости)
- ✅ Автоматическая выгрузка из памяти
- ✅ Управление громкостью всех звуков
- ✅ Обработка ошибок загрузки

### 5. `useNetwork` - Управление сетевыми запросами

**Назначение**: Управление HTTP запросами с автоматическими повторами и таймаутами.

**Особенности**:
- Автоматические повторы при ошибках сети
- Управление таймаутами
- Отмена запросов при размонтировании

```typescript
const { postRequest, useGetRequest, isConnected } = useNetwork();

// GET запрос с автоматическим управлением состоянием
const { data, loading, error, retry } = useGetRequest('/api/leaderboard');

// POST запрос
const result = await postRequest('/api/scores', { score: 100 });
```

**Управление ресурсами**:
- ✅ Автоматическая отмена запросов при размонтировании
- ✅ Управление AbortController для отмены запросов
- ✅ Обработка таймаутов
- ✅ Автоматические повторы при сетевых ошибках

## 🏛️ Контексты

### `GameContext` - Контекст игры

Предоставляет глобальный доступ к состоянию игры во всем приложении.

```typescript
// В корне приложения
<GameProvider>
    <App />
</GameProvider>

// В компонентах
const { gameStats, startGame, endGame } = useGameContext();
```

### `AuthContext` - Контекст аутентификации

Управляет состоянием пользователя и аутентификацией.

```typescript
// В корне приложения
<AuthProvider>
    <App />
</AuthProvider>

// В компонентах
const { user, isAuthenticated, login, logout } = useAuth();
```

## 🔧 Сервисы

### `StorageService` - Сервис локального хранилища

Статический класс для работы с AsyncStorage.

```typescript
// Сохранение данных
await StorageService.setItem('key', data);

// Загрузка данных
const data = await StorageService.getItem('key', defaultValue);

// Массовые операции
await StorageService.setMultiple([
    ['key1', value1],
    ['key2', value2]
]);
```

### `FirebaseService` - Сервис Firebase

Singleton для управления Firebase сервисами.

```typescript
// Получение экземпляра
const firebase = FirebaseService.getInstance();

// Проверка подключения
const isConnected = await firebase.checkConnection();

// Логирование событий
firebase.logEvent('game_started', { level: 1 });
```

## 📝 Примеры использования

### Базовый пример компонента

```typescript
import React from 'react';
import { useGameContext } from '../context/GameContext';
import useLocalStorage from '../hooks/useLocalStorage';
import useAudio from '../hooks/useAudio';

const GameComponent: React.FC = () => {
    // Использование контекста игры
    const { gameStats, startGame } = useGameContext();
    
    // Локальные настройки
    const [settings, setSettings] = useLocalStorage('gameSettings', {
        soundEnabled: true
    });
    
    // Аудио
    const { playJumpSound } = useAudio({
        soundEnabled: settings.soundEnabled
    });
    
    const handleStart = () => {
        startGame();
        playJumpSound();
    };
    
    return (
        <View>
            <Text>Рекорд: {gameStats.highScore}</Text>
            <Button onPress={handleStart} title="Начать игру" />
        </View>
    );
};
```

### Пример с сетевыми запросами

```typescript
import React from 'react';
import { useNetwork } from '../hooks/useNetwork';

const LeaderboardComponent: React.FC = () => {
    const { useGetRequest, postRequest, isConnected } = useNetwork();
    
    // Автоматическая загрузка данных
    const { data, loading, error, retry } = useGetRequest('/api/leaderboard');
    
    const handleSubmitScore = async (score: number) => {
        if (!isConnected) {
            Alert.alert('Ошибка', 'Нет подключения к интернету');
            return;
        }
        
        try {
            await postRequest('/api/scores', { score });
            Alert.alert('Успех', 'Счет отправлен');
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось отправить счет');
        }
    };
    
    if (loading) return <Text>Загрузка...</Text>;
    if (error) return <Text>Ошибка: {error}</Text>;
    
    return (
        <View>
            {data?.map(item => (
                <Text key={item.id}>{item.username}: {item.score}</Text>
            ))}
        </View>
    );
};
```

## 🎯 Лучшие практики

### 1. Управление ресурсами

- ✅ **Всегда очищайте ресурсы** в useEffect cleanup функциях
- ✅ **Используйте useRef** для значений, которые не должны вызывать ререндеры
- ✅ **Отменяйте запросы** при размонтировании компонентов
- ✅ **Ленивая загрузка** ресурсов (звуки, изображения)

### 2. Оптимизация производительности

- ✅ **useCallback** для функций, передаваемых в дочерние компоненты
- ✅ **useMemo** для дорогих вычислений
- ✅ **Дебаунсинг** частых обновлений (например, счет в игре)
- ✅ **Мемоизация** компонентов с React.memo

### 3. Обработка ошибок

- ✅ **Graceful degradation** - приложение должно работать даже при ошибках
- ✅ **Fallback значения** для всех асинхронных операций
- ✅ **Логирование ошибок** для отладки
- ✅ **Пользовательские уведомления** об ошибках

### 4. Управление состоянием

- ✅ **Единый источник истины** - используйте контексты для глобального состояния
- ✅ **Локальное состояние** для UI-специфичных данных
- ✅ **Автоматическое сохранение** важных данных
- ✅ **Валидация данных** перед сохранением

### 5. Сетевое взаимодействие

- ✅ **Проверка подключения** перед запросами
- ✅ **Автоматические повторы** для сетевых ошибок
- ✅ **Таймауты** для предотвращения зависания
- ✅ **Кэширование** данных для офлайн режима

## 🚀 Заключение

Эта архитектура обеспечивает:

1. **Эффективное управление ресурсами** - автоматическая очистка и оптимизация
2. **Типобезопасность** - полная поддержка TypeScript
3. **Переиспользуемость** - хуки и сервисы можно использовать в любых компонентах
4. **Масштабируемость** - легко добавлять новые хуки и сервисы
5. **Отладка** - подробное логирование и обработка ошибок

Все хуки и сервисы следуют принципам React и обеспечивают оптимальную производительность приложения.
