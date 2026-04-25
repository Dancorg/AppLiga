import { useDates } from "../hooks";
import DateForm from "./DateForm";
import DateCard from "./DateCard";
import { useAuth } from "../../../auth/AuthContext";
import { useTranslation } from "react-i18next";

export default function DatesManager({ leagueId }: { leagueId: number }) {
    const { user } = useAuth();
    const { dates, loading, error, createNewDate } = useDates(leagueId);
    const { t } = useTranslation();

    return (
        <div style={{ marginTop: "20px" }}>
            <h2>{t('dates.title')}</h2>

            {user?.role === "admin" && (
                <DateForm onCreate={createNewDate} loading={loading} />
            )}

            {dates.length === 0 && <p>{t('dates.noDates')}</p>}

            {dates.map((date) => (
                <DateCard key={date.date_id} date={date} />
            ))}

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
