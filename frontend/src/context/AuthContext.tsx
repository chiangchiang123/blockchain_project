import { createContext, useContext, useState } from "react";

type AuthContextType = {
  walletAddress: string | null;
  encryptionKey: string | null;
  login: (walletAddress: string, encryptionKey: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  function login(walletAddress: string, encryptionKey: string) {
    setWalletAddress(walletAddress);
    setEncryptionKey(encryptionKey);
  }

  function logout() {
    setWalletAddress(null);
    setEncryptionKey(null);
  }

  return (
    <AuthContext.Provider value={{ walletAddress, encryptionKey, login, logout }}>
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
