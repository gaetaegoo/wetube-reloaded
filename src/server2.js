// 0. express import
// === const express = require("express");
import express from "express";

// 3. PORT 변수명 작성
// 백엔드에선 4000 쓰는 게 국룰
const PORT = 4000;

// 1. 서버(application) 만들기(24시간 내내 온라인에 연결된 컴퓨터)
// 서버는 request를 항상 listening하고 그에 답함
const app = express();

// 5. middleware(logger) 알아보기
// 요청된(get) 다음 콜백함수로 넘어감
// 모든 controller는 middleware가 될 수 있음
// req.path === req.url
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
};

// 7. privateMiddleware
// /protected에 접근하려면 중간에서 차단
const privateMiddleware = (req, res, next) => {
    const path = req.path;
    if (path === "/protected") {
        return res.send("<h1>Not Allowed.</h1>");
    }
    console.log("Allowed, you may continue.");
    next();
};

// 4. 샌드위치(중간) 부분 만들기
// express(); 하위에 작성할 것, 본격적인 코드 작성

// vanillaJS에서 addEventListener("동작", 함수명);과 비슷함
// 우리가 get을 request 하는 것이 아니라, 브라우저가 하는 것

// 함수 부분 '()': 첫 번째 - request object / 두 번째 - response object

// handleHome으로 get request가 오면, express는 handleHome에다가 request와 response object를 넣어줌
// handleHome({...}, {...});

// const handleHome = (req, res) => console.log("Somebody is trying to go home.");
const handleHome = (req, res) => {
    // 브라우저가 요청하면 우린 응답해야 함 / res.end(); -> request 종료
    // return res.send("I love you!");
    return res.send("I love middleware.");
};

// 8. /protected에 접근한다면 띄우는 메세지
const handleProtected = (req, res) => {
    return res.send("Welcome to the private lounge.");
};

// 6. app.use는 global middleware를 만들어 줌(어느 url이나 작동)
// 대신 종료콜백보다 위에 올려 둘 것
app.use(logger);
app.use(privateMiddleware);

app.get("/", handleHome);
app.get("/protected", handleProtected);

// function handleListening(){return console.log(`Server listening on port 'http://localhost:${PORT}' 🚀`);}
const handleListening = () =>
    console.log(`Server listening on port 'http://localhost:${PORT}' 🚀`);

// 2. app.listen() 서버 실행하기
// callback: 서버가 시작될 때 작동하는 함수
// 서버에게 어떤 port(문, 창문)를 listening할 지 말해줘야 함
// port넘버와 callback(이름)을 써주기
// 브라우저에 'localhost:4000'을 입력하면 서버가 생성돼 있음
app.listen(PORT, handleListening);
