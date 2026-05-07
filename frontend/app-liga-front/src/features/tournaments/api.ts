import { apiFetch } from "../../api/client";
import type { Tournament, TournamentDetail } from "../../types";

export const getTournaments = () =>
    apiFetch<Tournament[]>('/tournaments');

export const getTournamentDetail = (tourneyId: number) =>
    apiFetch<TournamentDetail>(`/tournaments/${tourneyId}`);

export const createTournament = (name: string, config: Omit<Tournament, 'tourney_id' | 'name' | 'status'>) =>
    apiFetch<Tournament>('/tournaments/create', {
        method: 'POST',
        body: JSON.stringify({ name, ...config }),
    });

export const deleteTournament = (tourneyId: number) =>
    apiFetch(`/tournaments/${tourneyId}`, { method: 'DELETE' });

export const joinTournament = (tourneyId: number) =>
    apiFetch(`/tournaments/${tourneyId}/join`, { method: 'POST' });

export const enrollUserByUsername = (tourneyId: number, username: string) =>
    apiFetch(`/tournaments/${tourneyId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ username }),
    });

export const startTournament = (tourneyId: number) =>
    apiFetch(`/tournaments/${tourneyId}/start`, { method: 'POST' });

export const advanceToElimination = (tourneyId: number) =>
    apiFetch(`/tournaments/${tourneyId}/advance`, { method: 'POST' });
