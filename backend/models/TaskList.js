const mongoose = require("mongoose");
const { Schema } = mongoose;

const listSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  title: {
    type: String,
    required: true,
    default: "Untitled List",
  },
  toDos: [{
    type: Schema.Types.ObjectId,
    ref: "toDos"
  }],

  isDefaultTasksList:{
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const TaskList = mongoose.model("taskLists", listSchema);

module.exports = { TaskList};