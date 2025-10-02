// Экран для покупки внутриигрового контента
// Заглушка для будущего магазина

import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomText from '../components/ui/CustomText';

const ShopScreen = () => {
    return (
        <BackgroundWithStars>
            <CustomText style={styles.title}>Магазин</CustomText>
            <Text style={styles.placeholder}>Здесь будет магазин (покупка скинов, фонов за монеты)</Text>
        </BackgroundWithStars>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
    },
    placeholder: {
        color: '#888',
        textAlign: 'center',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});

export default ShopScreen;