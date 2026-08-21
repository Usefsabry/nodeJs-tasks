import express from "express";

import userRouter from "./Routes/userRoutes.js";
import taskRouter from "./Routes/taskRouters.js";

import globalErrorHandling from "./middlewares/globalErrorHandling.js";

const app = express();

app.use(express.json());

app.use("/users", userRouter);

app.use("/tasks", taskRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Server is running",
    status: "OK",
  });
});

app.use(globalErrorHandling);

export default app;