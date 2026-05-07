import TournamentModel from '../models/tournament.model.js';
import MatchModel from '../models/match.model.js';
import UserModel from '../models/user.model.js';

async function createTournament(name, rules = {}) {
    const config = {
        hit_head:        rules.hit_head        ?? 3,
        hit_torso:       rules.hit_torso       ?? 2,
        hit_arm:         rules.hit_arm         ?? 1,
        hit_legs:        rules.hit_legs        ?? 1,
        scoring_mode:    rules.scoring_mode    ?? 'total',
        pool_size:       rules.pool_size       ?? 4,
        players_advance: rules.players_advance ?? 2,
        elim_stages:     rules.elim_stages     ?? 2,
    };
    return TournamentModel.createTournament(name, config);
}

async function getTournaments() {
    return TournamentModel.getTournaments();
}

async function getTournamentById(tourneyId) {
    return TournamentModel.getTournamentById(tourneyId);
}

async function deleteTournament(tourneyId) {
    return TournamentModel.deleteTournament(tourneyId);
}

async function joinTournament(tourneyId, userId) {
    const tournament = await TournamentModel.getTournamentById(tourneyId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'open') throw new Error('Tournament is not open for enrollment');
    const already = await TournamentModel.isEnrolled(tourneyId, userId);
    if (already) throw new Error('Already enrolled in this tournament');
    await TournamentModel.enrollUser(tourneyId, userId);
}

async function enrollUserByUsername(tourneyId, username) {
    const user = await UserModel.findUserByUsername(username);
    if (!user) throw new Error('User not found');
    const tournament = await TournamentModel.getTournamentById(tourneyId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'open') throw new Error('Tournament is not open for enrollment');
    const already = await TournamentModel.isEnrolled(tourneyId, user.user_id);
    if (already) throw new Error('User already enrolled');
    await TournamentModel.enrollUser(tourneyId, user.user_id);
    return user;
}

async function startTournament(tourneyId) {
    const tournament = await TournamentModel.getTournamentById(tourneyId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'open') throw new Error('Tournament is not open');

    const players = await TournamentModel.getEnrolledPlayers(tourneyId);
    if (players.length < 2) throw new Error('Not enough players enrolled');

    const { pool_size, players_advance, elim_stages } = tournament;

    // Shuffle players for random pool assignment
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    // Divide into pools
    const poolGroups = [];
    for (let i = 0; i < shuffled.length; i += pool_size) {
        poolGroups.push(shuffled.slice(i, i + pool_size));
    }

    // Create each pool and round-robin matches within it
    for (let i = 0; i < poolGroups.length; i++) {
        const poolId = await TournamentModel.createPool(tourneyId, i + 1);
        const group = poolGroups[i];

        for (const player of group) {
            await TournamentModel.addPoolMember(poolId, player.user_id);
        }

        for (let a = 0; a < group.length; a++) {
            for (let b = a + 1; b < group.length; b++) {
                const matchId = await MatchModel.createMatch(null);
                const [p1, p2] = [group[a].user_id, group[b].user_id].sort((x, y) => x - y);
                await MatchModel.addPlayerToMatch(matchId, p1);
                await MatchModel.addPlayerToMatch(matchId, p2);
                await TournamentModel.setMatchPoolId(matchId, poolId);
            }
        }
    }

    // Create elimination bracket structure
    if (elim_stages > 0) {
        const roundIds = [];
        for (let r = 1; r <= elim_stages; r++) {
            const roundName = r === 1 ? 'final'
                : r === 2 ? 'semifinal'
                : r === 3 ? 'quarterfinal'
                : `round_of_${Math.pow(2, r)}`;
            const roundId = await TournamentModel.createElimRound(tourneyId, r, roundName);
            roundIds.push(roundId);
        }

        // Build slots from final outward:
        // round 1 (final): 1 slot, no advances_to
        // round 2 (semi): 2 slots, each advances_to one of final's slots
        // round 3 (quarter): 4 slots, pairs advance to each semi slot
        const finalSlotId = await TournamentModel.createElimSlot(roundIds[0], 1, null);
        let prevRoundSlots = [finalSlotId];

        for (let r = 1; r < elim_stages; r++) {
            const currentSlots = [];
            for (let s = 0; s < prevRoundSlots.length; s++) {
                const slot1 = await TournamentModel.createElimSlot(roundIds[r], s * 2 + 1, prevRoundSlots[s]);
                const slot2 = await TournamentModel.createElimSlot(roundIds[r], s * 2 + 2, prevRoundSlots[s]);
                currentSlots.push(slot1, slot2);
            }
            prevRoundSlots = currentSlots;
        }
    }

    await TournamentModel.updateTournamentStatus(tourneyId, 'locked');

    return { pools: poolGroups.length, playersPerPool: pool_size, elimStages: elim_stages };
}

async function advanceToElimination(tourneyId) {
    const tournament = await TournamentModel.getTournamentById(tourneyId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'locked') throw new Error('Tournament pool stage is not active');

    const { players_advance, elim_stages } = tournament;

    if (elim_stages === 0) {
        await TournamentModel.updateTournamentStatus(tourneyId, 'finished');
        return { message: 'Tournament finished (pool stage only)' };
    }

    const pools = await TournamentModel.getPools(tourneyId);

    // Verify all pool matches are scored
    for (const p of pools) {
        const matches = await TournamentModel.getPoolMatchesWithPlayers(p.pool_id);
        const unscored = matches.filter(m => m.score1 == null || m.score2 == null);
        if (unscored.length > 0) {
            throw new Error(`Pool ${p.pool_number} still has ${unscored.length} unscored match(es)`);
        }
    }

    // Build seeded list: rank 1 of each pool, then rank 2, etc.
    // This avoids same-pool players meeting in the first round
    const seeded = [];
    for (let rank = 0; rank < players_advance; rank++) {
        for (const p of pools) {
            const lb = await TournamentModel.getPoolLeaderboard(p.pool_id);
            if (lb[rank]) seeded.push(lb[rank]);
        }
    }

    // Get first-round slots (highest round_number = last created = first played)
    const elimRounds = await TournamentModel.getElimRounds(tourneyId);
    const firstRound = elimRounds[0]; // ordered DESC, so highest round_number first
    const firstRoundSlots = await TournamentModel.getSlotsByRound(firstRound.round_id);

    // Assign players: top seed vs bottom seed in each slot
    const n = firstRoundSlots.length;
    for (let i = 0; i < n; i++) {
        const slot = firstRoundSlots[i];
        const p1 = seeded[i];
        const p2 = seeded[seeded.length - 1 - i];
        if (!p1 || !p2) continue;

        const [minId, maxId] = [p1.user_id, p2.user_id].sort((a, b) => a - b);
        await TournamentModel.updateElimSlotPlayers(slot.slot_id, minId, maxId);

        const matchId = await MatchModel.createMatch(null);
        await MatchModel.addPlayerToMatch(matchId, minId);
        await MatchModel.addPlayerToMatch(matchId, maxId);
        await TournamentModel.setMatchElimSlotId(matchId, slot.slot_id);
    }

    return { message: 'Advanced to elimination stage', players: seeded.length };
}

async function getTournamentDetails(tourneyId) {
    const tournament = await TournamentModel.getTournamentById(tourneyId);
    if (!tournament) throw new Error('Tournament not found');

    const enrolled = await TournamentModel.getEnrolledPlayers(tourneyId);
    const pools = await TournamentModel.getPools(tourneyId);

    const poolDetails = await Promise.all(pools.map(async (p) => {
        const members = await TournamentModel.getPoolMembers(p.pool_id);
        const matches = await TournamentModel.getPoolMatchesWithPlayers(p.pool_id);
        const lb = await TournamentModel.getPoolLeaderboard(p.pool_id);
        return {
            ...p,
            members,
            matches,
            leaderboard: lb.map((e, i) => ({ position: i + 1, ...e })),
        };
    }));

    const elimRounds = await TournamentModel.getElimRounds(tourneyId);
    const elimDetails = await Promise.all(elimRounds.map(async (r) => {
        const slots = await TournamentModel.getSlotsByRound(r.round_id);
        const slotsWithMatches = await Promise.all(slots.map(async (s) => {
            const match = await TournamentModel.getElimMatchWithPlayers(s.slot_id);
            return { ...s, match };
        }));
        return { ...r, slots: slotsWithMatches };
    }));

    return { ...tournament, enrolled, pools: poolDetails, elimRounds: elimDetails };
}

// Called by match.controllers after a score is submitted
async function handleElimProgression(matchId) {
    const [matchRows] = await (await import('../config/db.js')).pool.query(
        'SELECT elim_slot_id FROM matches WHERE id = ?', [matchId]
    );
    const match = matchRows[0];
    if (!match?.elim_slot_id) return;

    const slot = await TournamentModel.getElimSlot(match.elim_slot_id);
    if (!slot) return;

    // Determine winner from scores
    const [scoreRows] = await (await import('../config/db.js')).pool.query(
        'SELECT user_id, score FROM scores WHERE match_id = ?', [matchId]
    );
    if (scoreRows.length !== 2) return;
    const winner = scoreRows[0].score >= scoreRows[1].score ? scoreRows[0] : scoreRows[1];

    await TournamentModel.setElimSlotWinner(slot.slot_id, winner.user_id);

    // No next slot → this was the final
    if (!slot.advances_to_slot_id) {
        const tournament = await TournamentModel.getTournamentBySlotId(slot.slot_id);
        if (tournament) await TournamentModel.updateTournamentStatus(tournament.tourney_id, 'finished');
        return;
    }

    // Check if sibling slot also has a winner
    const siblingSlots = await TournamentModel.getSlotsAdvancingTo(slot.advances_to_slot_id);
    if (!siblingSlots.every(s => s.winner_id != null)) return;

    // Both feeders done — generate the next match
    const winners = siblingSlots.map(s => s.winner_id).sort((a, b) => a - b);
    const nextSlotId = slot.advances_to_slot_id;

    await TournamentModel.updateElimSlotPlayers(nextSlotId, winners[0], winners[1]);

    const nextMatchId = await MatchModel.createMatch(null);
    await MatchModel.addPlayerToMatch(nextMatchId, winners[0]);
    await MatchModel.addPlayerToMatch(nextMatchId, winners[1]);
    await TournamentModel.setMatchElimSlotId(nextMatchId, nextSlotId);
}

const tournamentService = {
    createTournament,
    getTournaments,
    getTournamentById,
    deleteTournament,
    joinTournament,
    enrollUserByUsername,
    startTournament,
    advanceToElimination,
    getTournamentDetails,
    handleElimProgression,
};

export default tournamentService;
