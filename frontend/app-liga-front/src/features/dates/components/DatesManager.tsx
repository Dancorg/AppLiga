import { useDates } from "../hooks";
import DateForm from "./DateForm";
import DateCard from "./DateCard";
import { useAuth } from "../../../auth/AuthContext";

export default function DatesManager ({leagueId}: { leagueId: number}) {
    const { user } = useAuth();
    const { dates, loading, error, createNewDate } = useDates(leagueId);

    return(
        <div style={{ marginTop: "20px" }}>
            <h2>Dates</h2>

            {user?.role === "admin" && (
                <DateForm onCreate={createNewDate} loading={loading} />
            )}

            {dates.length === 0 && <p>No dates yet</p>}

            {dates.map((date) => (
                <DateCard key={date.date_id} date={date} />
            ))}

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}