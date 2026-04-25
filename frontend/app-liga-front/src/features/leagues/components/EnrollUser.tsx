import { useState } from 'react';
import { enrollUserByUsername } from '../api';
import { useTranslation } from 'react-i18next';

export default function EnrollUser({ leagueId }: { leagueId: number }) {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleEnroll = async () => {
        if (!username.trim()) return;
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            await enrollUserByUsername(leagueId, username.trim());
            setMessage(`${username} ${t('enroll.success')}`);
            setUsername('');
        } catch (err: unknown) {
            setError((err as { message: string }).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '16px' }}>
            <h3>{t('enroll.title')}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder={t('enroll.placeholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnroll()}
                />
                <button onClick={handleEnroll} disabled={loading || !username.trim()}>
                    {t('enroll.button')}
                </button>
            </div>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
