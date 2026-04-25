import MatchList from "../../matches/components/MatchList";

export default function DateCard({
    date,
}: {
    date: { id?: number; date_date: string };
}) {
    return (
        <div style={styles.card}>
            <h4>{date.date_date}</h4>

            {date.id && <MatchList dateId={date.id} />}
        </div>
    );
}

const styles = {
  card: {
    border: "1px solid #ccc",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "6px",
  },
};