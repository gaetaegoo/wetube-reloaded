// require("dotenv").config();
// require 방식은 dotenv를 사용하려는 모든 파일마다 적용해야함
import "dotenv/config";
// 서버가 시작하자마자 db랑 model 받아오게 하기
import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 4000;

const handleListening = () =>
    console.log(`✅ listening on port 'http://localhost:${PORT}' 🚀`);

app.listen(PORT, handleListening);
