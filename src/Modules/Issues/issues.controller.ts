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
          res.status(500).json({
            success: false,
            message: error.message,
            error: {}
        }) 
        }
    }

    const createIssueControllerAll = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;

    const result = await serviceIssues.createServiceIssueGetAll(
      sort as string | undefined,
      type as string | undefined,
      status as string | undefined
    );

    return res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


    const createIssueControllersSingle = async(req:Request,res:Response)=>{
        const {id} = req.params
        try {
            const result = await serviceIssues.createServiceIssueSingle(Number(id))
              if(result.rows.length === 0){
            res.status(404).json({
                success:false,
                message:"Not Found!",

            })
        }
          res.status(200).json({
            success:true,
            message:"Issue retrieved successfully",
            data:result.rows[0],
        })     
        } catch (error:any) {
            res.status(404).json({
            success:false,
            message:error.message,
            error:error,

        })
        }

    } 



    const patchIssueController = async(req:Request,res:Response)=>{
        try {
            const {id} =req.params
            const{role,id:userID}=(req as any).user
          const result = await serviceIssues.createServicePatch(Number(id), userID, role, req.body)
            res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: result.rows[0]
        })
        } catch (error:any) {
             return res.status(500).json({
            success: false,
            message: error.message,
            
        })
        }

    }

    const deleteIssueController = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        await serviceIssues.createServiceDelete(Number(id))
        res.status(200).json({
            success: true,
            message: "Issue deleted successfully"
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: {}
        })
    }
}



export const issuesController={
    createIssues,
    createIssueControllersSingle,
    createIssueControllerAll,
    patchIssueController,
    deleteIssueController

}