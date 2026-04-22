import dateModel from "../models/date.model.js";
import ParticipationModel from "../models/participation.model.js";
import enrollmentModel from "../models/enrollment.model.js";

export async function createDateForLeague(leagueId, date_number, date_date) {
    try {
        const newDate = await dateModel.createDate(leagueId, date_number, date_date);
        console.log(newDate);
        return newDate;
    } catch (error) {
        console.error('Error creating date:', error);
        throw new Error('Error creating date');
    }
};

export async function deleteDate(dateId) {
    try {
        await dateModel.deleteDateById(dateId);
        return { message: 'Date deleted successfully' };
    } catch (error) {
        console.error('Error deleting date:', error);
        throw new Error('Error deleting date');
    }
};

export async function getDates() {
    try {
        const dates = await dateModel.findDates();
        return dates;
    } catch (error) {
        console.error('Error getting dates:', error);
        throw new Error('Error getting dates');
    }
}

export async function getDate(dateId) {
    try {
        const date = await dateModel.findDateById(dateId);
        return date;
    } catch (error) {
        console.error('Error getting date:', error);
        throw new Error('Error getting date');
    }
}

//join date
export async function dateParticipation(userId, dateId) { 
    try {
        const leagueId = await dateModel.getLeagueOfDate(dateId);
        const players = await enrollmentModel.getPlayersByLeagueId(leagueId.league_id);
        const isEnrolled = players.some(player => player.user_id === userId);
        if(!isEnrolled){
            throw new Error('User is not enrolled in this league');
        }
        const newParticipation = ParticipationModel.joinDate(userId, dateId);
        return newParticipation;
    } catch (error) {
        console.error('Error joining date:', error);
        throw new Error('Error joining date');
    }
}

export async function getParticipants(dateId) {
    try {
        const participants = await ParticipationModel.getPlayersByDate(dateId);
        return participants;
    } catch (error) {
        console.error('Error retrieving participants:', error);
        throw new Error('Error retrieving participants');
    }
}