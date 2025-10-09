import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface PlayerProps {
    x: number;
    y: number;
    size: number;
    character: string; // Например, 'default' для default.svg
}

const Player: React.FC<PlayerProps> = ({ x, y, size, character }) => {
    // Здесь можно загружать SVG динамически в зависимости от character
    // Для простоты пока используем заглушку или один файл
    const getCharacterSvg = (char: string) => {
        switch (char) {
            case 'default':
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z"></path><path d="M2 22h20"></path><path d="M7 12v3"></path><path d="M17 12v3"></path></svg>`;
            default:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>`; // Заглушка
        }
    };

    const playerSvg = getCharacterSvg(character);

    return (
        <View style={[
            styles.player,
            { left: x, top: y, width: size, height: size }
        ]}>
            <SvgXml xml={playerSvg} width="100%" height="100%" />
        </View>
    );
};

const styles = StyleSheet.create({
    player: {
        position: 'absolute',
        // backgroundColor: 'blue', // Для отладки
    },
});

export default Player;
