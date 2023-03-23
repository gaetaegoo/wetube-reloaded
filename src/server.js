// database나 models같은 것들은 init.js로 옮김
import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "express-flash";

import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

// express
const app = express();

// Logger(morgan)
const logger = morgan("dev");
app.use(logger);

// HTML -> javascript object
// req.body로부터 오는 data를 이해할 수 있게 도움
app.use(express.urlencoded({ extended: true }));
// json도 body로부터 받아오자
app.use(express.json());

// View(pug)
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

// session(before Routers)
app.use(
    session({
        store: MongoStore.create({
            mongoUrl: process.env.DB_URL,
        }),
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        // cookie: {
        //     maxAge: 20000,
        // },
    })
);

// app.use((req, res, next) => {
//     console.log(req.headers);
//     next();
// });

// List of users that the backend remembers.
// app.use((req, res, next) => {
//     // global argument => all template
//     res.locals.sexy = "you";
//     res.locals.siteName = "xxxxxx";
//     // locals: [Object: null prototype] {},
//     // console.log(res);
//     req.sessionStore.all((error, sessions) => {
//         console.log(sessions);
//         next();
//     });
// });

// URL to verify the session ID.
// app.get("/add-one", (req, res, next) => {
//     req.session.potato += 1;
//     return res.send(`${req.session.id}\n${req.session.potato}`);
// });

// Middleware
app.use(localsMiddleware);

// express-flash
app.use(flash());

// Uncaught (in promise) ReferenceError: SharedArrayBuffer is not defined
app.use((req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
});

// Router
app.use("/", rootRouter);
// static: express한테 안의 내용물을 볼 수 있게 해달라고 부탁
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
