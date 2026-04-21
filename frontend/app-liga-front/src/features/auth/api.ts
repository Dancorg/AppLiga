import { apiFetch } from "../../api/client";

export interface LoginResponse {
    token: string;
}

export const loginRequest = (data: {
    email: string;
    password: string;
}) => 
    apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    });

export interface RegisterResponse {
    token: string;
}

export const registerRequest = (data: {
    email: string;
    username: string;
    password: string;
    role: string;
}) => 
    apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });