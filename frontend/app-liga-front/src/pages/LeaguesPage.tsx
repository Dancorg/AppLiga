import { useLeagues } from "../features/leagues/hooks";
import { useNavigate } from "react-router-dom";

export default function LeaguesPage() {
    const { leagues, loading } = useLeagues();
    const navigate = useNavigate();

    if (loading) return <p>Loading...</p>;

    if (leagues.length === 0) return (
        <div style={{ padding: "20px"}}>
            <h1>Leagues</h1>
            <p>No hay ligas disponibles aún</p>
        </div>
    )

    return (
        <div>
            <h1>Leagues</h1>
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
                    }}
                >
                    <h3>{league.name}</h3>
                </button>
            ))}
        </div>
    );
}