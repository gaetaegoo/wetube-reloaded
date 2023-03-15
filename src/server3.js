import express from "express";
// 9. morgan import
// Node.js용 request logger middleware
import morgan from "morgan";

const PORT = 4000;
const app = express();

// 9. morgan 변수화
const loggerMiddleware = morgan("dev");

const logger = (req, res, next) => {
    console.log(`'METHOD: ${req.method}', 'URL: ${req.url}'`);
    next();
};

const handleHome = (req, res) => {
    console.log("I will respond.");
    return res.send("I love middleware.");
};

app.use(loggerMiddleware);
app.use(logger);
app.get("/", handleHome);

const handleListening = () =>
    console.log(`Server listening on port 'http://localhost:${PORT}' 🚀`);

app.listen(PORT, handleListening);
