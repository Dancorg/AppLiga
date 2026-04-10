import dateModel from "../models/date.model.js";

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