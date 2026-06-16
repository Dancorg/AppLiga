import { apiFetch } from "../../api/client";
import type { League, LeagueRules } from "../../types";

export type { League, LeagueRules };

export const getLeagues = () => apiFetch<League[]>("/leagues/");

export const getLeagueById = (leagueId: number) => apiFetch<League>(`/leagues/${leagueId}`);

export const createLeague = (name: string, rules: LeagueRules) =>
    apiFetch<League>("/leagues/create", {
        method: "POST",
        body: JSON.stringify({ name, ...rules }),
    });

export const joinLeague = (leagueId: number) =>
    apiFetch(`/leagues/${leagueId}/join`, {
        method: "POST",
    })

export const getLeaderboard = (leagueId: number) =>
    apiFetch(`/leagues/${leagueId}/leaderboard`);

export const enrollUserByUsername = (leagueId: number, username: string) =>
    apiFetch(`/leagues/${leagueId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ username }),
    });

export const deleteLeague = (leagueId: number) =>
    apiFetch(`/leagues/${leagueId}`, { method: 'DELETE' });