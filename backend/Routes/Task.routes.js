const express = require("express");
const { body, header, param, validationResult } = require("express-validator");
// const tokenAuth = require("../middlewares/tokenAuth");
const { TaskList } = require("../models/TaskList");
const { Task } = require("../models/Task");
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const taskRouter = express.Router();

// /task
// Provide title, user (id), the list it belongs to, and in the taskLists Model-add this list
taskRouter.post( "/",
  [
    body("title").exists().withMessage("Please enter something"),
    header("tasklist")
      .exists()
      .withMessage("This Task does not belong to a List"),
  ],
  // tokenAuth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await Task.create({
        ...req.body,
        user: req.user.id,
        taskList: req.headers.tasklist,
      });
      const updatedList = await TaskList.findByIdAndUpdate(
        req.headers.tasklist,
        { $push: { tasks: task._id } },
        { new: true }
      );
      res.json(task);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error.", error: error });
    }
  }
);

//Get all info of a task
taskRouter.get(
  "/info/:id",
  [param("id").exists().withMessage("Id parameter is missing")],
  // tokenAuth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Bad Request" });
    }
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "List not Found" });
      }
      if (task.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(task);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

//GET all the tasks of a given list id
//id is of list

taskRouter.get(
  "/:id",
  [param("id").exists().withMessage("Missing id parameter")],
  // tokenAuth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Missing Parameter.", errors: errors.array() });
    }

    const tasklistId = req.params.id;

    //This just checks whether the id is a MongoDB id or not. 
    // It checks a pattern. A wrong id which matches the pattern would also be accepted here.
    if (!isValidObjectId(tasklistId)) {
      return res.status(400).json({ error: "Not a MongoDB Id: task list" });
    }
    try {
      const taskList = await TaskList.findById(tasklistId);

      if (!taskList) {
        return res.status(404).json({ error: "Task List not found" });
      }

      if (taskList.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const tasks = await Task.find({ _id: { $in: taskList.tasks } });

      if (!tasks) {
        res.status(404).send("NOT FOUND");
      }

      res.status(200).json(tasks);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

//GET all the tasks of a given user
// taskRouter.get("/", tokenAuth, async (req, res) => {
  taskRouter.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });

    if (!tasks) {
      res.status(404).send("NO Tasks Found");
    }

    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

//Route for deleting a task ROUTE: DELETE /task/:id

taskRouter.delete(
  "/:id",
  [
    param("id").exists().withMessage("Missing id parameter"),
    header("tasklist").exists().withMessage("The tasklist header is missing"),
  ],
  // tokenAuth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Missing Parameter(s).", errors: errors.array() });
    }

    const taskId = req.params.id;
    const listId = req.headers.tasklist;

    //This just checks whether the id is a MongoDB id or not. 
    //It checks a pattern. A wrong id which matches the pattern would also be accepted here.

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ error: "Not a MongoDB Id: task" });
    }
    if (!isValidObjectId(listId)) {
      return res.status(400).json({ error: "Not a MongoDB Id: task List" });
    }

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const task = await Task.findById(taskId);
      const taskList = await TaskList.findById(listId);

      if (!task || !taskList) {
        return res.status(404).json({ error: "Task or Task List not found" });
      }

      if (
        taskList.user.toString() !== req.user.id &&
        task.user.toString() !== req.user.id
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!taskList.tasks.includes(taskId)) {
        return res.status(422).json({
          message: "Unprocessable Content",
          error:
            "The task does not belong to the task list sent in the header.",
        });
      }

      await Task.findByIdAndDelete(taskId);
      await TaskList.findByIdAndUpdate(listId, { $pull: { tasks: taskId } });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: "Deleted the Task Successfully." });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

//Route for updating a task ROUTE: PUT /task/:id
taskRouter.put(
  "/:id",
  [param("id").exists().withMessage("Missing id parameter")],
  // tokenAuth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Missing Parameter.", errors: errors.array() });
    }

    const taskId = req.params.id;
    const { title, note, dueAt, isCompleted, markedImp, inMyDay } = req.body;

    if (!title && !note && !dueAt && !isCompleted && !markedImp && !inMyDay) {
      return res.status(400).json({ message: "No Things to Update" });
    }

    //Create a new Task object
    const newTask = {};

    if (title) {
      newTask.title = title;
    }
    if (note) {
      newTask.note = note;
    }
    if (dueAt) {
      newTask.dueAt = dueAt;
    }
    if (isCompleted) {
      newTask.isCompleted = isCompleted;
    }
    if (markedImp) {
      newTask.markedImp = markedImp;
    }
    if (inMyDay) {
      newTask.inMyDay = inMyDay;
    }

    //This just checks whether the id is a MongoDB id or not. 
    // It checks a pattern. A wrong id which matches the pattern would also be accepted here.
    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ error: "Not a MongoDB Id: task" });
    }

    try {
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task is not found" });
      }

      if (task.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (dueAt === "REMOVEDATE") {
        const updatedTask = await Task.findByIdAndUpdate(
          taskId,
          { $unset: { dueAt: true } },
          { new: true }
        );
        if (!updatedTask) {
          return res.status(404).json({ error: "Task not found" });
        }

        return res
          .status(200)
          .json({ message: "Removed Date Successfully.", updatedTask });
      }
      if (note === "REMOVENOTE") {
        const updatedTask = await Task.findByIdAndUpdate(
          taskId,
          { $unset: { note: true } },
          { new: true }
        );
        if (!updatedTask) {
          return res.status(404).json({ error: "Task not found" });
        }

        return res
          .status(200)
          .json({ message: "Note Cleared Successfully.", updatedTask });
      }

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { $set: newTask },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "Updated the Task Successfully.", updatedTask });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

//Route to add a Step to a Task provided id of the Task as a parameter
//POST /task/:id/step
taskRouter.post(
  "/:id/step",
  [
    body("stepTitle").exists().withMessage("Add a Step Title"),
    param("id").exists().withMessage("Missing Id Parameter"),
  ],
  // tokenAuth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const taskId = req.params.id;
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({ message: "Task not Found" });
      }

      if (task.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const step = { stepTitle: req.body.stepTitle };
      task.steps.push(step);
      await task.save();
      res.status(200).json(step);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error.", error: error });
    }
  }
);

// READ all steps of a Task
taskRouter.get("/:id/step",
//  tokenAuth, 
 async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find the Task by ID and select only the steps
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json(task.steps);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

//PUT request. To update a Step
taskRouter.put(
  "/:taskId/step/:stepId",
  [
    param("taskId").exists().withMessage("Missing taskId parameter"),
    param("stepId").exists().withMessage("Missing stepId parameter"),
  ],
  // tokenAuth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Missing Parameter.", errors: errors.array() });
    }

    const { taskId, stepId } = req.params;
    const { stepTitle, isCompleted } = req.body;

    if (!stepTitle && !isCompleted) {
      return res.status(404).json({ message: "No Things to Update" });
    }

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ error: "Not a MongoDB Id: task" });
    }

    try {
      const newTaskStep = {};

      if (stepTitle) {
        newTaskStep.stepTitle = stepTitle;
      }
      if (isCompleted) {
        newTaskStep.isCompleted = isCompleted;
      }
      const task = await Task.findById(taskId);
      const step = task.steps.id(stepId);

      if (!task) {
        return res.status(404).json({ error: "Task is not found" });
      }

      if (task.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      step.set(newTaskStep);

      await task.save();

      res
        .status(200)
        .json({
          message: "Updated the Step Successfully.",
          updatedTaskStep: newTaskStep,
        });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

// DELETE a step from a Task
taskRouter.delete("/:taskId/step/:stepId", 
// tokenAuth, 
async (req, res) => {
  try {
    const { taskId, stepId } = req.params;

    // Find the Task by ID
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const step = task.steps.id(stepId);
    if (!step) {
      return res.status(404).json({ message: "Step not found" });
    }

    task.steps.pull(step);

    await task.save();

    res.status(204).send("Step Deleted");
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports ={taskRouter} 