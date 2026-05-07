import { useState, useCallback, useRef } from 'react';

export function useTimedMessage(duration = 4000) {
    const [message, setMessage] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const set = useCallback((msg: string) => {
        if (timer.current) clearTimeout(timer.current);
        setMessage(msg);
        timer.current = setTimeout(() => setMessage(null), duration);
    }, [duration]);

    const clear = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        setMessage(null);
    }, []);

    return [message, set, clear] as const;
}
