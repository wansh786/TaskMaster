const express = require("express");
const { body, param, validationResult } = require("express-validator");
// const tokenAuth = require("../middlewares/tokenAuth");
const { TaskList } = require("../models/TaskList");
const { Task } = require("../models/Task");
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const taskListRouter = express.Router();

//Route for posting a task List. POST /tasklist/new
taskListRouter.post("/new", 
// tokenAuth,
 async (req, res) => {
  try {
    const newList = await TaskList.create({
      user: req.user.id,
      title: req.body.title,
    });
    res.status(200).json(newList);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

//Get all the Lists of a Given User
taskListRouter.get("/lists", 
// tokenAuth, 
async (req, res) => {
  try {
    const taskLists = await TaskList.find({
      user: req.user.id,
      isDefaultTasksList: false,
    });
    if (taskLists === null) {
      res.status(500).json({ message: "Internal Server Error" });
    }
    res.json(taskLists);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

//Get all info of default list
taskListRouter.get("/tasks", 
// tokenAuth, 
async (req, res) => {
  try {
    // const userId = mongoose.Types.ObjectId(req.user.id);
    const defaultList = await TaskList.findOne({
      isDefaultTasksList: true,
      user: req.user.id,
    });
    if (!defaultList) {
      return res.status(404).json({ message: "List not Found" });
    }

    res.json(defaultList);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

//Get all info of a list
taskListRouter.get(
  "/:id",
  [param("id").exists().withMessage("Id parameter is missing")],
//   tokenAuth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Bad Request" });
    }
    try {
      const taskList = await TaskList.findById(req.params.id);
      if (taskList === null) {
        return res.status(404).json({ message: "List not Found" });
      }
      if (taskList.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(taskList);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

//Route to delete a List. /tasklist/delete/:id
taskListRouter.delete("/delete/:id", 
// tokenAuth,
 async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "Missing 'tasklist' parameter" });
  }

  const listId = req.params.id;

  if (!isValidObjectId(listId)) {
    return res.status(400).json({ error: "Invalid listId" });
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const list = await TaskList.findById(listId);

    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }
    if (list.isDefaultTasksList) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (list.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Task.deleteMany({ _id: { $in: list.tasks } });

    const deletedList = await TaskList.findByIdAndDelete(listId);

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Deleted Successfully.", deletedList });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

//Update the List title
taskListRouter.patch(
  "/updatetitle/:id",
  [
    param("id").exists().withMessage("Id is missing"),
    body("title").exists().withMessage("No Title to update is added."),
  ],
//   tokenAuth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Missing Parameter(s).", errors: errors.array() });
    }
    const listId = req.params.id;
    const newTitle = req.body.title;

    if (!isValidObjectId(listId)) {
      return res.status(400).json({ error: "Invalid listId" });
    }

    try {
      const list = await TaskList.findById(listId);
      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }

      if (list.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      list.title = newTitle;
      await list.save();

      res
        .status(200)
        .json({ message: "Title Updated Successfully.", newTitle });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: error.message, message: "Internal Server Error" });
    }
  }
);

module.exports = {taskListRouter};