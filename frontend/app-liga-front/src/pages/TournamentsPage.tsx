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
    const { tournaments, loading } = useTournaments();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    if (loading) return <p>{t('common.loading')}</p>;

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
                <button
                    key={tourney.tourney_id}
                    onClick={() => navigate(`/tournaments/${tourney.tourney_id}`)}
                    style={styles.card}
                >
                    <h3 style={{ margin: 0 }}>{tourney.name}</h3>
                    <span style={{ ...styles.badge, color: statusColors[tourney.status] }}>
                        {t(`tournament.status.${tourney.status}`)}
                    </span>
                </button>
            ))}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    createBtn: { marginBottom: '16px', padding: '8px 20px', cursor: 'pointer' },
    card: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        border: '1px solid #e5e7eb',
        padding: '12px 16px',
        marginBottom: '10px',
        background: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        textAlign: 'left',
    },
    badge: { fontSize: '12px', fontWeight: 600 },
};
