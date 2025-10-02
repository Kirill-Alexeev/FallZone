// Переиспользуемый компонент кнопки с поддержкой иконки, текста или обоих.
// Можно кастомизировать стили через пропсы.
// Динамический стиль для button — фон только если есть title (без icon или с ним).

import React, { ReactNode } from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { customButtonStyles } from './CustomButton.styles';

interface CustomButtonProps {
    title?: string;
    icon?: ReactNode;
    onPress: () => void;
    disabled?: boolean;
    buttonStyle?: ViewStyle;
    textStyle?: TextStyle;
    iconStyle?: ViewStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    icon,
    onPress,
    disabled = false,
    buttonStyle,
    textStyle,
    iconStyle
}) => {
    const hasText = !!title;
    const dynamicButtonStyle = hasText ? customButtonStyles.buttonWithText : {};

    return (
        <TouchableOpacity
            style={[customButtonStyles.button, dynamicButtonStyle, buttonStyle, disabled && customButtonStyles.disabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <View style={customButtonStyles.content}>
                {icon && <View style={iconStyle}>{icon}</View>}
                {title && <Text style={[customButtonStyles.text, textStyle]}>{title}</Text>}
            </View>
        </TouchableOpacity>
    );
};

export default CustomButton;