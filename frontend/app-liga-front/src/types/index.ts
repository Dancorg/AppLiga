
export interface League {
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
    date_number: number;
    date_date: string;
}

export interface Participant {
    user_id: number;
    name: string;
}