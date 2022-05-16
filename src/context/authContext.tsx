import React, { useContext, useState } from 'react';

const AuthContext = React.createContext<AuthContextValue>({} as AuthContextValue);

export interface AuthContextValue {
  login(): void;
  logout(): void;
  isLoggedIn: boolean;
}

export const useAuthContext = () => useContext(AuthContext);

// eslint-disable-next-line react/prop-types
export const AuthContextProvider: React.FC = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const contextValue: AuthContextValue = {
    login: () => {
      setIsLoggedIn(true);
    },
    logout: () => {
      setIsLoggedIn(false);
    },
    isLoggedIn,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
