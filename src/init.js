import "regenerator-runtime";
// require("dotenv").config();
// require 방식은 dotenv를 사용하려는 모든 파일마다 적용해야함
// .env: 환경변수 설정하는 import
import "dotenv/config";

// 서버가 시작하자마자 db랑 model 받아오게 하기
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = process.env.PORT || 4000;

const handleListening = () =>
    console.log(`✅ listening on port 'http://localhost:${PORT}' 🚀`);

app.listen(PORT, "0.0.0.0", handleListening);
