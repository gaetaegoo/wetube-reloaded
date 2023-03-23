import mongoose from "mongoose";

// 첫 번째 방법
// import Video, { formatHashtags } from "../models/Video";
// hashtags: formatHashtags(hashtags),
// export const formatHashtags = (hashtags) =>
//     hashtags
//         .split(",")
//         .map((word) => (word.startsWith("#") ? word : `#${word}`));

// 비디오가 가진 데이타의 형식(틀) 알려주기
// Schema 대문자 주의
const videoSchema = new mongoose.Schema({
    // string 부분은 웬만하면 'trim: true' 추천
    //- form 부분과 error를 막기 위해 양쪽 동시에 max, minLength를 설정
    title: { type: String, trim: true, maxLength: 80, required: true },
    fileUrl: { type: String, require: true },
    thumbUrl: { type: String, require: true },
    description: { type: String, trim: true, minLength: 10, required: true },
    // default: Date.now에서 '()'를 하지 않는 이유: 여기서 실행시키지 않기 위해
    createdAt: { type: Date, default: Date.now, required: true },
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, default: 0, required: true },
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            required: true,
        },
    ],
    // ObjectId는 X(JS에서 제공하지 않음)
    // ref: mongoose에게 owner에 id를 저장하겠다고 알려줘야 함
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

// 두 번째 방법(추천)
videoSchema.static("formatHashtags", function (hashtags) {
    return hashtags
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

// middleware(hook): 특정 함수의 특정 기능 전에 사전 적용
// 모든 save 이벤트에 적용(중간에서 가로채서 적용 시킴)
// videoSchema.pre("save", async function () {
//     this.hashtags = this.hashtags[0]
//         .split(",")
//         .map((word) => (word.startsWith("#") ? word : `#${word}`));
// });

// mongo compass: https://ckddn9496.tistory.com/98

// model은 대문자가 아님
// mongoose는 첫 번째 인자로 컬렉션을 만듬 => Video -> videos(소문자 강제화 + s)
// => 강제로 바뀌는 게 싫다면 세 번째 인자로 컬렉션 이름 줄 수 있음
// const videoModel = mongoose.model("Video", videoSchema, "video");
const Video = mongoose.model("Video", videoSchema);

export default Video;
