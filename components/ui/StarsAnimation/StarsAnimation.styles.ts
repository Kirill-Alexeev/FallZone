// Стили для анимированных звезд.

import { StyleSheet } from 'react-native';

export const starsAnimationStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    star: {
        position: 'absolute',
        width: 2,
        height: 2,
        backgroundColor: '#FFF',
        borderRadius: 1,
    },
});