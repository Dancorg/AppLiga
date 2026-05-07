import { useParams, useNavigate } from "react-router-dom";
import DatesManager from "../features/dates/components/DatesManager";
import { useLeagueDetail } from "../features/leagues/hooks";
import { useAuth } from "../auth/AuthContext";
import EnrollUser from "../features/leagues/components/EnrollUser";
import { useTranslation } from "react-i18next";

export default function LeagueDetailPage() {
    const { leagueId } = useParams();
    const id = Number(leagueId);

    const { leagueName, rules, leaderboard, handleJoin, loading, error } = useLeagueDetail(id);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <div style={styles.page}>
            <button onClick={() => navigate('/leagues')} style={styles.back}>{t('leagueDetail.back')}</button>

            <h1 style={styles.title}>{leagueName ?? `League ${id}`}</h1>

            <button onClick={handleJoin} disabled={loading} style={styles.joinBtn}>
                {t('leagueDetail.joinLeague')}
            </button>

            {user?.role === 'admin' && <EnrollUser leagueId={id} />}

            {leaderboard.length > 0 && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>{t('leagueDetail.leaderboard')}</h2>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {(['position', 'player', 'wins', 'losses', 'points'] as const).map(k => (
                                    <th key={k} style={styles.th}>{t(`leagueDetail.columns.${k}`)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map(entry => (
                                <tr key={entry.user_id}>
                                    <td style={styles.td}>{entry.position}</td>
                                    <td style={{ ...styles.td, fontWeight: 600 }}>{entry.name}</td>
                                    <td style={styles.td}>{entry.wins}</td>
                                    <td style={styles.td}>{entry.losses}</td>
                                    <td style={{ ...styles.td, fontWeight: 700 }}>{entry.total_points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={styles.card}>
                <DatesManager leagueId={id} rules={rules} />
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: '640px' },
    back: { marginBottom: '16px', cursor: 'pointer' },
    title: { margin: '0 0 16px', fontSize: '28px', fontWeight: 700 },
    joinBtn: { padding: '8px 20px', cursor: 'pointer', marginBottom: '16px' },
    card: { border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', padding: '16px', marginTop: '20px' },
    sectionTitle: { margin: '0 0 12px', fontSize: '18px', fontWeight: 600 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '6px 10px', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', fontWeight: 600 },
    td: { padding: '8px 10px', fontSize: '14px', borderBottom: '1px solid #f3f4f6' },
};
