import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimedMessage } from '../../../hooks/useTimedMessage';

export default function EnrollUserToDate({ onEnroll }: { onEnroll: (username: string) => Promise<void> }) {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useTimedMessage();
    const [error, setError] = useTimedMessage();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleEnroll = async () => {
        if (!username.trim()) return;
        setLoading(true);
        // timed messages clear themselves; no manual reset needed
        try {
            await onEnroll(username.trim());
            setMessage(`${username} ${t('enroll.success')}`);
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
                    placeholder={t('dates.enrollPlaceholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnroll()}
                />
                <button onClick={handleEnroll} disabled={loading || !username.trim()}>
                    {t('dates.enrollButton')}
                </button>
            </div>
            {message && <p style={{ color: 'green', margin: '4px 0' }}>{message}</p>}
            {error && <p style={{ color: 'red', margin: '4px 0' }}>{error}</p>}
        </div>
    );
}
