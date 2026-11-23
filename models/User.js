const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: [true, `Username must be unique`],
      maxlength: 50,
      minlength: 3,
    },
    email: {
      type: String,
      required: false,
      unique: [true, `Email must be unique`],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
      role: this.role,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_LIFETIME,
    },
  );
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_LIFETIME,
    },
  );
};

UserSchema.methods.comparePassword = async function (condidatePassword) {
  const isMatch = await bcrypt.compare(condidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
