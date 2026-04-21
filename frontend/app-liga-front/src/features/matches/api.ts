import { apiFetch } from "../../api/client";

export interface Match {
    id: number;
    player1Id: number;
    player2Id: number;
    score1?: number;
    score2?: number;
}

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