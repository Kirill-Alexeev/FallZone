// Переиспользуемый компонент кнопки для всего приложения. 
// Он принимает заголовок (опционально), иконку (опционально), обработчик нажатия.
// Компонент адаптируется в зависимости от пропсов: 
// - Если передан только title — кнопка с текстом.
// - Если передан только icon — кнопка с иконкой (например, пауза).
// - Если переданы оба — кнопка с иконкой и текстом рядом (flex row).
// Это позволяет использовать его в игре для паузы, меню, действий и т.д.

import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomButtonProps {
    title?: string; // Опциональный текст кнопки
    icon?: ReactNode; // Опциональная иконка
    onPress: () => void; // Обработчик нажатия (обязательный)
    disabled?: boolean; // Опционально: отключение кнопки
}

const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    icon,
    onPress,
    disabled = false
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <View style={styles.content}>
                {icon && icon}
                {title && <Text style={[styles.text]}>{title}</Text>}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 10,
        backgroundColor: 'blue', // Базовый цвет для видимости; позже заменить на пиксельный стиль
        borderRadius: 5, // Опционально: скругленные углы
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    content: {
        flexDirection: 'row', // Для размещения иконки и текста рядом
        alignItems: 'center',
    },
    text: {
        color: 'white',
        textAlign: 'center',
        marginLeft: 5, // Отступ от иконки, если она есть
    },
    disabled: {
        opacity: 0.5, // Визуальное отключение
    },
});

export default CustomButton;