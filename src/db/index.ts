import { Pool } from "pg";
import config from "../config";

 export const pool = new Pool({
    connectionString : config.conection_string
})
 export const DataBase = async()=>{
    try {
        await pool.query( `
            
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            email VARCHAR(50) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()

           

            )
` );
     
            console.log("Database connected successfully!!");
    } catch (error) {
        console.log(error);
        
    }
 }