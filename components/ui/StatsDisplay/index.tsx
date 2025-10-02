// Компонент для отображения статистики (рекорд).
// Text с данными из AsyncStorage (заглушка).

import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { statsDisplayStyles } from './StatsDisplay.styles';

interface StatsDisplayProps {
    highScore: number;
    style?: ViewStyle;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ highScore, style }) => {
    return (
        <View style={[statsDisplayStyles.container, style]}>
            <Text style={statsDisplayStyles.text}>Лучший рекорд: {highScore}</Text>
        </View>
    );
};

export default StatsDisplay;