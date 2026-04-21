const API_BASE = import.meta.env.VITE_API_BASE;

if (!API_BASE) {
    throw new Error("VITE_API_BASE is not defined, check .env file");
}

export interface ApiError{
    message: string;
}

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("token");
    console.log(`${API_BASE}${endpoint}`);

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}`}),
            ...options.headers
        }
    });

    const data = await res.json().catch(() => ({}));
    
    if (!res.ok){
        throw data as ApiError;
    }

    return data;
}

