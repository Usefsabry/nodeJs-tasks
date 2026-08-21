import User from "../models/user.js";
import HTTPError from "../util/HttpError.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const newUser = await User.create({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userById = await User.findById(id);

    if (!userById) {
      return next(new HTTPError(404, "User not found"));
    }

    return res.status(200).json(userById);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { name, email, password, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return next(new HTTPError(404, "User not found"));
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password || user.password;
    user.role = role || user.role;

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new HTTPError(404, "User not found"));
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
