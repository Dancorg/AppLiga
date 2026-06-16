import { useEffect, useState } from "react";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import type { League, LeaderboardEntry, LeagueRules } from "../../types/index";
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

    const handleDelete = async (leagueId: number) => {
        await api.deleteLeague(leagueId);
        setLeagues(prev => prev.filter(l => l.league_id !== leagueId));
    };

    return { leagues, loading, handleDelete };
}

export function useLeagueCreation(){
    const [leagueId, setLeagueId] = useState<number | null>(null);
    const [dates, setDates] = useState<DateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError, clearError] = useTimedMessage();

    const handleCreateLeague = async (name: string) => {
        try {
            setLoading(true);
            clearError();

            const res = await api.createLeague(name, { hit_head: 3, hit_torso: 2, hit_arm: 1, hit_legs: 1, scoring_mode: 'total', allow_ties: true });

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
            clearError();

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
    const [rules, setRules] = useState<LeagueRules | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError, clearError] = useTimedMessage();

    useEffect(() => {
        api.getLeagueById(leagueId).then(l => {
            setLeagueName(l.name);
            setRules({ hit_head: l.hit_head, hit_torso: l.hit_torso, hit_arm: l.hit_arm, hit_legs: l.hit_legs, scoring_mode: l.scoring_mode, allow_ties: l.allow_ties });
        }).catch(() => {});
        api.getLeaderboard(leagueId).then(data => setLeaderboard(data as LeaderboardEntry[])).catch(() => {});
    }, [leagueId]);

    const handleJoin = async () => {
        try {
            setLoading(true);
            clearError();
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

    return { leagueName, rules, leaderboard, handleJoin, loading, error };
}
