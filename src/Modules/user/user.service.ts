import { pool } from "../../db"
import type { Iuser } from "./user.interface"
import bcrypt from "bcrypt";

const serviceRegistration = async(payload :Iuser )=>{
    const {name,email,password,role}= payload 
     const hassPassword = await bcrypt.hash(password,10)

    const result = await pool.query(`
        
        INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4)
        RETURNING * 
        `,[name,email,hassPassword,role])
        delete result.rows[0].password
        return result

}

export const userService={
 serviceRegistration
}