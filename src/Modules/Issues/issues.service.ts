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
const createAllIssues = async (
  sort: string | undefined,
  type: string | undefined,
  status: string | undefined
) => {
  const order = sort === "oldest" ? "ASC" : "DESC";

  const conditions: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (type) {
    conditions.push(`type = $${index++}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${index++}`);
    values.push(status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

 
  const issuesResult = await pool.query(
    `SELECT * FROM issues ${whereClause} ORDER BY created_at ${order}`,
    values
  );

  const issues = issuesResult.rows;

  if (issues.length === 0) {
    throw new Error("No issues found");
  }

  
  const allReporterIds = issues.map((issue) => issue.reporter_id);

  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [allReporterIds]
  );


  const usersMap: Record<number, any> = {};
  usersResult.rows.forEach((user) => {
    usersMap[user.id] = user;
  });

 
  const data = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: usersMap[issue.reporter_id] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));

  return data;
};



const createServicePatch = async(id:number,userID:number,role:string,payload:any,)=>{
    const {title,description,type} = payload
//id patate hbe 
       const issueSearch = await pool.query(`
            SELECT *FROM issues WHERE id=$1
        
        
        
        `,[id])
      
        if(issueSearch.rows.length === 0){
            throw new Error("Issue not Found")
        }
        if(role === "contributor" && userID !== issueSearch.rows[0].reporter_id){
            throw new Error("unathorized Access!")
        }
        if(role === "contributor" && issueSearch.rows[0].status!="open"){
            throw new Error("On going!")
        }

        const result = await pool.query(`UPDATE issues
         SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         type = COALESCE($3, type),
         status = 'in_progress',
         updated_at = NOW()
         WHERE id = $4
         RETURNING *
            
            `,[title,description,type,id])
            return result

}

const createServiceDelete = async (id: number) => {
    const issueSearch = await pool.query(
        `SELECT * FROM issues WHERE id=$1`, [id]
    )
    if (issueSearch.rows.length === 0) {
        throw new Error("Issue Not Found!")
    }
    await pool.query(
        `DELETE FROM issues WHERE id=$1`, [id]
    )
}

export  const serviceIssues ={
    createServiceIssue,
    createServiceIssueSingle,
    createAllIssues,
    createServicePatch,
    createServiceDelete
}