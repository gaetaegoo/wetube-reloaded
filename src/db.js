import mongoose from "mongoose";

// strictQuery를 connect보다 위로 올려주자
mongoose.set("strictQuery", true);
// url 뒤에 db(wetube)명 적어주기
mongoose.connect(process.env.DB_URL);

const handleOpen = () => console.log("✅ Sucsess! Connected to DB 💾");
// error는 mongoose에서 받아옴
const handleError = (error) => console.log("❌ DB Error", error);

const db = mongoose.connection;
// on은 여러번 발생시킬 수 있음, once는 오로지 한 번
// db 변수명 없는 방법 => mongoose.connection.once("open", handleOpen);
db.once("open", handleOpen);
db.on("error", handleError);

// show dbs: mongodb에 존재하는 db들 보기
// use db명(wetube): 특정 db 사용하기
// show collections: 특정 db 안에 있는 object들 보기
// db.store.remove({}): db안 모든 내용 삭제
// db.store.find({}): db안 모든 내용 찾기
