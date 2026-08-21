import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["created", "in progress", "done"],
      default: "created",
    },

    priority: {
      type: Number,
      min: [1, "Priority must be at least 1"],
      max: [10, "Priority must not exceed 10"],
      default: 1,
    },

    dueDate: {
      type: Date,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned user is required"],
    },

    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("Task", taskSchema);