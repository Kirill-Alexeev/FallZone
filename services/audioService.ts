// services/AudioService.ts
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import { Platform, Vibration } from 'react-native';

class AudioService {
    private sounds: Map<string, Audio.Sound> = new Map();
    private backgroundMusic: Audio.Sound | null = null;
    private isMuted = false;
    private isMusicMuted = false;
    private isVibrationEnabled = true;
    private currentMusicType: 'menu' | 'game' | null = null;

    // Загрузка всех звуков
    async loadSounds() {
        try {
            const soundFiles = {
                jump: require('../assets/sounds/jump.wav'),
                coin_collect: require('../assets/sounds/coin_collect.wav'),
                game_over: require('../assets/sounds/game_over.wav'),
                bonus_collect: require('../assets/sounds/bonus_collect.wav'),
                button_click: require('../assets/sounds/button_click.wav'),
                obstacle_hit: require('../assets/sounds/obstacle_hit.wav'),
            };

            for (const [key, source] of Object.entries(soundFiles)) {
                const { sound } = await Audio.Sound.createAsync(source);
                this.sounds.set(key, sound);
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: false,
            });

            console.log('All sounds loaded successfully');
        } catch (error) {
            console.error('Error loading sounds:', error);
        }
    }

    // Воспроизведение звука
    async playSound(soundName: string) {
        if (this.isMuted) return;

        const sound = this.sounds.get(soundName);
        if (sound) {
            try {
                await sound.replayAsync();
            } catch (error) {
                console.error(`Error playing sound ${soundName}:`, error);
            }
        }
    }

    // Фоновая музыка
    async playBackgroundMusic(musicType: 'menu' | 'game') {
        if (this.isMusicMuted) {
            console.log('Music is muted, not playing background music');
            return;
        }

        // Если уже играет нужная музыка, ничего не делаем
        if (this.currentMusicType === musicType && this.backgroundMusic) {
            console.log(`Music ${musicType} is already playing`);
            return;
        }

        try {
            // Останавливаем предыдущую музыку
            await this.stopBackgroundMusic();

            const musicSource = musicType === 'menu'
                ? require('../assets/sounds/menu_background_music.mp3')
                : require('../assets/sounds/game_background_music.mp3');

            const { sound } = await Audio.Sound.createAsync(
                musicSource,
                {
                    shouldPlay: true,
                    isLooping: true,
                    volume: 0.7 // Немного уменьшаем громкость для комфорта
                }
            );

            this.backgroundMusic = sound;
            this.currentMusicType = musicType;
            console.log(`Playing ${musicType} background music`);
        } catch (error) {
            console.error('Error playing background music:', error);
            this.backgroundMusic = null;
            this.currentMusicType = null;
        }
    }

    async stopBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                // Сначала останавливаем воспроизведение
                await this.backgroundMusic.stopAsync();

                // Затем выгружаем
                await this.backgroundMusic.unloadAsync();

                console.log('Background music stopped successfully');
            } catch (error) {
                console.error('Error stopping background music:', error);
            } finally {
                // Всегда сбрасываем ссылки
                this.backgroundMusic = null;
                this.currentMusicType = null;
            }
        }
    }

    // Вибрация с учетом платформы
    async vibrate(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning') {
        if (!this.isVibrationEnabled) {
            return;
        }

        try {
            const isIOS = Platform.OS === 'ios';

            if (isIOS) {
                // iOS использует Haptics API
                switch (type) {
                    case 'light':
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        break;
                    case 'medium':
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        break;
                    case 'heavy':
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        break;
                    case 'success':
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        break;
                    case 'warning':
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        break;
                }
            } else {
                // Android использует Vibration API
                switch (type) {
                    case 'light':
                        Vibration.vibrate(50);
                        break;
                    case 'medium':
                        Vibration.vibrate([0, 50, 50, 50]);
                        break;
                    case 'heavy':
                        Vibration.vibrate([0, 100, 50, 100, 50, 100]);
                        break;
                    case 'success':
                        Vibration.vibrate([0, 50, 50, 100]);
                        break;
                    case 'warning':
                        Vibration.vibrate([0, 100, 50, 50]);
                        break;
                }
            }
        } catch (e) {
            console.error('Vibration error:', e);
            // Fallback to basic vibration
            try {
                Vibration.vibrate(100);
            } catch (error) {
                console.error('Basic vibration failed:', error);
            }
        }
    }

    // Установка состояния вибрации
    setVibrationEnabled(enabled: boolean) {
        this.isVibrationEnabled = enabled;
        // Тестовая вибрация при включении
        if (enabled) {
            this.vibrate('medium');
        }
    }

    // Настройки
    setMuted(muted: boolean) {
        this.isMuted = muted;
    }

    setMusicMuted(muted: boolean) {
        console.log(`Setting music muted to: ${muted}`);
        this.isMusicMuted = muted;
        if (muted) {
            console.log('Music muted, stopping background music');
            this.stopBackgroundMusic();
        } else if (this.currentMusicType) {
            // Если звук был включен и у нас есть текущий тип музыки, перезапускаем
            console.log(`Music unmuted, restarting ${this.currentMusicType} music`);
            this.playBackgroundMusic(this.currentMusicType);
        }
    }

    // Получить текущий тип музыки
    getCurrentMusicType(): 'menu' | 'game' | null {
        return this.currentMusicType;
    }

    // Очистка
    async unloadSounds() {
        try {
            for (const sound of this.sounds.values()) {
                await sound.unloadAsync();
            }
            this.sounds.clear();

            await this.stopBackgroundMusic();
        } catch (error) {
            console.error('Error unloading sounds:', error);
        }
    }
}

export default new AudioService();