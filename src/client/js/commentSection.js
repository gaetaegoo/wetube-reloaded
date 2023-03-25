const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const deleteCommentBtn = document.querySelectorAll("#deleteCommentBtn");

// pug와 똑같이 만드는 fake comment
const addComment = (text, commentId) => {
    // 기존 댓글 + 신규 댓글(아이콘까지)
    const videoComments = document.querySelector(".video__comments ul");

    const newComment = document.createElement("li");
    // backend의 json이 넘겨준 새로운 댓글 id를 여기에 써주자
    // newComment.dataset.commentId = commentId;
    newComment.className = "video__comment";

    const icon = document.createElement("i");
    icon.className = "fas fa-comment";

    const span = document.createElement("span");
    span.innerText = ` ${text}`;

    // 이 부분은 항상 보여줘도 됨 -> 내가 이 댓글의 작성자이기 때문
    const span2 = document.createElement("span");
    span2.innerText = "❌";
    span2.dataset.id = commentId;
    span2.dataset.videoId = videoContainer.dataset.id;

    console.log("comment new: ", span2.dataset.id);
    console.log("video new: ", span2.dataset.videoId);

    span2.id = "newDeleteCommentBtn";
    span2.className = "video__comment-delete";

    // appendChild: element를 다른 것 안에 넣는 방법(요소를 맨 뒤에 추가함)
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);

    // prepend: appendChild와 다르게 element 요소를 맨 위에 추가함
    videoComments.prepend(newComment);

    const newDeleteCommentBtn = document.querySelector("#newDeleteCommentBtn");
    newDeleteCommentBtn.addEventListener("click", handleClickDelete);
};

/**
 * 1. 백엔드에 요청(req)을 보냄
 * 2. 누가 req를 보내는지 session에서 확인
 */
const handleSubmit = async (event) => {
    // submit으로 form이 제출되면서 새로고침 되는 것을 막기 위해 사용
    event.preventDefault();

    // value는 getter이자 setter
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;

    // 아무 것도 입력하지 않거나 space만 입력 했을 땐, req 보내지 않기
    if (text === "" || text.trim() === "") {
        return;
    }

    // fetch(url, data): JS를 통해서 req를 보낼 수 있게 함
    // back-end에 text(댓글 내용)를 보내야 함
    // promise를 return 하기에 시간이 걸림 -> await 필요
    /**
     * 1. fetch안에는 status가 존재(console로 response를 찍어 봤을 때)
     * 2. status가 201이라면 -> 가짜 댓글 생성(html에서 만들어 주기)
     */
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        /**
         * 1. req에 대한 정보를 담고 있는 부분
         * 2. json middleware에 의해서 처리되라고 말해주는 부분
         *
         * "json아 string은 맞긴 한데, 사실은 json string이다잉~?,
         * 그니까 다시 json으로 돌려줘야해~!"
         */
        headers: {
            "Content-Type": "application/json",
        },
        /**
         * 1. front에서 데이터를 받아서 string으로 바꾸고(stringify)
         * 2. back-end에서 string으로 된 데이터를 받아서 JS object로 바꿈(parse)
         */
        body: JSON.stringify({ text }),
    });

    /**
     * 콘솔로 res를 찍어 보면 network상에서 백엔드가 보낸 newCommentId가 보임
     * 그 id를 활용하기 위해 res안의 body를 활용해야 함(백엔드 - res.json([body]))
     */
    if (response.status === 201) {
        textarea.value = "";
        const { newCommentId } = await response.json();
        addComment(text, newCommentId);
    }

    // 새로고침(댓글창 실시간을 위해)
    // window.location.reload();
};

const handleClickDelete = async (event) => {
    const videoId = videoContainer.dataset.id;
    const { id } = event.target.dataset;

    console.log("comment old: ", id);
    console.log("video old: ", videoId);

    const response = await fetch(
        `/api/videos/${videoId}/comments/${id}/delete`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoId, id }),
        }
    );
    if (response.status === 200) {
        event.target.parentNode.remove();
    }
};

// btn의 click으로 감지하는 것이 아님
form.addEventListener("submit", handleSubmit);

if (deleteCommentBtn)
    deleteCommentBtn.forEach((btn) =>
        btn.addEventListener("click", handleClickDelete)
    );
