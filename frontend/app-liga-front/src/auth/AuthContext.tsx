import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
    token: string | null;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
};

type User = {
    userId: number;
    username: string;
    role: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

function decodeToken(token: string): User | null {
    try {
        return jwtDecode<User>(token);
    } catch {
        return null;
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => {
        const stored = localStorage.getItem("token");

        if(stored && decodeToken(stored) === null) {
            localStorage.removeItem("token");
            return null;
        }
        return stored;
    });

    const [user, setUser] = useState<User | null>(
        token ? jwtDecode(token) : null
    );

    const login = (token: string) => {
        const decoded = decodeToken(token);
        if (!decoded){
            console.error("Invalid token received in login");
            return;
        }
        localStorage.setItem("token", token);
        setToken(token);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return(
        <AuthContext.Provider value={{ token, user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}