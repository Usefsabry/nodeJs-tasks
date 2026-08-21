const mongoose = require('mongoose');

// Define Task Schema with linkages to User model and Mongoose validations
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['created', 'in progress', 'done'],
        message: '{VALUE} is not a valid task status',
      },
      default: 'created',
      trim: true,
    },
    priority: {
      type: Number,
      required: [true, 'Task priority is required'],
      min: [1, 'Priority must be at least 1'],
      max: [10, 'Priority cannot exceed 10'],
      default: 5,
    },
    dueDate: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create and export Task Model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
