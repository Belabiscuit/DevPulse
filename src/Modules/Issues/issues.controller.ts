import type { Request, Response } from "express";
import { serviceIssues } from "./issues.service";
import { pool } from "../../db";

const createIssues = async (req:Request ,res:Response) =>{
        const user = (req as any).user
        const reporterId = user.id
       

        try {
            

            const result = await serviceIssues.createServiceIssue(req.body,reporterId)
            res.status(201).json({
             success:true,
             message : "Issue created successfully",
             data:result
            })




        } catch (error:any) {
          res.status(400).json({
            success: false,
            message: error.message,
            error: {}
        }) 
        }
    }
export const issuesController={
    createIssues
}