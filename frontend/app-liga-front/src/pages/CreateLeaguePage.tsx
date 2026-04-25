import { useState } from "react";
import { createLeague } from "../features/leagues/api";
import DatesManager from "../features/dates/components/DatesManager";
import { useNavigate } from "react-router-dom";


export default function CreateLeaguePage() {
    const [leagueName, setLeagueName] = useState("");
    const [leagueId, setLeagueId] = useState<number | null>(null);
    const navigate = useNavigate();

    const handleCreate: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        const res = await createLeague(leagueName);
        setLeagueId(res.league_id);

        if(res) navigate(`/leagues/${res.league_id}`);
    };

    return (
        <div style={{ padding: "20px"}}>
            <h1>Create League</h1>

            {!leagueId && (
                <form onSubmit={handleCreate}>
                    <input
                        value={leagueName}
                        onChange={(e) => setLeagueName(e.target.value)}
                        placeholder="League name"
                        required
                    />
                    <button type="submit">Create</button>
                </form>
            )}

            {leagueId && <DatesManager leagueId={leagueId} />}
        </div>
    );
}
