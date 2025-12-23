import React from 'react';
import { View } from 'react-native';
import CoinSvg from '../../../assets/sprites/ui/coin.svg';
import { useGame } from '../../../context/GameContext';
import CustomText from '../CustomText';
import { balanceDisplayStyles } from './BalanceDisplay.styles';

const BalanceDisplay: React.FC = () => {
    const { gameData } = useGame();

    return (
        <View style={balanceDisplayStyles.container}>
            <CoinSvg width={20} height={20} />
            <CustomText style={balanceDisplayStyles.text}>
                {gameData?.coins}
            </CustomText>
        </View>
    );
};

export default BalanceDisplay;