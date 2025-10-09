import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface ObstacleProps {
    x: number;
    y: number; // Позиция верхнего края верхнего препятствия
    width: number;
    height: number; // Общая высота верхнего препятствия
    gap: number; // Промежуток между верхним и нижним препятствием
    color: string;
    screenHeight: number; // Добавим высоту экрана
}

const Obstacle: React.FC<ObstacleProps> = ({ x, y, width, height, gap, color, screenHeight }) => {
    const bottomObstacleHeight = screenHeight - (height + gap);

    const obstacleSvg = (isTop: boolean) => `<svg width="${width}" height="${isTop ? height : bottomObstacleHeight}" viewBox="0 0 ${width} ${isTop ? height : bottomObstacleHeight}" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="0" y="0" width="${width}" height="${isTop ? height : bottomObstacleHeight}" rx="10" fill="#6a5acd" stroke="#8a2be2" />
        
    </svg>`;

    return (
        <>
            <View style={[
                styles.obstacle,
                { left: x, top: y, width: width, height: height }
            ]}>
                <SvgXml xml={obstacleSvg(true)} width="100%" height="100%" />
            </View>
            <View style={[
                styles.obstacle,
                { left: x, top: height + gap, width: width, height: bottomObstacleHeight }
            ]}>
                <SvgXml xml={obstacleSvg(false)} width="100%" height="100%" />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    obstacle: {
        position: 'absolute',
    },
});

export default Obstacle;
