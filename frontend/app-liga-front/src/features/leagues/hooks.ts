import { useEffect, useState } from "react";
import type { League } from "../../types/index";
import type { DateItem } from "../dates/api";
import * as api from "./api.ts";
import { createDate } from "../dates/api";

export function useLeagues() {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getLeagues()
            .then((data) => setLeagues(data))
            .finally(() => setLoading(false));
    }, []);

    return { leagues, loading};
}

export function useLeagueCreation(){
    const [leagueId, setLeagueId] = useState<number | null>(null);
    const [dates, setDates] = useState<DateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateLeague = async (name: string) => {
        try {
            setLoading(true);
            setError(null);

            const res = await api.createLeague(name);

            setLeagueId(res.league_id);
            setDates([]);

            return true;
        } catch (err: unknown){
            setError((err as { message: string }).message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDate = async (date_date: string) => {
        if (!leagueId) return;

        const nextDateNumber = dates.length + 1;

        try {
            setLoading(true);
            setError(null);

            const newDate = await createDate(leagueId, {
                date_number: nextDateNumber, 
                date_date
            });

            setDates((prev) => [
                ...prev,
                newDate,
            ]);

            return true;
        } catch (err: unknown){
            setError((err as { message: string }).message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        leagueId,
        dates,
        handleCreateDate,
        handleCreateLeague,
        loading,
        error,
    };
}

export function useLeagueDetail(leagueId: number) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async() => {
        try{
            setLoading(true);
            setError(null);

            await api.joinLeague(leagueId);

            return true;
        } catch (err: unknown){
            setError((err as { message: string }).message);
            return false;
        } finally {
            setLoading(false);
        }
    };
    return {
        handleJoin,
        loading,
        error,
    };
}
