const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("1. Authorization header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("2. Token yo'q yoki Bearer bilan boshlanmagan");
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication invalid" });
  }

  const token = authHeader.split(" ")[1];
  console.log("3. Token:", token);

  try {
    const payload = jwt.verify(token, process.env.ACCESS_SECRET);
    console.log("4. Payload muvaffaqiyatli:", payload);
    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication invalid" });
  }
};

module.exports = authenticateUser;
