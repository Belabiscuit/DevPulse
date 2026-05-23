import { pool } from "../../db"

const createServiceIssue = async(payload: any ,reporterId:number)=>{
    const {title,description,type} = payload 
     const result = await pool.query(`
       INSERT INTO issues (title,description,type,reporter_id) VALUES ($1,$2,$3,$4) 
       RETURNING *
        `,[title,description,type,reporterId]) 

        return result.rows[0]

}


const createServiceIssueSingle = async(id:number)=>{
 
    const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        
        `,[id])
      
        return result

}

export  const serviceIssues ={
    createServiceIssue,
    createServiceIssueSingle
}