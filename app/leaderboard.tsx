// Экран для отображения рекордов и достижений игроков
// Заглушка для будущей таблицы лидеров

import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomText from '../components/ui/CustomText';

const LeaderboardScreen = () => {
    return (
        <BackgroundWithStars>
            <CustomText style={styles.title}>Таблица лидеров</CustomText>
            <Text style={styles.placeholder}>Здесь будет таблица лидеров (рекорды, ежедневные вызовы и т.д.)</Text>
        </BackgroundWithStars>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
    },
    placeholder: {
        color: '#888',
        textAlign: 'center',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});

export default LeaderboardScreen;