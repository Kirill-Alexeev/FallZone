import { StyleSheet } from 'react-native';

export const customButtonStyles = StyleSheet.create({
    button: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonWithText: {
        backgroundColor: '#00FFFF', // Фон только для кнопок с текстом
        shadowColor: '#00FFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    content: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    text: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 5,
    },
    disabled: {
        opacity: 0.5,
    },
});