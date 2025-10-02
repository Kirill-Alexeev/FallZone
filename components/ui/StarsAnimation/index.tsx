// Создает анимированный звездный фон
// Генерирует 50 случайных звезд по всему экрану
// Каждая звезда имеет уникальную анимацию fade in/out
// Использует React Native Reanimated для плавности

import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { starsAnimationStyles } from './StarsAnimation.styles';

const NUM_STARS = 50;
const { width, height } = Dimensions.get('window');

const StarsAnimation = () => {
    const stars = Array.from({ length: NUM_STARS }).map((_, index) => {
        const opacity = useSharedValue(0);
        const position = {
            top: Math.random() * height,
            left: Math.random() * width,
        };

        useEffect(() => {
            opacity.value = withRepeat(
                withTiming(1, { duration: Math.random() * 2000 + 1000 }),
                -1,
                true // Reverse для fade out
            );
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
            opacity: opacity.value,
        }));

        return (
            <Animated.View
                key={index}
                style={[starsAnimationStyles.star, { top: position.top, left: position.left }, animatedStyle]}
            />
        );
    });

    return <View style={starsAnimationStyles.container}>{stars}</View>;
};

export default StarsAnimation;