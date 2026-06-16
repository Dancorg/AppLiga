import { useLeagues } from "../features/leagues/hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

export default function LeaguesPage() {
    const { leagues, loading, handleDelete } = useLeagues();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    if (loading) return <p>{t('common.loading')}</p>;

    const confirmDelete = (e: React.MouseEvent, leagueId: number, name: string) => {
        e.stopPropagation();
        if (window.confirm(`${t('common.deleteConfirm')} "${name}"?`)) handleDelete(leagueId);
    };

    return (
        <div>
            <h1>{t('leagues.title')}</h1>

            {user?.role === 'admin' && (
                <button onClick={() => navigate('/create-league')} style={{ marginBottom: '16px', padding: '8px 20px', cursor: 'pointer' }}>
                    {t('nav.createLeague')}
                </button>
            )}

            {leagues.length === 0 && <p>{t('leagues.noLeagues')}</p>}
            {leagues.map((league) => (
                <div key={league.league_id} style={styles.row}>
                    <button
                        onClick={() => navigate(`/leagues/${league.league_id}`)}
                        style={styles.card}
                    >
                        <h3 style={{ margin: 0 }}>{league.name}</h3>
                    </button>
                    {user?.role === 'admin' && (
                        <button onClick={(e) => confirmDelete(e, league.league_id, league.name)} style={styles.deleteBtn}>
                            {t('common.delete')}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    row: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
    card: { flex: 1, border: '1px solid #ccc', padding: '10px', background: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' },
    deleteBtn: { padding: '6px 14px', cursor: 'pointer', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c', whiteSpace: 'nowrap' },
};
