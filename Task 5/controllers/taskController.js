const Task = require('../models/taskModel');
const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

/**
 * 1. Get all tasks
 * Admin sees all tasks. Regular users see only tasks assigned to them or where they collaborate.
 */
const getAllTasks = asyncHandler(async (req, res, next) => {
  let query = {};

  // If user is not an admin, filter tasks by assignment or collaboration
  if (req.user && req.user.role !== 'admin') {
    query = {
      $or: [
        { assignedTo: req.user._id },
        { collaborators: req.user._id },
      ],
    };
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email role')
    .populate('collaborators', 'name email role');

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

/**
 * 2. Get task by ID
 * Admin can view any task. Regular user can view if assigned to it or collaborating on it.
 */
const getTaskById = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email role')
    .populate('collaborators', 'name email role');

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  // Authorization check for non-admin users
  if (req.user && req.user.role !== 'admin') {
    const isAssigned =
      task.assignedTo &&
      task.assignedTo._id.toString() === req.user._id.toString();
    const isCollaborator =
      task.collaborators &&
      task.collaborators.some(
        (c) => c._id.toString() === req.user._id.toString()
      );

    if (!isAssigned && !isCollaborator) {
      return next(
        new AppError('You do not have permission to access this task', 403)
      );
    }
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

/**
 * 3. Create a new task
 * Authenticated users can create tasks. If assignedTo is not specified, defaults to creator.
 */
const createTask = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    assignedTo,
    collaborators,
  } = req.body;

  // Determine assigned user (defaults to authenticated user if not provided)
  const targetAssignedTo = assignedTo || req.user._id;

  // Verify assignedTo user exists
  const userExists = await User.findById(targetAssignedTo);
  if (!userExists) {
    return next(
      new AppError(`Assigned user (ID: ${targetAssignedTo}) does not exist`, 404)
    );
  }

  // Verify all collaborators exist if provided
  if (collaborators && collaborators.length > 0) {
    const existingCollaboratorsCount = await User.countDocuments({
      _id: { $in: collaborators },
    });
    if (existingCollaboratorsCount !== collaborators.length) {
      return next(
        new AppError('One or more collaborator users do not exist', 404)
      );
    }
  }

  const newTask = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    assignedTo: targetAssignedTo,
    collaborators: collaborators || [],
  });

  const populatedTask = await Task.findById(newTask._id)
    .populate('assignedTo', 'name email role')
    .populate('collaborators', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: populatedTask,
  });
});

/**
 * 4. Update task by ID
 * Admin & assigned user can update all fields. Collaborators can update status/description/priority/dueDate.
 */
const updateTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const isAdmin = req.user && req.user.role === 'admin';
  const isAssigned =
    task.assignedTo &&
    task.assignedTo.toString() === req.user._id.toString();
  const isCollaborator =
    task.collaborators &&
    task.collaborators.some((c) => c.toString() === req.user._id.toString());

  // Check overall permission
  if (!isAdmin && !isAssigned && !isCollaborator) {
    return next(
      new AppError('You do not have permission to modify this task', 403)
    );
  }

  // If user is only a collaborator, prevent modifying assignedTo and collaborators
  if (!isAdmin && !isAssigned && isCollaborator) {
    if (req.body.assignedTo !== undefined || req.body.collaborators !== undefined) {
      return next(
        new AppError(
          'Collaborators are not authorized to reassign the task or modify collaborators',
          403
        )
      );
    }
  }

  const { assignedTo, collaborators } = req.body;

  // Verify assignedTo user exists if provided
  if (assignedTo) {
    const userExists = await User.findById(assignedTo);
    if (!userExists) {
      return next(
        new AppError(`Assigned user (ID: ${assignedTo}) does not exist`, 404)
      );
    }
  }

  // Verify collaborators exist if provided
  if (collaborators && collaborators.length > 0) {
    const existingCollaboratorsCount = await User.countDocuments({
      _id: { $in: collaborators },
    });
    if (existingCollaboratorsCount !== collaborators.length) {
      return next(
        new AppError('One or more collaborator users do not exist', 404)
      );
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('assignedTo', 'name email role')
    .populate('collaborators', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: updatedTask,
  });
});

/**
 * 5. Delete task by ID
 * Admin or assigned user can delete the task.
 */
const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const isAdmin = req.user && req.user.role === 'admin';
  const isAssigned =
    task.assignedTo &&
    task.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isAssigned) {
    return next(
      new AppError('You do not have permission to delete this task', 403)
    );
  }

  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

/**
 * 6. Assign task to another user
 * PATCH /api/tasks/:id/assign
 * Only admin or current assigned user can reassign
 */
const assignTask = asyncHandler(async (req, res, next) => {
  const { assignedTo } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const isAdmin = req.user && req.user.role === 'admin';
  const isAssigned =
    task.assignedTo &&
    task.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isAssigned) {
    return next(
      new AppError('Only the task owner or an admin can assign this task', 403)
    );
  }

  const targetUser = await User.findById(assignedTo);
  if (!targetUser) {
    return next(
      new AppError(`Assigned user (ID: ${assignedTo}) does not exist`, 404)
    );
  }

  task.assignedTo = assignedTo;
  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('collaborators', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Task assigned successfully',
    data: updatedTask,
  });
});

/**
 * 7. Add collaborators to task
 * PATCH /api/tasks/:id/collaborators
 * Only admin or current assigned user can add collaborators
 */
const addCollaborators = asyncHandler(async (req, res, next) => {
  const { collaborators } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const isAdmin = req.user && req.user.role === 'admin';
  const isAssigned =
    task.assignedTo &&
    task.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isAssigned) {
    return next(
      new AppError('Only the task owner or an admin can add collaborators', 403)
    );
  }

  // Verify collaborators exist
  const existingCollaboratorsCount = await User.countDocuments({
    _id: { $in: collaborators },
  });
  if (existingCollaboratorsCount !== collaborators.length) {
    return next(
      new AppError('One or more collaborator users do not exist', 404)
    );
  }

  // Add unique collaborators
  const existingCollabStrings = task.collaborators.map((c) => c.toString());
  collaborators.forEach((collabId) => {
    if (!existingCollabStrings.includes(collabId.toString())) {
      task.collaborators.push(collabId);
    }
  });

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('collaborators', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Collaborators added successfully',
    data: updatedTask,
  });
});

/**
 * 8. Remove collaborator from task
 * DELETE /api/tasks/:id/collaborators/:userId
 * Admin, assigned user, or the collaborator themselves can remove
 */
const removeCollaborator = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const isAdmin = req.user && req.user.role === 'admin';
  const isAssigned =
    task.assignedTo &&
    task.assignedTo.toString() === req.user._id.toString();
  const isSelf = userId === req.user._id.toString();

  if (!isAdmin && !isAssigned && !isSelf) {
    return next(
      new AppError(
        'You do not have permission to remove this collaborator',
        403
      )
    );
  }

  task.collaborators = task.collaborators.filter(
    (c) => c.toString() !== userId
  );

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('collaborators', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Collaborator removed successfully',
    data: updatedTask,
  });
});

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  addCollaborators,
  removeCollaborator,
};
