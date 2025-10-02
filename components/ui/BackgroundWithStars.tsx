// Обертка для всех экранов с градиентом и звездами. 
// Дети (содержимое экрана) передаются через пропс children.

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import StarsAnimation from './StarsAnimation';

interface BackgroundWithStarsProps {
    children: React.ReactNode;
}

const BackgroundWithStars: React.FC<BackgroundWithStarsProps> = ({ children }) => {
    return (
        <LinearGradient
            colors={['#000', '#4B0082', '#00008B']} // Градиент: черный -> темно-фиолетовый -> темно-синий
            style={styles.container}
        >
            <StarsAnimation />
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default BackgroundWithStars;