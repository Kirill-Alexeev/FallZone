// app/signup.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomButton from '../components/ui/CustomButton';
import CustomText from '../components/ui/CustomText';
import { useAuth } from '../context/AuthContext';
import { authStyles } from './auth.styles';

const SignUpScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp, user } = useAuth();
    const router = useRouter();

    // Если уже авторизован - редирект на главную
    useEffect(() => {
        if (user) {
            router.replace('/');
        }
    }, [user]);

    const handleSignUp = async () => {
        setError('');

        if (!email || !password || !confirmPassword) {
            setError('Заполните все поля');
            return;
        }

        if (!email.includes('@')) {
            setError('Введите корректный email');
            return;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password);
            // Редирект произойдет автоматически через useEffect выше
        } catch (error: any) {
            const errorMessage = error.message || 'Ошибка при создании аккаунта';
            setError(errorMessage);
            Alert.alert('Ошибка регистрации', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const goToLogin = () => {
        router.push('/login' as any); // временное решение
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