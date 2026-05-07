import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ElimRound, LeagueRules } from "../../../types";

export default function EliminationBracket({ rounds, rules }: { rounds: ElimRound[]; rules: LeagueRules }) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (rounds.length === 0) return null;

    // API returns rounds ordered by round_number DESC (quarterfinal first → final last)
    return (
        <div style={styles.bracket}>
            {rounds.map(round => (
                <div key={round.round_id} style={styles.roundCol}>
                    <h4 style={styles.roundTitle}>{round.round_name}</h4>
                    <div style={styles.slots}>
                        {round.slots.map(slot => {
                            const m = slot.match;
                            const hasPlayers = slot.player1_id != null && slot.player2_id != null;
                            const isScored = m?.score1 != null && m?.score2 != null;
                            const isClickable = m && !isScored;

                            return (
                                <div
                                    key={slot.slot_id}
                                    style={{
                                        ...styles.slot,
                                        cursor: isClickable ? 'pointer' : 'default',
                                        borderColor: isScored ? '#86efac' : hasPlayers ? '#93c5fd' : '#e5e7eb',
                                    }}
                                    onClick={() => isClickable && navigate(`/matches/${m!.id}`, { state: { match: m, rules } })}
                                >
                                    {!hasPlayers && (
                                        <span style={styles.tbd}>{t('tournament.tbd')}</span>
                                    )}
                                    {hasPlayers && m && (
                                        <>
                                            <span style={{ fontWeight: slot.winner_id === m.player1Id ? 700 : 400 }}>
                                                {m.player1Name}
                                            </span>
                                            <span style={styles.vs}>{isScored ? `${m.score1} – ${m.score2}` : t('matches.vs')}</span>
                                            <span style={{ fontWeight: slot.winner_id === m.player2Id ? 700 : 400 }}>
                                                {m.player2Name}
                                            </span>
                                        </>
                                    )}
                                    {hasPlayers && !m && (
                                        <span style={styles.tbd}>{t('tournament.matchPending')}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    bracket: { display: 'flex', gap: '24px', overflowX: 'auto', padding: '4px 0' },
    roundCol: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' },
    roundTitle: { margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'capitalize' },
    slots: { display: 'flex', flexDirection: 'column', gap: '8px' },
    slot: {
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '10px 12px',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontSize: '13px',
    },
    vs: { fontSize: '11px', color: '#9ca3af', textAlign: 'center' as const },
    tbd: { color: '#9ca3af', fontSize: '12px', textAlign: 'center' as const },
};
