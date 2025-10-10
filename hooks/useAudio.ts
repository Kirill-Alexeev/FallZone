import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';

// Интерфейс для звуковых эффектов
interface SoundEffects {
    jump: Audio.Sound | null;
    score: Audio.Sound | null;
    gameOver: Audio.Sound | null;
    button: Audio.Sound | null;
}

// Интерфейс для настроек звука
interface AudioSettings {
    soundEnabled: boolean;
    musicEnabled: boolean;
    vibrationEnabled: boolean;
    soundVolume: number;
    musicVolume: number;
}

/**
 * Хук для управления звуковыми эффектами и вибрацией
 * Предоставляет централизованное управление аудио ресурсами
 * Автоматически загружает и выгружает звуки для оптимизации памяти
 */
function useAudio(settings: AudioSettings) {
    // Состояние звуковых объектов
    const [sounds, setSounds] = useState<SoundEffects>({
        jump: null,
        score: null,
        gameOver: null,
        button: null,
    });

    // Состояние загрузки звуков
    const [loading, setLoading] = useState<boolean>(true);
    
    // Состояние ошибок
    const [error, setError] = useState<string | null>(null);

    // Ref для отслеживания загруженных звуков
    const soundsLoadedRef = useRef<boolean>(false);

    /**
     * Загружает звуковой файл
     * @param soundName - имя звука
     * @param soundFile - путь к файлу звука
     */
    const loadSound = useCallback(async (soundName: keyof SoundEffects, soundFile: any) => {
        try {
            const { sound } = await Audio.Sound.createAsync(soundFile);
            
            // Устанавливаем громкость
            await sound.setVolumeAsync(settings.soundVolume);
            
            setSounds(prev => ({
                ...prev,
                [soundName]: sound,
            }));

            return sound;
        } catch (err) {
            const errorMessage = `Ошибка загрузки звука ${soundName}: ${err}`;
            setError(errorMessage);
            console.error(errorMessage);
            return null;
        }
    }, [settings.soundVolume]);

    /**
     * Загружает все звуковые эффекты
     */
    const loadAllSounds = useCallback(async () => {
        if (soundsLoadedRef.current) return;
        
        try {
            setLoading(true);
            setError(null);

            // Здесь должны быть импорты звуковых файлов
            // Для примера используем заглушки
            const soundFiles = {
                jump: require('../assets/sounds/jump.mp3'),
                score: require('../assets/sounds/score.mp3'),
                gameOver: require('../assets/sounds/gameover.mp3'),
                button: require('../assets/sounds/button.mp3'),
            };

            // Загружаем все звуки параллельно
            const loadPromises = Object.entries(soundFiles).map(([name, file]) =>
                loadSound(name as keyof SoundEffects, file)
            );

            await Promise.all(loadPromises);
            soundsLoadedRef.current = true;
        } catch (err) {
            const errorMessage = `Ошибка загрузки звуков: ${err}`;
            setError(errorMessage);
            console.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [loadSound]);

    /**
     * Воспроизводит звуковой эффект
     * @param soundName - имя звука для воспроизведения
     */
    const playSound = useCallback(async (soundName: keyof SoundEffects) => {
        if (!settings.soundEnabled) return;

        const sound = sounds[soundName];
        if (!sound) {
            console.warn(`Звук ${soundName} не загружен`);
            return;
        }

        try {
            // Сбрасываем позицию звука и воспроизводим
            await sound.setPositionAsync(0);
            await sound.playAsync();
        } catch (err) {
            console.error(`Ошибка воспроизведения звука ${soundName}:`, err);
        }
    }, [sounds, settings.soundEnabled]);

    /**
     * Воспроизводит вибрацию
     * @param pattern - паттерн вибрации (опционально)
     */
    const playVibration = useCallback((pattern?: number | number[]) => {
        if (!settings.vibrationEnabled) return;

        try {
            if (pattern) {
                Vibration.vibrate(pattern);
            } else {
                Vibration.vibrate(100); // Короткая вибрация по умолчанию
            }
        } catch (err) {
            console.error('Ошибка вибрации:', err);
        }
    }, [settings.vibrationEnabled]);

    /**
     * Комбинированный эффект: звук + вибрация
     * @param soundName - имя звука
     * @param vibrationPattern - паттерн вибрации
     */
    const playEffect = useCallback(async (soundName: keyof SoundEffects, vibrationPattern?: number | number[]) => {
        // Воспроизводим звук и вибрацию параллельно
        await Promise.all([
            playSound(soundName),
            vibrationPattern ? playVibration(vibrationPattern) : Promise.resolve(),
        ]);
    }, [playSound, playVibration]);

    /**
     * Останавливает все звуки
     */
    const stopAllSounds = useCallback(async () => {
        const stopPromises = Object.values(sounds).map(async (sound) => {
            if (sound) {
                try {
                    await sound.stopAsync();
                } catch (err) {
                    console.error('Ошибка остановки звука:', err);
                }
            }
        });

        await Promise.all(stopPromises);
    }, [sounds]);

    /**
     * Выгружает все звуки из памяти
     */
    const unloadSounds = useCallback(async () => {
        const unloadPromises = Object.values(sounds).map(async (sound) => {
            if (sound) {
                try {
                    await sound.unloadAsync();
                } catch (err) {
                    console.error('Ошибка выгрузки звука:', err);
                }
            }
        });

        await Promise.all(unloadPromises);
        
        setSounds({
            jump: null,
            score: null,
            gameOver: null,
            button: null,
        });
        
        soundsLoadedRef.current = false;
    }, [sounds]);

    /**
     * Обновляет громкость всех звуков
     * @param volume - новая громкость (0-1)
     */
    const updateVolume = useCallback(async (volume: number) => {
        const updatePromises = Object.values(sounds).map(async (sound) => {
            if (sound) {
                try {
                    await sound.setVolumeAsync(volume);
                } catch (err) {
                    console.error('Ошибка обновления громкости:', err);
                }
            }
        });

        await Promise.all(updatePromises);
    }, [sounds]);

    // Загружаем звуки при монтировании
    useEffect(() => {
        loadAllSounds();

        // Выгружаем звуки при размонтировании
        return () => {
            unloadSounds();
        };
    }, [loadAllSounds, unloadSounds]);

    // Обновляем громкость при изменении настроек
    useEffect(() => {
        updateVolume(settings.soundVolume);
    }, [settings.soundVolume, updateVolume]);

    return {
        // Состояние
        loading,
        error,
        soundsLoaded: soundsLoadedRef.current,
        
        // Действия
        playSound,
        playVibration,
        playEffect,
        stopAllSounds,
        loadSound,
        unloadSounds,
        updateVolume,
        
        // Предустановленные эффекты для удобства
        playJumpSound: () => playEffect('jump', 50),
        playScoreSound: () => playEffect('score', 100),
        playGameOverSound: () => playEffect('gameOver', [200, 100, 200]),
        playButtonSound: () => playEffect('button', 30),
    };
}

export default useAudio;
