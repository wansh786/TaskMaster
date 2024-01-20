const express=require("express")
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const { connection } = require("./db");
const { Task} = require("./models/Task");
const {taskRouter}= require("./Routes/Task.routes");
const {taskListRouter} = require('./Routes/TaskList.routes');
const {googleRouter}=require("./Routes/Google.route")
const app=express();


app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin:"http://localhost:3000",
    methods:"GET,POST,PUT,DELETE",
    credentials:true
}))

app.use("/taskList",taskListRouter);
app.use("/task",taskRouter);
app.use("/task",taskRouter);
// change in google here
app.use("/google",googleRouter);

app.use("/dashboard",(req,res)=>{
    res.send("Welcom to Task manager!");
})

app.listen(6005,async()=>{
    try {
        await connection;
        console.log("connected to server")
    } catch (error) {
        console.log(error)
    }
})