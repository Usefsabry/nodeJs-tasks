import { Router } from "express";

import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

import { createTaskValidations } from "../validators/taskValidations.js";

import validationResults from "../validators/validationResults.js";

import { validateMongoId } from "../validators/validateObjectId.js";

const taskRouter = Router();

taskRouter.get("/", getAllTasks);

taskRouter.get("/:id", validateMongoId("id"), validationResults, getTaskById);

taskRouter.post("/", createTaskValidations, validationResults, createTask);

taskRouter.put("/:id", validateMongoId("id"), validationResults, updateTask);

taskRouter.delete("/:id", validateMongoId("id"), validationResults, deleteTask);

export default taskRouter;
