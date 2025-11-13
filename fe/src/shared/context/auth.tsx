import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useState,
} from 'react';

interface AuthContextType {
    accesssToken?: string;
    refreshToken?: string;
    setRefreshToken: Dispatch<SetStateAction<string | undefined>>;
    setAccessToken: Dispatch<SetStateAction<string | undefined>>;
}

const ThemeContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
    children,
}) => {
    const [accesssToken, setAccessToken] = useState<string | undefined>();
    const [refreshToken, setRefreshToken] = useState<string | undefined>();

    const value = {
        accesssToken,
        refreshToken,
        setRefreshToken,
        setAccessToken,
    };

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};

export const useTokens = (): AuthContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
