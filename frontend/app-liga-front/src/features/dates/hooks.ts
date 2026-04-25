import { useEffect, useState } from "react";
import * as api from "./api";

export function useParticipants(dateId: number) {
    const [participants, setParticipants] = useState<api.Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const res = await api.getParticipantsByDate(dateId);
            setParticipants(res);
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    const joinDate = async () => {
        try {
            setError(null);
            await api.joinDate(dateId);
            await fetchParticipants();
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Error joining date");
        }
    };

    useEffect(() => {
        if (!dateId) return;
        fetchParticipants();
    }, [dateId]);

    const enrollUser = async (username: string) => {
        try {
            setError(null);
            await api.enrollUserToDate(dateId, username);
            await fetchParticipants();
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? 'Error enrolling user');
        }
    };

    return { participants, loading, error, joinDate, enrollUser };
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
        try {
            setLoading(true);
            setError(null);

            const newDate = await api.createDate(leagueId, { date_date });

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