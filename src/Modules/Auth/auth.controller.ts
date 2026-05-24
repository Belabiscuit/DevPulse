import type { Request, Response } from "express";
import { authServices } from "./auth.service";
import sendResponse from "../../Utility/sendResponse";

const loginUser= async(req:Request,res:Response)=>{
    try {
        const result = await authServices.loginServices(req.body)


         sendResponse(res,{
        statusCode:200,
        success:true,
        message:"user registered Successfully",
         data:{
            token:result.token,
            user:result.user
        }


       })
    }
     catch (error:any) {
        sendResponse(res,{
        statusCode:500,
        success:false,
        message:error.message,
        error:error,
      })
}
}
export const authController ={
    loginUser
}