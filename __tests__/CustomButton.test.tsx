import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import CustomButton from '../components/ui/CustomButton';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('CustomButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('displays custom text style', () => {
    const { getByText } = render(
      <CustomButton 
        title="Test Button" 
        onPress={() => {}} 
        textStyle={{ color: 'red' }} 
      />
    );
    
    const buttonText = getByText('Test Button');
    expect(buttonText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: 'red' })
      ])
    );
  });
});