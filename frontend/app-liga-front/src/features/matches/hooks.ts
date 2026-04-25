import { useState, useEffect } from "react";
import type { Match } from "../../types"
import * as api from "./api";
import { sortMatchesNoConsecutivePlayers } from "../../utils/sortMatches";

export function useMatches(dateId: number) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const res = await api.getMatchesByDate(dateId);
            console.log(dateId, 'Fetch Matches Response:', res);

            setMatches(sortMatchesNoConsecutivePlayers(res));
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Error fetching matches");
        }finally {
            setLoading(false);
        }
    };

    const handleGenerateMatches = async () => {
        try{
            setLoading(true);
            setError(null);
            await api.generateMatches(dateId);
            await fetchMatches();
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Error generating matches");
        } finally {
            setLoading(false);
        }        
    };

    const handleDeleteMatch = async (matchId: number) => {
        try {
            setLoading(true);
            setError(null);
            await api.deleteMatch(matchId);
            setMatches((prev) => prev.filter((m) => m.id !== matchId));
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Error deleting match");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const onFocus = () => fetchMatches();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [dateId]);

    return {
        matches,
        loading,
        error,
        fetchMatches,
        handleGenerateMatches,
        handleDeleteMatch,
    };
}