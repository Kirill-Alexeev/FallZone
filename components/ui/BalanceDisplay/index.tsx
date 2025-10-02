// Показывает количество монет игрока
// Отображает иконку монеты и текущий баланс
// (Интеграция с AsyncStorage/Context для реального баланса)

import React from 'react';
import { Text, View } from 'react-native';
import CoinSvg from '../../../assets/sprites/ui/coin.svg';
import { balanceDisplayStyles } from './BalanceDisplay.styles';

interface BalanceDisplayProps {
    balance: number; // Позже из storage или context
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance }) => {
    return (
        <View style={balanceDisplayStyles.container}>
            <CoinSvg width={20} height={20} />
            <Text style={balanceDisplayStyles.text}>{balance}</Text>
        </View>
    );
};

export default BalanceDisplay;