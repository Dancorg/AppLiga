import { apiFetch } from "../../api/client";
import type { League } from "../../types";

export type { League };

export const getLeagues = () => apiFetch<League[]>("/leagues/");

export const createLeague = (name: string ) =>
    apiFetch<League>("/leagues/create", {
        method: "POST",
        body: JSON.stringify({name}),
    });

export const joinLeague = (leagueId: number) =>
    apiFetch(`/leagues/${leagueId}/join`, {
        method: "POST",
    })

export const getLeaderboard = (leagueId: number) =>
    apiFetch(`/leagues/${leagueId}/leaderboard`);