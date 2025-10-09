import { useCallback, useEffect, useRef } from 'react';

interface GameLoopProps {
    onUpdate: (deltaTime: number) => void;
    isRunning: boolean;
}

const useGameLoop = ({ onUpdate, isRunning }: GameLoopProps) => {
    const lastTimeRef = useRef(0);
    const animationFrameId = useRef<number | null>(null);

    const gameLoop = useCallback((currentTime: number) => {
        if (!isRunning) {
            animationFrameId.current = null;
            return;
        }

        const deltaTime = currentTime - lastTimeRef.current;
        if (lastTimeRef.current !== 0) {
            onUpdate(deltaTime);
        }
        lastTimeRef.current = currentTime;
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [isRunning, onUpdate]);

    useEffect(() => {
        if (isRunning && animationFrameId.current === null) {
            lastTimeRef.current = 0; // Сброс времени при старте или возобновлении
            animationFrameId.current = requestAnimationFrame(gameLoop);
        } else if (!isRunning && animationFrameId.current !== null) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
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
        lastTimeRef.current = 0;
        if (isRunning) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
    }, [isRunning, gameLoop]);

    return { resetLoop };
};

export default useGameLoop;
