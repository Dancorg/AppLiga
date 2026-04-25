import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function DateForm({
    onCreate,
    loading,
}: {
    onCreate: (date: string) => Promise<boolean>;
    loading: boolean;
}) {
    const [date, setDate] = useState("");
    const { t } = useTranslation();

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const success = await onCreate(date);
        if (success) setDate("");
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {t('dates.addDate')}
            </button>
        </form>
    );
}
