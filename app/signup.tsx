// app/signup.tsx
import React, { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomButton from '../components/ui/CustomButton';
import CustomText from '../components/ui/CustomText';
import { useAuth } from '../context/AuthContext';
import { authStyles } from './auth.styles';

interface SignUpScreenProps {
    onBack?: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp, user } = useAuth();

    // Если уже авторизован - компонент не должен отображаться
    if (user) {
        return null;
    }

    const handleSignUp = async () => {
        setError('');

        // Валидация
        if (!email || !password || !confirmPassword) {
            setError('Заполните все поля');
            return;
        }

        if (!email.includes('@')) {
            setError('Введите корректный email');
            return;
        }

        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);
        const result = await signUp(email, password);
        setLoading(false);

        if (!result.success) {
            setError(result.error || 'Ошибка регистрации');
            Alert.alert('Ошибка регистрации', result.error);
        }
        // При успехе MainApp покажет главную страницу
    };

    const goToLogin = () => {
        if (onBack) {
            onBack();
        }
    };

    return (
        <BackgroundWithStars>
            <View style={authStyles.container}>
                <CustomText style={authStyles.title}>Fall Zone</CustomText>
                <CustomText style={authStyles.subtitle}>Создание аккаунта</CustomText>

                {error ? <CustomText style={authStyles.errorText}>{error}</CustomText> : null}

                <TextInput
                    style={authStyles.input}
                    placeholder="Email"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                />

                <TextInput
                    style={authStyles.input}
                    placeholder="Пароль (мин. 6 символов)"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                />

                <TextInput
                    style={authStyles.input}
                    placeholder="Повторите пароль"
                    placeholderTextColor="#888"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                />

                <CustomButton
                    title={loading ? "Регистрация..." : "Зарегистрироваться"}
                    onPress={handleSignUp}
                    disabled={loading}
                    buttonStyle={authStyles.button}
                />

                <CustomButton
                    title="Уже есть аккаунт? Войти"
                    onPress={goToLogin}
                    disabled={loading}
                    buttonStyle={authStyles.linkButton}
                    textStyle={authStyles.linkText}
                />
            </View>
        </BackgroundWithStars>
    );
};

export default SignUpScreen;