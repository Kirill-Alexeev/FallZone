import { useCallback, useEffect, useRef } from 'react';

/**
 * Интерфейс для пропсов игрового цикла
 */
interface GameLoopProps {
    /** Функция обновления, вызываемая каждый кадр с deltaTime */
    onUpdate: (deltaTime: number) => void;
    /** Флаг, указывающий, должен ли игровой цикл работать */
    isRunning: boolean;
}

/**
 * Хук для управления игровым циклом
 * Использует requestAnimationFrame для создания плавной анимации
 * Автоматически управляет ресурсами и очищает их при размонтировании
 * 
 * @param props - объект с функцией обновления и флагом состояния
 * @returns объект с методом resetLoop для сброса цикла
 */
const useGameLoop = ({ onUpdate, isRunning }: GameLoopProps) => {
    // Ref для хранения времени последнего кадра
    const lastTimeRef = useRef(0);
    // Ref для хранения ID текущего кадра анимации
    const animationFrameId = useRef<number | null>(null);

    /**
     * Основная функция игрового цикла
     * Вызывается requestAnimationFrame и обновляет игру
     * @param currentTime - текущее время в миллисекундах
     */
    const gameLoop = useCallback((currentTime: number) => {
        // Если игра остановлена, прекращаем цикл
        if (!isRunning) {
            animationFrameId.current = null;
            return;
        }

        // Вычисляем время, прошедшее с последнего кадра
        const deltaTime = currentTime - lastTimeRef.current;
        
        // Обновляем игру только если это не первый кадр
        if (lastTimeRef.current !== 0) {
            onUpdate(deltaTime);
        }
        
        // Сохраняем время текущего кадра
        lastTimeRef.current = currentTime;
        
        // Запрашиваем следующий кадр
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [isRunning, onUpdate]);

    /**
     * Effect для управления жизненным циклом игрового цикла
     * Запускает или останавливает анимацию в зависимости от isRunning
     * Автоматически очищает ресурсы при размонтировании
     */
    useEffect(() => {
        if (isRunning && animationFrameId.current === null) {
            // Запускаем игровой цикл
            lastTimeRef.current = 0; // Сброс времени при старте или возобновлении
            animationFrameId.current = requestAnimationFrame(gameLoop);
        } else if (!isRunning && animationFrameId.current !== null) {
            // Останавливаем игровой цикл
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }

        // Cleanup функция - отменяем анимацию при размонтировании
        return () => {
            if (animationFrameId.current !== null) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isRunning, gameLoop]);

    /**
     * Функция для сброса игрового цикла
     * Полезно для перезапуска игры или сброса состояния
     */
    const resetLoop = useCallback(() => {
        // Отменяем текущий кадр анимации
        if (animationFrameId.current !== null) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        
        // Сбрасываем время
        lastTimeRef.current = 0;
        
        // Если игра должна работать, запускаем цикл заново
        if (isRunning) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
    }, [isRunning, gameLoop]);

    return { resetLoop };
};

export default useGameLoop;
