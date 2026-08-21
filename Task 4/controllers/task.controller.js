import Task from "../models/task.js";
import HTTPError from "../util/HttpError.js";

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email role")
      .populate("collaborators", "name email role");

    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      collaborators,
    } = req.body;

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      collaborators,
    });

    return res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const taskById = await Task.findById(id)
      .populate("assignedTo", "name email role")
      .populate("collaborators", "name email role");

    if (!taskById) {
      return next(new HTTPError(404, "Task not found"));
    }

    return res.status(200).json(taskById);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      collaborators,
    } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return next(new HTTPError(404, "Task not found"));
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;
    task.collaborators = collaborators || task.collaborators;

    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return next(new HTTPError(404, "Task not found"));
    }

    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};
