import MatchList from "../../matches/components/MatchList";
import { useParticipants } from "../hooks";
import { useAuth } from "../../../auth/AuthContext";
import type { DateItem } from "../api";
import EnrollUserToDate from "./EnrollUserToDate";
import { useTranslation } from "react-i18next";

export default function DateCard({ date }: { date: DateItem }) {
    const { user } = useAuth();
    const { participants, loading, error, joinDate, enrollUser } = useParticipants(date.date_id);
    const isParticipant = participants.some(p => p.user_id === user?.userId);
    const { t } = useTranslation();

    return (
        <div style={styles.card}>
            <h4>{String(date.date_date).slice(0, 10)}</h4>

            <div>
                <strong>{t('dates.participants')}</strong>
                {loading && <p>{t('common.loading')}</p>}
                {error && <p>{error}</p>}
                {!isParticipant && (
                    <button onClick={joinDate} disabled={loading}>{t('dates.joinDate')}</button>
                )}
                {user?.role === 'admin' && <EnrollUserToDate onEnroll={enrollUser} />}
                {!loading && !error && participants.length === 0 && <p>{t('dates.noParticipants')}</p>}
                <ul style={styles.list}>
                    {participants.map((p) => (
                        <li key={p.user_id}>{p.name}</li>
                    ))}
                </ul>
            </div>

            <MatchList dateId={date.date_id} />
        </div>
    );
}

const styles = {
    card: { border: "1px solid #ccc", padding: "12px", borderRadius: "6px", marginBottom: "10px" },
    list: { margin: "4px 0", paddingLeft: "20px" },
};
