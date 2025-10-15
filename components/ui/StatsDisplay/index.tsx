import React from 'react';
import { View } from 'react-native';
import { useGame } from '../../../context/GameContext';
import CustomText from '../CustomText';
import { statsDisplayStyles } from './StatsDisplay.styles';

const StatsDisplay: React.FC = () => {
    const { gameData } = useGame();

    return (
        <View style={statsDisplayStyles.container}>
            <CustomText style={statsDisplayStyles.text}>
                Лучший рекорд: {gameData.highScore}
            </CustomText>
        </View>
    );
};

export default StatsDisplay;