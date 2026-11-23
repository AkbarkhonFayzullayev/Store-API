const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");
const { createCustomError } = require("../errors/custom-error");
const User = require("../models/User");

const userChangePassword = async (req, res) => {
  const { currentPassword, newPassword, newPassword2 } = req.body;
  if (!currentPassword || !newPassword || !newPassword2) {
    throw new BadRequestError("Please provide all password fields");
  }

  if (newPassword !== newPassword2) {
    throw createCustomError("Passwords don't match", StatusCodes.BAD_REQUEST);
  }

  const userId = req.user.userId;
  const user = await User.findById(userId);

  if (!user) {
    throw createCustomError("User not found", StatusCodes.NOT_FOUND);
  }
  const isPAsswordCorrect = await user.comparePassword(currentPassword);
  if (!isPAsswordCorrect) {
    throw new BadRequestError("Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password is updated successfully" });
};

const userChangeUsername = async (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    throw new BadRequestError("Please provide Username field");
  }

  const userId = req.user.userId;

  const user = await User.findById(userId);

  if (!user) {
    throw createCustomError("User not found", StatusCodes.NOT_FOUND);
  }

  user.username = username.trim();

  await user.save();

  res.status(StatusCodes.OK).json({
    msg: "Username Changed Successfully",
    user,
  });
};

const userList = async (req, res) => {
  const users = await User.find({}).select("-password");
  if (users.length === 0) {
    return res.status(StatusCodes.OK).json({
      msg: "There is no User in database",
      nbHits: 0,
      users: [],
    });
  }

  res.status(StatusCodes.OK).json({ nbHits: users.length, users });
};

module.exports = { userChangePassword, userChangeUsername, userList };
