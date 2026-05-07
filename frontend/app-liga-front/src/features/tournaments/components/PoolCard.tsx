import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TournamentPool, LeagueRules } from "../../../types";

export default function PoolCard({ pool, rules }: { pool: TournamentPool; rules: LeagueRules }) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div style={styles.card}>
            <h4 style={styles.title}>{t('tournament.pool')} {pool.pool_number}</h4>

            {/* Standings */}
            {pool.leaderboard.length > 0 && (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {(['position', 'player', 'wins', 'losses', 'points'] as const).map(k => (
                                <th key={k} style={styles.th}>{t(`leagueDetail.columns.${k}`)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pool.leaderboard.map(entry => (
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
            )}

            {/* Matches */}
            <ul style={styles.matchList}>
                {pool.matches.map(m => (
                    <li
                        key={m.id}
                        style={styles.matchItem}
                        onClick={() => navigate(`/matches/${m.id}`, { state: { match: m, rules } })}
                    >
                        <span>{m.player1Name} {t('matches.vs')} {m.player2Name}</span>
                        {m.score1 != null && m.score2 != null && (
                            <span style={styles.score}>{m.score1} – {m.score2}</span>
                        )}
                    </li>
                ))}
                {pool.matches.length === 0 && <li style={{ color: '#9ca3af', fontSize: '13px' }}>{t('matches.noMatches')}</li>}
            </ul>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', background: '#f9fafb' },
    title: { margin: '0 0 10px', fontSize: '15px', fontWeight: 700 },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: '10px' },
    th: { textAlign: 'left', padding: '4px 8px', fontSize: '11px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', fontWeight: 600 },
    td: { padding: '6px 8px', fontSize: '13px', borderBottom: '1px solid #f3f4f6' },
    matchList: { listStyle: 'none', padding: 0, margin: 0 },
    matchItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f3f4f6' },
    score: { fontWeight: 700, color: '#1d4ed8' },
};
