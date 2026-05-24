import type { Request, Response } from "express";
import { serviceIssues } from "./issues.service";
import { pool } from "../../db";
import sendResponse from "../../Utility/sendResponse";

const createIssues = async (req:Request ,res:Response) =>{
        const user = (req as any).user
        const reporterId = user.id
       

        try {
            

            const result = await serviceIssues.createServiceIssue(req.body,reporterId)
            sendResponse(res,{
        statusCode:201,
        success:true,
        message:"Issue created successfully",
        data:result

       })




        } catch (error:any) {
        sendResponse(res,{
        statusCode:500,
        success:false,
        message:error.message,
        error:error,
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



     sendResponse(res,{
        statusCode:201,
        success:true,
        message:"Issues retrieved successfully",
        data:result

       })

    // return res.status(200).json({
    //   success: true,
    //   message: "Issues retrieved successfully",
    //   data: result,
    // });
  } catch (error:any) {
        sendResponse(res,{
        statusCode:404,
        success:false,
        message:error.message,
        error:error,
      })
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
            sendResponse(res,{
        statusCode:201,
        success:true,
        message:"Issues retrieved successfully",
        data:result.rows[0]

       })    
        } catch (error:any) {
        sendResponse(res,{
        statusCode:404,
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
           sendResponse(res,{
        statusCode:201,
        success:true,
        message:"Issues updated successfully",
        data:result.rows[0]

       })
        } catch (error:any) {
        sendResponse(res,{
        statusCode:500,
        success:false,
        message:error.message,
        error:error,
      })
}

    }

    const deleteIssueController = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        await serviceIssues.createServiceDelete(Number(id))
      sendResponse(res,{
        statusCode:200,
        success:true,
        message:"Issues deleted successfully",
        

       })
    } catch (error:any) {
        sendResponse(res,{
        statusCode:500,
        success:false,
        message:error.message,
        error:error,
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