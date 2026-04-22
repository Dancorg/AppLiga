import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMatches } from "../hooks";

export default function MatchList({ dateId }: { dateId: number}) {
    const navigate = useNavigate();
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
            <button onClick={handleGenerateMatches}>
                Generate Matches
            </button>

            {loading && <p>Loading matches..</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {matches.length === 0 && <p>No matches yet</p>}

            <ul>
                {matches.map((m) => (
                    <li key={m.id} onClick={() => navigate(`/matches/${m.id}`, { state: { match: m } })} style={{ cursor: "pointer" }}>
                        {m.player1Name} vs {m.player2Name}
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteMatch(m.id); }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}