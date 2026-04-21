import { useState } from "react";

export default function DateForm({
    onCreate,
    loading,
}:{
    onCreate: (date: string) => Promise<boolean>;
    loading: boolean;
}) {
    const [date, setDate] = useState("");
    
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
            Add Date
        </button>
        </form>
    );
}