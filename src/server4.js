import express from "express";
import morgan from "morgan";

const PORT = 4000;
const app = express();

// Logger
const logger = morgan("dev");
app.use(logger);

// 10. Router 생성
// 11. 함수(콜백) 생성
// 12. Router.get("주소", 콜백); 생성
const globalRouter = express.Router();
const handleHome = (req, res) => res.send("Home");
globalRouter.get("/", handleHome);

const userRouter = express.Router();
const handleEditUser = (req, res) => res.send("Edit User");
userRouter.get("/edit", handleEditUser);

const videoRouter = express.Router();
const handleWatchVideo = (req, res) => res.send("Watch Video");
videoRouter.get("/watch", handleWatchVideo);

// use는 라우터에 있는 미들웨어를 전부 돈다
// get은 딱 알맞는 라우터만 미들웨어를 돈다
app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

// Listen
const handleListening = () =>
    console.log(`Server listening on port 'http://localhost:${PORT}' 🚀`);

app.listen(PORT, handleListening);
