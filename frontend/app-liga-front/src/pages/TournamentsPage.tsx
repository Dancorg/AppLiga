import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useTournaments } from "../features/tournaments/hooks";

const statusColors: Record<string, string> = {
    open: '#16a34a',
    locked: '#2563eb',
    finished: '#6b7280',
};

export default function TournamentsPage() {
    const { tournaments, loading, handleDelete } = useTournaments();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    if (loading) return <p>{t('common.loading')}</p>;

    const confirmDelete = (e: React.MouseEvent, tourneyId: number, name: string) => {
        e.stopPropagation();
        if (window.confirm(`${t('common.deleteConfirm')} "${name}"?`)) handleDelete(tourneyId);
    };

    return (
        <div>
            <h1>{t('tournament.title')}</h1>

            {user?.role === 'admin' && (
                <button onClick={() => navigate('/create-tournament')} style={styles.createBtn}>
                    {t('tournament.create')}
                </button>
            )}

            {tournaments.length === 0 && <p>{t('tournament.noTournaments')}</p>}

            {tournaments.map(tourney => (
                <div key={tourney.tourney_id} style={styles.row}>
                    <button
                        onClick={() => navigate(`/tournaments/${tourney.tourney_id}`)}
                        style={styles.card}
                    >
                        <h3 style={{ margin: 0 }}>{tourney.name}</h3>
                        <span style={{ ...styles.badge, color: statusColors[tourney.status] }}>
                            {t(`tournament.status.${tourney.status}`)}
                        </span>
                    </button>
                    {user?.role === 'admin' && (
                        <button onClick={(e) => confirmDelete(e, tourney.tourney_id, tourney.name)} style={styles.deleteBtn}>
                            {t('common.delete')}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    createBtn: { marginBottom: '16px', padding: '8px 20px', cursor: 'pointer' },
    row: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
    card: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        border: '1px solid #e5e7eb',
        padding: '12px 16px',
        background: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        textAlign: 'left',
    },
    badge: { fontSize: '12px', fontWeight: 600 },
    deleteBtn: { padding: '6px 14px', cursor: 'pointer', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c', whiteSpace: 'nowrap' },
};
