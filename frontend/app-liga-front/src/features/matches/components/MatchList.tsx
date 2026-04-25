import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMatches } from "../hooks";
import { useAuth } from "../../../auth/AuthContext";

export default function MatchList({ dateId }: { dateId: number}) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const{
        matches,
        loading,
        error,
        fetchMatches,
        handleGenerateMatches,
        handleDeleteMatch,
    } = useMatches(dateId);

    useEffect(() => {
        fetchMatches();
    }, [dateId]);

    return (
        <div style={{ marginTop: "10px" }}>
            {user?.role === 'admin' && (
                <button onClick={handleGenerateMatches}>Generate Matches</button>
            )}

            {loading && <p>Loading matches..</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {matches.length === 0 && <p>No matches yet</p>}

            <ul>
                {matches.map((m) => (
                    <li key={m.id} onClick={() => navigate(`/matches/${m.id}`, { state: { match: m } })} style={{ cursor: "pointer" }}>
                        {m.player1Name} vs {m.player2Name}
                        {m.score1 != null && m.score2 != null && (
                            <span style={{ marginLeft: "8px", fontWeight: "bold" }}>
                                {m.score1} – {m.score2}
                            </span>
                        )}
                        {user?.role === 'admin' && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteMatch(m.id); }}>
                                Delete
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}