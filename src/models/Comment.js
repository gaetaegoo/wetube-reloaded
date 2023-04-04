import mongoose from "mongoose";

/**
 * 1. 댓글에 필요한 것은 관계(작성자, 비디오 등)
 * 2. 내용이 무엇이고, 누가 적었으며, 어떤 비디오에 달렸고, 생성일은 언젠지
 * 3. 댓글은 비디오 안에 달리고, 그 말은 비디오는 많은 댓글을 가질 수 있음
 */
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    createdAt: { type: Date, default: Date.now, required: true },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
