import MatchList from "../../matches/components/MatchList";
import { useParticipants } from "../hooks";
import type { DateItem } from "../api";

export default function DateCard({ date }: { date: DateItem }) {
    const { participants, loading, error } = useParticipants(date.date_id);

    return (
        <div style={styles.card}>
            <h4>Date {date.date_number}</h4>
            <p>{date.date_date}</p>

            <div>
                <strong>Participants</strong>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                {!loading && !error && participants.length === 0 && <p>No participants yet.</p>}
                <ul style={styles.list}>
                    {participants.map((p) => (
                        <li key={p.user_id}>Player {p.user_id}</li>
                    ))}
                </ul>
            </div>

            <MatchList dateId={date.date_id} />
        </div>
    );
}

const styles = {
  card: {
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  list: {
    margin: "4px 0",
    paddingLeft: "20px",
  },
};