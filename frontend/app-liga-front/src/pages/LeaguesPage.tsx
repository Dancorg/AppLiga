import { useLeagues } from "../features/leagues/hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

export default function LeaguesPage() {
    const { leagues, loading } = useLeagues();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    if (loading) return <p>{t('common.loading')}</p>;

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
                <button
                    key={league.league_id}
                    onClick={() => navigate(`/leagues/${league.league_id}`)}
                    style={{
                        display: "block",
                        width: "100%",
                        border: "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "10px",
                        background: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    <h3>{league.name}</h3>
                </button>
            ))}
        </div>
    );
}
