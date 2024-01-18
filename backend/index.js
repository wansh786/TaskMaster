const express=require("express")
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const { connection } = require("./db");
const { Task} = require("./models/Task");
const {taskRouter}= require("./Routes/Task.routes");
const {taskListRouter} = require('./Routes/TaskList.routes');
const app=express();

app.use(cookieParser());
app.use(express.json());
app.use(cors())


app.use("/taskList",taskListRouter);
app.use("/task",taskRouter);

app.listen(8080,async()=>{
    try {
        await connection;
        console.log("connected to server")
    } catch (error) {
        console.log(error)
    }
})