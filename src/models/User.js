import bcrypt from "bcrypt";
import mongoose from "mongoose";

// userSchema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String },
    socialOnly: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    // name: { type: String, required: true },
    location: { type: String },
    // object가 아닌 array(많은 비디오를 담을 수 있음)
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            // required: true,
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            // required: true,
        },
    ],
});

// password hashing
// 반복적으로 비밀번호가 hash 되는 것은 좋지 않음(hash가 hash 되기 때문)
userSchema.pre("save", async function () {
    // isModified: property가 하나라도 수정되면 true, 그게 아니면 false
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);
    }
});

const User = mongoose.model("User", userSchema);

export default User;
