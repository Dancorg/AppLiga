import { apiFetch } from "../../api/client";
import type { DateItem, Participant } from "../../types";

export type { DateItem, Participant };

export const createDate = (
    leagueId: number,
    data: { date_date: string }
) =>
    apiFetch<DateItem>(`/leagues/${leagueId}/dates`, {
        method: "POST",
        body: JSON.stringify(data),
    });

export const getDatesByLeague = (leagueId: number) =>
    apiFetch<DateItem[]>(`/leagues/${leagueId}/dates`);

export const getParticipantsByDate = (dateId: number) =>
    apiFetch<Participant[]>(`/dates/${dateId}/participants`);

export const joinDate = (dateId: number) =>
    apiFetch(`/dates/${dateId}/join`, { method: 'POST' });

export const enrollUserToDate = (dateId: number, username: string) =>
    apiFetch(`/dates/${dateId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ username }),
    });