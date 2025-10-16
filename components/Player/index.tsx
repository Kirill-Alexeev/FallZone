import React from 'react';
import { Image, View } from 'react-native';
import { playerStyles } from './Player.styles';

interface PlayerProps {
    x: number;
    y: number;
    size: number;
    rotation: number;
    character: string;
}

const Player: React.FC<PlayerProps> = ({ x, y, size, rotation, character }) => {
    const getCharacterImage = (char: string) => {
        switch (char) {
            case 'astronaut':
            default:
                // Используем статичное изображение вместо spritesheet
                return require('../../assets/sprites/characters/player_default_static.png');
        }
    };

    const playerImage = getCharacterImage(character);

    return (
        <View style={[
            playerStyles.player,
            {
                left: x,
                top: y,
                width: size,
                height: size,
                transform: [{ rotate: `${rotation}deg` }]
            }
        ]}>
            <Image
                source={playerImage}
                style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain'
                }}
            />
        </View>
    );
};

export default Player;