import { useState } from 'react';
import { enrollUserByUsername } from '../api';

export default function EnrollUser({ leagueId }: { leagueId: number }) {
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
            await enrollUserByUsername(leagueId, username.trim());
            setMessage(`${username} enrolled successfully`);
            setUsername('');
        } catch (err: unknown) {
            setError((err as { message: string }).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '16px' }}>
            <h3>Enroll a player</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnroll()}
                />
                <button onClick={handleEnroll} disabled={loading || !username.trim()}>
                    Enroll
                </button>
            </div>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
