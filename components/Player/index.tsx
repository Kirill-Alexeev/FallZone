import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { playerStyles } from './Player.styles';

interface PlayerProps {
    x: number;
    y: number;
    size: number;
    rotation: number;
    character: string;
}

const Player: React.FC<PlayerProps> = ({ x, y, size, rotation, character }) => {
    const getCharacterSvg = (char: string) => {
        switch (char) {
            case 'astronaut':
                return `
                    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="5" fill="#4a5568"/>
                        <path d="M12 13v6"/>
                        <path d="M12 13c-2.5 0-4.5 1.5-4.5 4"/>
                        <path d="M12 13c2.5 0 4.5 1.5 4.5 4"/>
                        <circle cx="12" cy="5" r="1" fill="white"/>
                    </svg>
                `;
            default:
                return `
                    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" fill="#3182ce"/>
                        <circle cx="12" cy="9" r="1" fill="white"/>
                        <circle cx="12" cy="15" r="1" fill="white"/>
                    </svg>
                `;
        }
    };

    const playerSvg = getCharacterSvg(character);

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
            <SvgXml xml={playerSvg} width="100%" height="100%" />
        </View>
    );
};

export default Player;