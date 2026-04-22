import type { Match } from "../types";

// Circle method: fix first player, rotate the rest each round.
// Produces a sequence where no player plays back-to-back (guaranteed for even n).
function generateRoundRobinOrder(playerIds: number[]): [number, number][] {
    const isOdd = playerIds.length % 2 !== 0;
    const players = isOdd ? [...playerIds, -1] : [...playerIds]; // -1 = bye
    const total = players.length;

    const fixed = players[0];
    let rotating = players.slice(1);
    const pairings: [number, number][] = [];

    for (let r = 0; r < total - 1; r++) {
        const circle = [fixed, ...rotating];
        for (let i = 0; i < total / 2; i++) {
            const p1 = circle[i];
            const p2 = circle[total - 1 - i];
            if (p1 !== -1 && p2 !== -1) {
                pairings.push([p1, p2]);
            }
        }
        rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
    }

    return pairings;
}

export function sortMatchesNoConsecutivePlayers(matches: Match[]): Match[] {
    if (matches.length <= 1) return matches;

    const playerIds = [...new Set(matches.flatMap(m => [m.player1Id, m.player2Id]))];
    const order = generateRoundRobinOrder(playerIds);

    const remaining = new Map(matches.map((m, i) => [i, m]));
    const result: Match[] = [];

    for (const [p1, p2] of order) {
        for (const [idx, m] of remaining) {
            if (
                (m.player1Id === p1 && m.player2Id === p2) ||
                (m.player1Id === p2 && m.player2Id === p1)
            ) {
                result.push(m);
                remaining.delete(idx);
                break;
            }
        }
    }

    for (const m of remaining.values()) {
        result.push(m);
    }

    return result;
}
