import { param } from "express-validator";

export const validateMongoId = (paramName) => [
  param(paramName)
    .trim()
    .notEmpty()
    .withMessage("Missing params")
    .isMongoId()
    .withMessage("Invalid Id format"),
];