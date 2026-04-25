import { useEffect, useState } from "react";
import type { League, LeaderboardEntry } from "../../types/index";
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

        try {
            setLoading(true);
            setError(null);

            const newDate = await createDate(leagueId, { date_date });

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
    const [leagueName, setLeagueName] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.getLeagueById(leagueId).then(l => setLeagueName(l.name)).catch(() => {});
        api.getLeaderboard(leagueId).then(data => setLeaderboard(data as LeaderboardEntry[])).catch(() => {});
    }, [leagueId]);

    const handleJoin = async () => {
        try {
            setLoading(true);
            setError(null);
            await api.joinLeague(leagueId);
            await api.getLeaderboard(leagueId).then(data => setLeaderboard(data as LeaderboardEntry[]));
            return true;
        } catch (err: unknown) {
            setError((err as { message: string }).message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { leagueName, leaderboard, handleJoin, loading, error };
}
