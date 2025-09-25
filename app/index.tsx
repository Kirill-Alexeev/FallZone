// Главный экран (меню) приложения. 
// Служит точкой входа с кнопками для навигации к другим экранам.
import CustomButton from '@/components/ui/CustomButton';
import CustomInput from '@/components/ui/CustomInput';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Fall Zone - Главное меню</Text>
            <CustomButton title='Кнопка' onPress={()=>{}}></CustomButton>
            <CustomInput placeholder='Введите текст' onChangeText={()=>{}}></CustomInput>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;