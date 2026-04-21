import { useEffect, useState } from "react";
import * as api from "./api";

export function useParticipants(dateId: number) {
    const [participants, setParticipants] = useState<api.Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!dateId) return;
        setLoading(true);
        api.getParticipantsByDate(dateId)
            .then(setParticipants)
            .catch((err: { message: string }) => setError(err.message ?? "Unexpected error"))
            .finally(() => setLoading(false));
    }, [dateId]);

    return { participants, loading, error };
}

export function useDates(leagueId: number, autoFetch = true) {
    const [dates, setDates] = useState<api.DateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDates = async () => {
        try {
            setLoading(true);
            const res = await api.getDatesByLeague(leagueId);
            setDates(res);
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    const createNewDate = async (date_date: string) => {
        const nextNumber = Math.max(0, ...dates.map((d) => d.date_number)) +1;

        try {
            setLoading(true);
            setError(null);

            const newDate = await api.createDate(leagueId, {
                date_number: nextNumber,
                date_date,
            });

            setDates((prev) => [...prev, newDate]);

            return true;
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Unexpected error");
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch && leagueId){
            fetchDates();
        }
    }, [leagueId]);

    return {
        dates,
        loading,
        error, 
        createNewDate,
        fetchDates,
    };
}