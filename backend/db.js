const mongoose=require("mongoose");

// require("dotenv").config();

const connection=mongoose.connect("mongodb+srv://raghuwansh:singh@cluster0.ux37wqw.mongodb.net/TaskMaster?retryWrites=true&w=majority")

module.exports={
    connection
}