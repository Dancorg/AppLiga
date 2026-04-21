import { useEffect } from "react";
import { useMatches } from "../hooks";

export default function MatchList({ dateId }: { dateId: number}) {
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
                    <li key={m.id}>
                        Player {m.player1Id} vs Player {m.player2Id}
                        <button onClick={() => handleDeleteMatch(m.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}