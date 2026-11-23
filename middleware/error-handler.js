const { CustomApiError } = require("../errors/custom-error");

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log("========== XATO BOSHLANDI ==========");
  console.log(err); // to‘liq xato
  console.log("Xato xabari:", err.message);
  console.log("========== XATO TUGADI ==========");

  if (err instanceof CustomApiError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }
  return res.status(500).json({
    msg: "Something went wrong, please try again",
    error: err.message, // vaqtincha xatoni javobga ham qo‘shamiz
  });
};

module.exports = errorHandlerMiddleware;
