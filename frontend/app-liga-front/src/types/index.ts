
export interface LeagueRules {
    hit_head: number;
    hit_torso: number;
    hit_arm: number;
    hit_legs: number;
    scoring_mode: 'total' | 'difference';
    allow_ties: boolean;
}

export interface League extends LeagueRules {
    league_id: number;
    name: string;
}

export interface Match {
    id: number;
    player1Id: number;
    player1Name: string;
    player2Id: number;
    player2Name: string;
    score1?: number | null;
    score2?: number | null;
}

export interface DateItem {
    date_id: number;
    date_date: string;
}

export interface Participant {
    user_id: number;
    name: string;
}

export interface LeaderboardEntry {
    position: number;
    user_id: number;
    name: string;
    matches_played: number;
    total_points: number;
    wins: number;
    losses: number;
}

export interface Tournament {
    tourney_id: number;
    name: string;
    status: 'open' | 'locked' | 'finished';
    hit_head: number;
    hit_torso: number;
    hit_arm: number;
    hit_legs: number;
    scoring_mode: 'total' | 'difference';
    allow_ties: boolean;
    players_advance: number;
}

export interface TournamentPool {
    pool_id: number;
    tourney_id: number;
    pool_number: number;
    members: { user_id: number; name: string }[];
    matches: Match[];
    leaderboard: LeaderboardEntry[];
}

export interface ElimSlot {
    slot_id: number;
    round_id: number;
    slot_number: number;
    advances_to_slot_id: number | null;
    player1_id: number | null;
    player2_id: number | null;
    winner_id: number | null;
    match: Match | null;
}

export interface ElimRound {
    round_id: number;
    tourney_id: number;
    round_number: number;
    round_name: string;
    slots: ElimSlot[];
}

export interface TournamentDetail extends Tournament {
    enrolled: { user_id: number; name: string }[];
    pools: TournamentPool[];
    elimRounds: ElimRound[];
}