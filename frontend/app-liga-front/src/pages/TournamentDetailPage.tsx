import { useState, useEffect } from "react";
import { useTimedMessage } from "../hooks/useTimedMessage";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useTournamentDetail } from "../features/tournaments/hooks";
import PoolCard from "../features/tournaments/components/PoolCard";
import EliminationBracket from "../features/tournaments/components/EliminationBracket";
import type { LeagueRules } from "../types";

const statusColors: Record<string, string> = {
    open: '#16a34a',
    locked: '#2563eb',
    finished: '#6b7280',
};

export default function TournamentDetailPage() {
    const { tourneyId } = useParams();
    const id = Number(tourneyId);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { detail, loading, error, fetchDetail, handleJoin, handleEnroll, handleStart, handleAdvance } = useTournamentDetail(id);

    const [enrollUsername, setEnrollUsername] = useState('');
    const [enrollMsg, setEnrollMsg] = useTimedMessage();

    useEffect(() => {
        window.addEventListener('focus', fetchDetail);
        return () => window.removeEventListener('focus', fetchDetail);
    }, [fetchDetail]);

    if (loading) return <p>{t('common.loading')}</p>;
    if (!detail) return <p style={{ color: 'red' }}>{error}</p>;

    const rules: LeagueRules = {
        hit_head: detail.hit_head,
        hit_torso: detail.hit_torso,
        hit_arm: detail.hit_arm,
        hit_legs: detail.hit_legs,
        scoring_mode: detail.scoring_mode,
    };

    const allPoolsScored = detail.pools.length > 0 &&
        detail.pools.every(p => p.matches.length > 0 && p.matches.every(m => m.score1 != null && m.score2 != null));

    const handleEnrollSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await handleEnroll(enrollUsername);
        if (ok) { setEnrollMsg(`${enrollUsername} ${t('enroll.success')}`); setEnrollUsername(''); }
    };

    return (
        <div style={styles.page}>
            <button onClick={() => navigate('/tournaments')} style={styles.back}>{t('tournament.back')}</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <h1 style={styles.title}>{detail.name}</h1>
                <span style={{ ...styles.badge, color: statusColors[detail.status] }}>
                    {t(`tournament.status.${detail.status}`)}
                </span>
            </div>

            {/* Actions */}
            {detail.status === 'open' && (
                <div style={styles.actions}>
                    <button onClick={handleJoin} style={styles.btn}>{t('tournament.join')}</button>
                    {user?.role === 'admin' && (
                        <button onClick={handleStart} style={{ ...styles.btn, background: '#1d4ed8', color: 'white' }}>
                            {t('tournament.start')}
                        </button>
                    )}
                </div>
            )}

            {detail.status === 'locked' && user?.role === 'admin' && allPoolsScored && detail.elimRounds.every(r => r.slots.every(s => s.player1_id == null)) && (
                <button onClick={handleAdvance} style={{ ...styles.btn, background: '#7c3aed', color: 'white', marginBottom: '16px' }}>
                    {t('tournament.advance')}
                </button>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Admin enroll */}
            {detail.status === 'open' && user?.role === 'admin' && (
                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>{t('enroll.title')}</h3>
                    <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            value={enrollUsername}
                            onChange={e => setEnrollUsername(e.target.value)}
                            placeholder={t('enroll.placeholder')}
                            style={styles.input}
                        />
                        <button type="submit" style={styles.btn}>{t('enroll.button')}</button>
                    </form>
                    {enrollMsg && <p style={{ color: 'green', margin: '4px 0 0' }}>{enrollMsg}</p>}
                </div>
            )}

            {/* Enrolled players (open status) */}
            {detail.status === 'open' && detail.enrolled.length > 0 && (
                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>{t('tournament.enrolled')} ({detail.enrolled.length})</h3>
                    <ul style={styles.list}>
                        {detail.enrolled.map(p => <li key={p.user_id}>{p.name}</li>)}
                    </ul>
                </div>
            )}

            {/* Pool stage */}
            {detail.pools.length > 0 && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>{t('tournament.pools')}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {detail.pools.map(pool => (
                            <PoolCard key={pool.pool_id} pool={pool} rules={rules} />
                        ))}
                    </div>
                </div>
            )}

            {/* Elimination bracket */}
            {detail.elimRounds.length > 0 && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>{t('tournament.elimination')}</h2>
                    <EliminationBracket rounds={detail.elimRounds} rules={rules} />
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: '720px' },
    back: { marginBottom: '16px', cursor: 'pointer' },
    title: { margin: 0, fontSize: '28px', fontWeight: 700 },
    badge: { fontSize: '13px', fontWeight: 700 },
    actions: { display: 'flex', gap: '10px', marginBottom: '16px' },
    btn: { padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #d1d5db' },
    card: { border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', padding: '16px', marginTop: '20px' },
    sectionTitle: { margin: '0 0 12px', fontSize: '16px', fontWeight: 600 },
    input: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #d1d5db', flex: 1 },
    list: { margin: 0, paddingLeft: '20px', fontSize: '14px' },
};
