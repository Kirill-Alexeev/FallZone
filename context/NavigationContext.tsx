// context/NavigationContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
    isTabBarVisible: boolean;
    hideTabBar: () => void;
    showTabBar: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTabBarVisible, setIsTabBarVisible] = useState(true);

    const hideTabBar = () => {
        setIsTabBarVisible(false);
    };

    const showTabBar = () => {
        setIsTabBarVisible(true);
    };

    const contextValue: NavigationContextType = {
        isTabBarVisible,
        hideTabBar,
        showTabBar
    };

    return (
        <NavigationContext.Provider value={contextValue}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) throw new Error('useNavigation must be used within NavigationProvider');
    return context;
};
