const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");
const User = require("../models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  });
};

const register = async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.create({ username, email, password });

  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  setRefreshCookie(res, refreshToken);

  res.status(StatusCodes.CREATED).json({
    user: { username: user.username, email: user.email, role: user.role },
    accessToken,
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError(`Please provide username and password`);
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: `Invalid Credials` });
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: `Invalid Credials` });
  }

  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  setRefreshCookie(res, refreshToken);

  res.status(StatusCodes.OK).json({
    user: { username: user.username, email: user.email, role: user.role },
    accessToken,
  });
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Refresh token not provided" });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const user = await User.findById(payload.userId).select(
      "+refreshTokenHash",
    );

    if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid refresh token" });
    }

    const newRefreshToken = user.generateRefreshToken();
    const newAccessToken = user.generateAccessToken();

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    return res.status(StatusCodes.OK).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "Invalid or expired refresh token",
    });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(`Req Cookies: ${refreshToken}`);

  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      const user = await User.findById(payload.userId).select(
        "+refreshTokenHash",
      );

      if (user && user.refreshTokenHash === hashToken(refreshToken)) {
        user.refreshTokenHash = undefined;
        await user.save();
      }
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Invalid or expired refresh token",
      });
    }
  }
  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "You are not authenticated",
    });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/auth",
  });

  return res.status(StatusCodes.OK).json({ msg: "Logged out successfully" });
};

module.exports = { register, login, refresh, logout };
