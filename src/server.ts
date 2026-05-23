import app from "./app"
import config from "./config"
import { DataBase } from "./db"



const main=()=>{
    DataBase()
app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`)
})
}
main();
