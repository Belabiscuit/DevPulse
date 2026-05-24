import type { Request, Response } from "express";
import { userService } from "./user.service";
import sendResponse from "../../Utility/sendResponse";


const userRegistration = async(req:Request,res:Response)=>{
      try {
        const result = await userService.serviceRegistration(req.body)
       
       sendResponse(res,{
        statusCode:200,
        success:true,
        message:"user registered Successfully",
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

export const userController ={
     userRegistration
}

