// app/login.tsx
import React, { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomButton from '../components/ui/CustomButton';
import CustomText from '../components/ui/CustomText';
import { useAuth } from '../context/AuthContext';
import { authStyles } from './auth.styles';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSignup, setShowSignup] = useState(false); // Новое состояние
    const { signIn, user } = useAuth();

    // Если уже авторизован - компонент не должен отображаться
    // (MainApp в _layout.tsx перенаправит на главную)
    if (user) {
        return null;
    }

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Заполните все поля');
            return;
        }

        setLoading(true);

        const result = await signIn(email, password);

        if (!result.success) {
            setError(result.error || 'Ошибка входа');
            Alert.alert('Ошибка входа', result.error);
        }
        // При успехе MainApp покажет главную страницу

        setLoading(false);
    };

    const goToSignup = () => {
        setShowSignup(true);
    };

    // Если showSignup true, показываем SignUpScreen
    if (showSignup) {
        const SignUpScreen = require('./signup').default;
        return <SignUpScreen onBack={() => setShowSignup(false)} />;
    }

    return (
        <BackgroundWithStars>
            <View style={authStyles.container}>
                <CustomText style={authStyles.title}>Fall Zone</CustomText>
                <CustomText style={authStyles.subtitle}>Вход в аккаунт</CustomText>

                {error ? <CustomText style={authStyles.errorText}>{error}</CustomText> : null}

                <TextInput
                    style={authStyles.input}
                    placeholder="test@example.com"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                />

                <TextInput
                    style={authStyles.input}
                    placeholder="пароль123"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                />

                <CustomButton
                    title={loading ? "Вход..." : "Войти"}
                    onPress={handleLogin}
                    disabled={loading}
                    buttonStyle={authStyles.button}
                />

                <CustomButton
                    title="Нет аккаунта? Зарегистрироваться"
                    onPress={goToSignup}
                    disabled={loading}
                    buttonStyle={authStyles.linkButton}
                    textStyle={authStyles.linkText}
                />
            </View>
        </BackgroundWithStars>
    );
};

export default LoginScreen;