
export interface League {
    league_id: number;
    name: string;
}

export interface Match {
    id: number;
    player1Id: number;
    player2Id: number;
    score1?: number;
    score2?: number;
}

export interface DateItem {
    date_id: number;
    date_number: number;
    date_date: string;
}

export interface Participant {
    user_id: number;
}