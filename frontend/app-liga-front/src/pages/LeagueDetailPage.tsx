import { useParams } from "react-router-dom";
import DatesManager from "../features/dates/components/DatesManager"
import { useLeagueDetail } from "../features/leagues/hooks";

export default function LeagueDetailPage() {
    const { leagueId } = useParams();
    const id = Number(leagueId);

    const { handleJoin, loading, error } = useLeagueDetail(id);

    return(
        <div style={{ padding: "20px" }}>
            <h1>League {id}</h1>

            <button onClick={handleJoin} disabled={loading}>
                Join League
            </button>

            <DatesManager leagueId={id} />

            {error && <p style={{color: "red"}}>{error}</p>}
        </div>
    )
}