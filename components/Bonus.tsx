// components/Bonus/Bonus.tsx
import React from 'react';
import { Image, View } from 'react-native';

interface BonusProps {
    x: number;
    y: number;
    type: 'shield' | 'magnet' | 'coin';
    size?: number;
}

const Bonus: React.FC<BonusProps> = ({ x, y, type, size = 30 }) => {
    const getBonusImage = (bonusType: string) => {
        switch (bonusType) {
            case 'shield':
                return require('../assets/sprites/bonuses/shield.png');
            case 'magnet':
                return require('../assets/sprites/bonuses/magnet.png');
            case 'coin':
            default:
                return require('../assets/sprites/bonuses/coin.png');
        }
    };

    return (
        <View
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size,
            }}
        >
            <Image
                source={getBonusImage(type)}
                style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain'
                }}
            />
        </View>
    );
};

export default Bonus;