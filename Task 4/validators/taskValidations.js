import { body } from "express-validator";

export const createTaskValidations = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 to 100 characters"),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Description must be a string"),

  body("status")
    .optional()
    .isIn(["created", "in progress", "done"])
    .withMessage("Invalid status"),

  body("priority")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Priority must be between 1 and 10"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid due date"),

  body("assignedTo")
    .notEmpty()
    .withMessage("Assigned user is required")
    .isMongoId()
    .withMessage("Invalid user ID"),

  body("collaborators")
    .optional()
    .isArray()
    .withMessage("Collaborators must be an array"),

  body("collaborators.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid collaborator ID"),
];