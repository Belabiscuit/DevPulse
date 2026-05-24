import express, { json, request, type Application, type Request, type Response } from "express"
import fs from "fs"
import { userRouter } from "./Modules/user/user.route";
import { authRouter } from "./Modules/Auth/auth.route";
import { issuesRouter } from "./Modules/Issues/issues.route";
const app:Application = express()


app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended:true}))

app.use("/api/auth",userRouter)
app.use("/api/auth/login",authRouter)
app.use("/api/issues",issuesRouter)


app.get('/', (req:Request, res:Response) => {
//   res.send('Hello World!')
res.status(200).json({
   message: "Express Server",
   "author" : "Sifa-t" 
});
})


 



export default app
