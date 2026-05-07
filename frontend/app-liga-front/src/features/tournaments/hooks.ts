import { useEffect, useState, useCallback } from "react";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import type { Tournament, TournamentDetail } from "../../types";
import * as api from "./api";

export function useTournaments() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getTournaments()
            .then(setTournaments)
            .finally(() => setLoading(false));
    }, []);

    return { tournaments, loading };
}

export function useTournamentDetail(tourneyId: number) {
    const [detail, setDetail] = useState<TournamentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useTimedMessage();

    const fetchDetail = useCallback(() => {
        setLoading(true);
        api.getTournamentDetail(tourneyId)
            .then(setDetail)
            .catch((err) => setError(err.message ?? 'Error loading tournament'))
            .finally(() => setLoading(false));
    }, [tourneyId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleJoin = async () => {
        try {
            await api.joinTournament(tourneyId);
            fetchDetail();
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    const handleEnroll = async (username: string) => {
        try {
            await api.enrollUserByUsername(tourneyId, username);
            fetchDetail();
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    const handleStart = async () => {
        try {
            await api.startTournament(tourneyId);
            fetchDetail();
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    const handleAdvance = async () => {
        try {
            await api.advanceToElimination(tourneyId);
            fetchDetail();
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    return { detail, loading, error, fetchDetail, handleJoin, handleEnroll, handleStart, handleAdvance };
}
