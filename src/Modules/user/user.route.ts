import { Router } from "express";
import { userController } from "./user.controller";



const router = Router()

router.post("/signup",userController.userRegistration)

export const userRouter= router