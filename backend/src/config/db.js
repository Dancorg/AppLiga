import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });
console.log(process.env.MYSQL_USER);

export const pool = mysql2.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});