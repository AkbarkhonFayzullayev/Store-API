const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Successfully connected to MongoDB!");

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected!");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected!");
  });

  mongoose.connection.on("error", (err) => {
    console.log("MongoDB error:", err);
  });
};

module.exports = connectDB;
