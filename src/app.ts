import express, { json, request, type Application, type Request, type Response } from "express"
import fs from "fs"
import { userRouter } from "./Modules/user/user.route";
const app:Application = express()




app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended:true}))



 
app.use((req, res, next) => {
   const log  = `\nMethod -> ${req.method} - URL -> ${req.url} - TIME-> ${Date.now()} \n`
 fs.appendFile("logger.txt",log,(err)=>{})

  next();
});

 

app.use("/api/auth",userRouter)












app.get('/', (req:Request, res:Response) => {
//   res.send('Hello World!')
res.status(200).json({
   message: "Express Server",
   "author" : "Sifa-t" 
});
})


 



export default app
