// hooks/useGameLoop.tsx
import { useCallback, useEffect, useRef } from 'react';

interface GameLoopProps {
    onUpdate: (deltaTime: number) => void;
    isRunning: boolean;
}

const useGameLoop = ({ onUpdate, isRunning }: GameLoopProps) => {
    const animationFrameId = useRef<number | null>(null);
    const lastTime = useRef<number | null>(null);
    const isRunningRef = useRef(isRunning);

    // Всегда синхронизируем ref с текущим состоянием
    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    const gameLoop = useCallback((timestamp: number) => {
        if (!isRunningRef.current) {
            animationFrameId.current = null;
            lastTime.current = null;
            return;
        }

        if (lastTime.current === null) {
            lastTime.current = timestamp;
        }

        const deltaTime = timestamp - lastTime.current;
        lastTime.current = timestamp;

        // Вызываем обновление игры
        onUpdate(deltaTime);

        // Запрашиваем следующий кадр только если игра еще запущена
        if (isRunningRef.current) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
    }, [onUpdate]);

    useEffect(() => {
        if (isRunning) {
            if (animationFrameId.current === null) {
                lastTime.current = null;
                animationFrameId.current = requestAnimationFrame(gameLoop);
            }
        } else {
            if (animationFrameId.current !== null) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
                lastTime.current = null;
            }
        }

        return () => {
            if (animationFrameId.current !== null) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isRunning, gameLoop]);

    const resetLoop = useCallback(() => {
        if (animationFrameId.current !== null) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        lastTime.current = null;
        if (isRunning) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
    }, [isRunning, gameLoop]);

    return { resetLoop };
};

export default useGameLoop;