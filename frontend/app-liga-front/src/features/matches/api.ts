import { apiFetch } from "../../api/client";
import type { Match } from "../../types";

export type { Match };

export const generateMatches = (dateId: number) =>
    apiFetch(`/leagues/dates/${dateId}/matches`, {
        method: "POST",
    });

export const getMatchesByDate = (dateId: number) =>
    apiFetch<Match[]>(`/dates/${dateId}/matches`);

export const deleteMatch = (matchId: number) =>
    apiFetch(`/leagues/matches/${matchId}`, {
        method: "DELETE",
    });

export const submitScore = (matchId: number, player1_score: number, player2_score: number) =>
    apiFetch(`/matches/${matchId}/score`, {
        method: "POST",
        body: JSON.stringify({ player1_score, player2_score }),
    });