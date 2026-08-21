import { Router } from "express";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { createUserValidations } from "../validators/userValidations.js";

import validationResults from "../validators/validationResults.js";

import { validateMongoId } from "../validators/validateObjectId.js";

const userRouter = Router();

userRouter.get("/", getAllUsers);

userRouter.post("/", createUserValidations, validationResults, createUser);

userRouter.get("/:id", validateMongoId("id"), validationResults, getUserById);

userRouter.put("/:id", validateMongoId("id"), validationResults, updateUser);

userRouter.delete("/:id", validateMongoId("id"), validationResults, deleteUser);

export default userRouter;
