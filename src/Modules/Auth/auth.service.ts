import config from "../../config";
import { pool } from "../../db";
import type { Iuser } from "../user/user.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const loginServices = async(payload:Iuser)=>{
    const {email,password} = payload
    const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        
        `,[email])
    if(userData.rows.length === 0){
        throw new Error("User Not Found!!")
    }
    const user = userData.rows[0]

    const matchPassword = await bcrypt.compare(password,user.password)
     if (!matchPassword){
        throw new Error("Invalid Credintials!!")
     }

          const jwtPayload = {
            id :user.id,
    name :user.name,
    role:user.role

}
const accessToken = jwt.sign(jwtPayload,config.secret as string ,{expiresIn:"1d"})

delete user.password
return {
     token:accessToken,
     user:user
}
}

export const authServices={
   
    loginServices
}
