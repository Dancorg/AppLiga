import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import type { Match } from "../types";
import { submitScore } from "../features/matches/api";

const POINTS = { head: 3, torso: 2, arm: 1, legs: 1 } as const;
type BodyArea = keyof typeof POINTS;

interface HitEntry { player: 1 | 2; pts: number; }

interface BodyTargetProps {
    label: string;
    baseColor: string;
    flashColor: string;
    onHit: (pts: number) => void;
    disabled: boolean;
}

function BodyTarget({ label, baseColor, flashColor, onHit, disabled }: BodyTargetProps) {
    const [flashing, setFlashing] = useState<BodyArea | null>(null);

    const hit = (area: BodyArea) => {
        if (disabled) return;
        setFlashing(area);
        setTimeout(() => setFlashing(null), 150);
        onHit(POINTS[area]);
    };

    const box = (area: BodyArea, width: number, height: number): React.CSSProperties => ({
        width,
        height,
        backgroundColor: flashing === area ? flashColor : baseColor,
        border: "2px solid rgba(0,0,0,0.25)",
        borderRadius: "4px",
        cursor: disabled ? "default" : "pointer",
        transition: "background-color 0.1s",
        flexShrink: 0,
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <strong style={{ fontSize: "14px" }}>{label}</strong>
            <div style={box("head", 56, 56)} onClick={() => hit("head")} title="Head (+3)" />
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <div style={box("arm", 28, 64)} onClick={() => hit("arm")} title="Arm (+1)" />
                <div style={box("torso", 56, 72)} onClick={() => hit("torso")} title="Torso (+2)" />
                <div style={box("arm", 28, 64)} onClick={() => hit("arm")} title="Arm (+1)" />
            </div>
            <div style={box("legs", 56, 60)} onClick={() => hit("legs")} title="Legs (+1)" />
            <span style={{ fontSize: "11px", color: "#666" }}>click to register hit</span>
        </div>
    );
}

interface ScoreControlsProps {
    onAdd: () => void;
    onSubtract: () => void;
    disabled: boolean;
}

function ScoreControls({ onAdd, onSubtract, disabled }: ScoreControlsProps) {
    const btn: React.CSSProperties = {
        width: "28px", height: "28px", fontSize: "16px", lineHeight: 1,
        cursor: disabled ? "default" : "pointer", borderRadius: "4px",
        border: "1px solid #d1d5db", background: "#f3f4f6",
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <button style={btn} onClick={onAdd} disabled={disabled}>+</button>
            <button style={btn} onClick={onSubtract} disabled={disabled}>−</button>
        </div>
    );
}

export default function MatchPage() {
    const { matchId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const match = state?.match as Match | undefined;
    const alreadyScored = match?.score1 != null && match?.score2 != null;

    const [player1Score, setPlayer1Score] = useState(alreadyScored ? match!.score1! : 0);
    const [player2Score, setPlayer2Score] = useState(alreadyScored ? match!.score2! : 0);
    const [history, setHistory] = useState<HitEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const done = alreadyScored || submitted;

    const addHit = (player: 1 | 2, pts: number) => {
        if (done) return;
        const setScore = player === 1 ? setPlayer1Score : setPlayer2Score;
        const current = player === 1 ? player1Score : player2Score;
        if (current + pts < 0) return;
        setScore(s => s + pts);
        setHistory(h => [...h, { player, pts }]);
    };

    const undo = () => {
        if (history.length === 0) return;
        const last = history[history.length - 1];
        const setScore = last.player === 1 ? setPlayer1Score : setPlayer2Score;
        setScore(s => s - last.pts);
        setHistory(h => h.slice(0, -1));
    };

    const handleSubmit = async () => {
        if (!matchId) return;
        try {
            setLoading(true);
            setError(null);
            await submitScore(Number(matchId), player1Score, player2Score);
            setSubmitted(true);
        } catch (err: unknown) {
            setError((err as { message: string }).message ?? "Error submitting score");
        } finally {
            setLoading(false);
        }
    };

    const p1 = match?.player1Name ?? `Player ${match?.player1Id ?? 1}`;
    const p2 = match?.player2Name ?? `Player ${match?.player2Id ?? 2}`;

    return (
        <div style={styles.page}>
            <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>

            {/* Scoreboard */}
            <div style={styles.scoreboard}>
                <ScoreControls
                    onAdd={() => addHit(1, 1)}
                    onSubtract={() => addHit(1, -1)}
                    disabled={done}
                />
                <div style={{ ...styles.scoreBlock, color: "#2563eb" }}>
                    <span style={styles.scoreName}>{p1}</span>
                    <span style={styles.scoreNumber}>{player1Score}</span>
                </div>
                <span style={styles.dash}>–</span>
                <div style={{ ...styles.scoreBlock, color: "#dc2626" }}>
                    <span style={styles.scoreName}>{p2}</span>
                    <span style={styles.scoreNumber}>{player2Score}</span>
                </div>
                <ScoreControls
                    onAdd={() => addHit(2, 1)}
                    onSubtract={() => addHit(2, -1)}
                    disabled={done}
                />
            </div>

            {/* Arena */}
            <div style={styles.arena}>
                <BodyTarget
                    label={p1}
                    baseColor="#3b82f6"
                    flashColor="#bfdbfe"
                    onHit={(pts) => addHit(2, pts)}
                    disabled={done}
                />
                <span style={styles.vs}>VS</span>
                <BodyTarget
                    label={p2}
                    baseColor="#ef4444"
                    flashColor="#fecaca"
                    onHit={(pts) => addHit(1, pts)}
                    disabled={done}
                />
            </div>

            {/* Controls */}
            {!done && (
                <div style={styles.controls}>
                    <button onClick={undo} disabled={history.length === 0} style={styles.undoBtn}>
                        ↩ Undo
                    </button>
                    <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
                        {loading ? "Submitting..." : "Submit Score"}
                    </button>
                </div>
            )}

            {submitted && <p style={{ color: "green" }}>Score submitted!</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {alreadyScored && !submitted && <p style={{ color: "gray" }}>This match has already been scored.</p>}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: { padding: "20px", maxWidth: "520px" },
    back: { marginBottom: "16px", cursor: "pointer" },
    scoreboard: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        margin: "16px 0 28px",
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        background: "#f9fafb",
    },
    scoreBlock: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        minWidth: "80px",
    },
    scoreName: { fontSize: "13px", fontWeight: 600 },
    scoreNumber: { fontSize: "40px", fontWeight: 700, lineHeight: 1 },
    dash: { fontSize: "32px", color: "#9ca3af" },
    arena: {
        display: "flex",
        gap: "32px",
        alignItems: "flex-start",
        justifyContent: "center",
        marginBottom: "24px",
    },
    vs: { fontSize: "18px", fontWeight: 700, color: "#6b7280", marginTop: "80px" },
    controls: { display: "flex", gap: "12px", alignItems: "center" },
    undoBtn: { padding: "8px 16px", cursor: "pointer" },
    submitBtn: { padding: "10px 24px", fontSize: "16px", cursor: "pointer" },
};
