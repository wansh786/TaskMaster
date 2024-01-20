const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const cron = require("node-cron");
const { connection } = require("./db");
const { Task } = require("./models/Task");
const { taskRouter } = require("./Routes/Task.routes");
const { taskListRouter } = require("./Routes/TaskList.routes");
const { googleRouter } = require("./Routes/Google.route");
const morgan = require("morgan");
const app = express();
const PORT=6005;
app.use(cookieParser());
app.use(express.json());
app.use(morgan("combined"));
// app.use(cors({
//     origin:true,
//     methods:"GET,POST,PUT,DELETE",
    // credentials:true
// }))
app.use(cors());

app.use("/taskList", taskListRouter);
app.use("/task", taskRouter);
// app.use("/task", taskRouter);
// change in google here
app.use("/google", googleRouter);

app.use("/dashboard", (req, res) => {
  res.send("Welcom to Task manager!");
});

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("connected to server");
  } catch (error) {
    console.log(error);
  }
});

