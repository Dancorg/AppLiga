import {pool} from '../config/db.js';

async function findUserByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM sc_users WHERE name = ?', [username]);
    return rows[0];
}

async function findUserByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM sc_users WHERE email = ?', [email]);
    return rows[0];
}

async function createUser(email, username, password, role) {
    const [result] = await pool.query('INSERT INTO sc_users (email, name, password, role) VALUES (?, ?, ?, ?)', [email, username, password, role]);
    console.log('User created with ID:', result.insertId);
    return result.insertId;
}

async function deleteUserByEmail(email) { // TODO delete by user id
    const [result] = await pool.query('DELETE FROM sc_users WHERE email = ?', [email]);
    //console.log('Delete result:', result);
    return result.affectedRows > 0;
}

const userModel = {
    findUserByEmail,
    findUserByUsername,
    createUser,
    deleteUserByEmail
};

export default userModel;