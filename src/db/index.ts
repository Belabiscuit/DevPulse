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
     await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL CHECK(LENGTH(description)>=20),
        type VARCHAR(30) NOT NULL CHECK(type IN ('bug', 'feature_request')),
         status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()

       )
        
 

        `) 

            console.log("Database connected successfully!!");
    } catch (error) {
        console.log(error);
        
    }
 }