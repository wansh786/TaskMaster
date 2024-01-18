const express=require("express")
const cores=require("cores");
const { connection } = require("./db");
const app=express();

app.use(express.json());
app.use(cores)

app.listen(8080,async()=>{
    try {
        await connection;
        console.log("connected to server")
    } catch (error) {
        console.log(error)
    }
})