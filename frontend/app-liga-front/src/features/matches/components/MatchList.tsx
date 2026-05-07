import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMatches } from "../hooks";
import { useAuth } from "../../../auth/AuthContext";
import { useTranslation } from "react-i18next";
import type { LeagueRules } from "../../../types";

export default function MatchList({ dateId, rules }: { dateId: number; rules: LeagueRules | null }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { matches, loading, error, fetchMatches, handleGenerateMatches, handleDeleteMatch } = useMatches(dateId);

    useEffect(() => {
        fetchMatches();
    }, [dateId]);

    return (
        <div style={{ marginTop: "10px" }}>
            {user?.role === 'admin' && (
                <button onClick={handleGenerateMatches}>{t('matches.generate')}</button>
            )}

            {loading && <p>{t('matches.loading')}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {matches.length === 0 && <p>{t('matches.noMatches')}</p>}

            <ul>
                {matches.map((m) => (
                    <li key={m.id} onClick={() => navigate(`/matches/${m.id}`, { state: { match: m, rules } })} style={{ cursor: "pointer" }}>
                        {m.player1Name} {t('matches.vs')} {m.player2Name}
                        {m.score1 != null && m.score2 != null && (
                            <span style={{ marginLeft: "8px", fontWeight: "bold" }}>
                                {m.score1} – {m.score2}
                            </span>
                        )}
                        {user?.role === 'admin' && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteMatch(m.id); }}>
                                {t('matches.delete')}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
