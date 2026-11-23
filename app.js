require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const express = require("express");

const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const connectDB = require("./db/connect");
const app = express();

//routes import
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const productsRouter = require("./routes/products");

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(helmet());
app.use(cors());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/products", productsRouter);

app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send(`<h1>Store API</h1><a href="/api/v1/api-docs">swagger url</a>`);
});

app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
