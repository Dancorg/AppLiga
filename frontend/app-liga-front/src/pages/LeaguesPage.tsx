import { useLeagues } from "../features/leagues/hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LeaguesPage() {
    const { leagues, loading } = useLeagues();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (loading) return <p>{t('common.loading')}</p>;

    if (leagues.length === 0) return (
        <div>
            <h1>{t('leagues.title')}</h1>
            <p>{t('leagues.noLeagues')}</p>
        </div>
    );

    return (
        <div>
            <h1>{t('leagues.title')}</h1>
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
