const mongoose = require("mongoose")
const { Schema } = mongoose;


const taskStepsSchema = new Schema({
  stepTitle: {
    type: String
  },
  isCompleted: {
    type: Boolean,
    default: false,
  }
})

const taskSchema = new Schema({
  user:{
    type: Schema.Types.ObjectId,
    ref:"user"
  },
  taskList:{
    type: Schema.Types.ObjectId,
    ref:"taskLists"
  },
  title: {
    type: String,
    required: true,
  },
  steps: {
    type: [taskStepsSchema],
  },
  note: {
    type: String,
  },
  dueAt: { 
    type: Date
 },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  markedImp: {
    type: Boolean,
    default: false
  },
  inMyDay: {
    type: Boolean,
    default: false
  }
},
{timestamps:true});

const Task = mongoose.model("tasks", taskSchema);
module.exports = { Task};