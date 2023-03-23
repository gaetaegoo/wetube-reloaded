import { registerView, createComment } from "../controllers/videoController";

/**
 * 요즘은 백엔드(서버)에서 템플릿까지 처리하지 않음
 * 보통 VanillaJS, React, svelte등을 써서 처리함
 * 하지만 우리는 이번 강의에서 백엔드를 통해 처리하는 중\
 *
 * api: 백엔드가 템플릿을 렌더링하지 않을 때,
 * 프론트와 백엔드가 통신하는 방법을 말 함
 *
 * 유저가 영상을 시청하면 백엔드에 요청을 보내고,
 * 이 요청으로는 url을 변경하지는 않을 것
 * -> 즉, 요청을 보내더라도 템플릿을 렌더링하지 않겠다
 *
 * interactivity: 상호작용성 있게 만들기, 예를들어
 * 댓글을 달아도 웹페이지의 url의 주소가 바뀌지 않음
 */

import express from "express";

const apiRouter = express.Router();

// form을 사용하지 않고 만든 첫 번째 post 요청
apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);

export default apiRouter;
