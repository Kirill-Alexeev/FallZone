// Корневой файл навигации для Expo Router, переключен на BottomTabs для вкладок внизу экрана.

import { Tabs } from 'expo-router';

const Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: { backgroundColor: '#000' },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#888',
            }}>
            <Tabs.Screen
                name="index"
                options={{ title: 'Главная', headerShown: true }}
            />
            <Tabs.Screen
                name="game"
                options={{ title: 'Игра', headerShown: false }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{ title: 'Таблица лидеров', headerShown: true }}
            />
            <Tabs.Screen
                name="settings"
                options={{ title: 'Настройки', headerShown: true }}
            />
            <Tabs.Screen
                name="shop"
                options={{ title: 'Магазин', headerShown: true }}
            />
        </Tabs>
    );
};

export default Layout;