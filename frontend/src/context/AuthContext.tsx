import { createContext, useContext, useState } from "react";

type AuthContextType = {
  walletAddress: string | null;
  pin: string | null;
  login: (walletAddress: string, pin: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);

  function login(walletAddress: string, pin: string) {
    setWalletAddress(walletAddress);
    setPin(pin);
  }

  function logout() {
    setWalletAddress(null);
    setPin(null);
  }

  return (
    <AuthContext.Provider value={{ walletAddress, pin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}