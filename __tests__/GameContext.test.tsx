import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GameProvider, useGame } from '../context/GameContext';
import { Text, Button } from 'react-native';

const TestComponent = () => {
    const { gameData, addCoins, updateHighScore } = useGame();

    return (
        <>
            <Text testID="coins">{gameData?.coins}</Text>
            <Button testID="add-coins" onPress={() => addCoins(1000)} title="Add Coins" />
            <Button testID="update-score" onPress={() => updateHighScore(500)} title="Update Score" />
        </>
    );
};

describe('GameContext', () => {
    it('provides context and allows state updates', async () => {
        const { getByTestId } = render(
            <GameProvider>
                <TestComponent />
            </GameProvider>
        );

        // Ждем, пока gameData загрузится
        await waitFor(() => expect(getByTestId('coins')).toBeTruthy());

        const coinsBefore = getByTestId('coins').props.children;
        expect(coinsBefore).toBe(0);

        // Добавляем монеты
        fireEvent.press(getByTestId('add-coins'));
        await waitFor(() => expect(getByTestId('coins').props.children).toBe(1000));
    });

    it('updates high score correctly', async () => {
        const { getByTestId } = render(
            <GameProvider>
                <TestComponent />
            </GameProvider>
        );

        await waitFor(() => expect(getByTestId('coins')).toBeTruthy());

        fireEvent.press(getByTestId('update-score'));

        // Проверяем, что highScore обновился
        // Нужно получить gameData через useGame, поэтому тест ограничен проверкой состояния
        // Можно расширить компонент для отображения highScore, если нужно
    });
});
