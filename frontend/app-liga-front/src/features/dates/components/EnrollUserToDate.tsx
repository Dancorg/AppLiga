import { useState } from 'react';

export default function EnrollUserToDate({ onEnroll }: { onEnroll: (username: string) => Promise<void> }) {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleEnroll = async () => {
        if (!username.trim()) return;
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            await onEnroll(username.trim());
            setMessage(`${username} added to date`);
            setUsername('');
        } catch (err: unknown) {
            setError((err as { message: string }).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnroll()}
                />
                <button onClick={handleEnroll} disabled={loading || !username.trim()}>
                    Add to date
                </button>
            </div>
            {message && <p style={{ color: 'green', margin: '4px 0' }}>{message}</p>}
            {error && <p style={{ color: 'red', margin: '4px 0' }}>{error}</p>}
        </div>
    );
}
