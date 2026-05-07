import { useState } from "react";
import { loginRequest, registerRequest } from "./api";
import { useAuth } from "../../auth/AuthContext";
import { useTimedMessage } from "../../hooks/useTimedMessage";

export function useLogin() {
    const { login } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError, clearError] = useTimedMessage();

    const handleLogin = async (email: string, password: string) => {
        try {
            setLoading(true);
            clearError();

            const res = await loginRequest({email, password});
            login(res.token);
            return true;
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Login failed");
        } finally {
            setLoading(false);
        }
    };
    return {
        handleLogin,
        loading,
        error,
    };
}

export function useRegister(){
    const { login } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError, clearError] = useTimedMessage();

    const handleRegister = async (email: string, username: string, password: string, role: string) => {
        try {
            setLoading(true);
            clearError();

            const res = await registerRequest({email, username, password, role});
            login(res.token); // auto login

            return true;
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Unexpected error");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return{
        handleRegister,
        loading,
        error,
    };
}