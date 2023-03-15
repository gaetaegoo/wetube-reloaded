import express from "express";
import {
    watch,
    getEdit,
    postEdit,
    getUpload,
    postUpload,
    deleteVideo,
} from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

// express는 '24byte hexadecimal string'의 id를 가짐
// [0-9a-f]{24}
videoRouter.get("/:id([0-9a-f]{24})", watch);

// videoRouter.get("/:id(\\d+)/edit", getEdit);
// videoRouter.post("/:id(\\d+)/edit", postEdit);
// 위 두 라인을 한 줄에 적도록 하자
videoRouter
    .route("/:id([0-9a-f]{24})/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(postEdit);

videoRouter
    .route("/:id([0-9a-f]{24})/delete")
    .all(protectorMiddleware)
    .get(deleteVideo);

// upload를 id로 인식하는 것을 방지하기 위해, 맨 위로 올려줌
videoRouter
    .route("/upload")
    .all(protectorMiddleware)
    .get(getUpload)
    .post(videoUpload.single("video"), postUpload);

export default videoRouter;
