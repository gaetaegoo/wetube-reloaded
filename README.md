# Wetube Reloaded

<!-- global router -->

/ -> Home
/join -> Join
/login -> Login
/search -> Search

<!-- user router -->

<!-- /edit-user -> Edit User (X)
/users/edit -> Edit User (O) -->

<!-- /delete-user -> Delete User (X)
/users/delete -> Delete User (O) -->

/users/:id -> See User
/users/logout -> Log Out
/users/edit -> Edit My Profile
/users/delete -> Delete My Profile

<!-- video router -->

<!-- /watch-video -> Watch Video (X)
/videos/watch -> Watch Video (O) -->

<!-- /edit-video -> Edit Video (X)
/videos/edit -> Edit Video (O) -->

<!-- /delete-video -> Delete Video (X)
/videos/delete -> Delete Video (O) -->

/videos/:id -> See Video
videos/:id/edit -> Edit Video
/videos/:id/delete -> Delete Video
/videos/upload -> Upload Video

# Project Flow

<!-- SET UP -->

1. express import

    ```javascript
    // === const express = require("express");
    import express from "express";
    ```

2. PORT 변수명 작성 및 express 활성화

    ```javascript
    // 백엔드 4000번 국룰
    const PORT = 4000;
    const app = express();
    ```

3. app.listen으로 서버 주시

    ```javascript
    const handleListening = () =>
        console.log(`Server listening on port 'http://localhost:${PORT}' 🚀`);

    app.listen(PORT, handleListening);
    ```

4. morgan import(Node.js용 request logger middleware)

    ```javascript
    // Node.js용 request logger middleware
    import morgan from "morgan";
    const logger = morgan("dev");
    app.use(logger);
    ```

<!-- ROUTERS -->

5. Router 생성

    ```javascript
    const routerName = express.Router();
    ```

6. 함수(콜백) 생성

    ```javascript
    const funcName = (req, res) => res.send("text");
    ```

7. Router.get("주소", 함수(콜백)); 생성

    ```javascript
    routerName.get("/", funcName);
    ```

8. 5~7 과정 한 눈에 보기

    ```javascript
    const globalRouter = express.Router();
    const handleHome = (req, res) => res.send("Home");
    globalRouter.get("/", handleHome);
    ```

9. 기능별로 폴더를 나누어 구성(클린코드)

    1. router를 위한 폴더
    2. controller를 위한 폴더
        1. 각 라우터에 있는 함수(컨트롤러)들을 controller 폴더로 이동

10. 분리된 라우터를 (있던 곳에서)export 하고 (사용하려는 곳에서)import 해주기

    ```javascript
    // 있던 곳에서 export(default는 한 가지만 export 가능)
    export default globalRouter;

    // 사용하려는 곳에서 import(default로 가져와서 이름 변경 가능)
    import globalRouter from "./routers/globalRouter";
    ```

11. 각각의 컨트롤러마다 일일이 export 해주기, 그리고 import 하는 부분은 '{오브젝트}'로 묶기

    ```javascript
    // default로 묶지 말고
    import join from "../controllers/userController";
    // '{오브젝트}'로 묶자(오브젝트로 묶으면 이름 변경 불가능)
    import { join } from "../controllers/userController";
    ```

12. Planning Routes: 직접 유저의 입장이 되어서, 체계화 된 URL 정리

    1.  - ':id' url안에 변수를 포함시킬 수 있게 해줌(parameter), 콜론(:)이 반드시 필요

        - 매번 일일이 라우터를 하나하나 만들 수 없기 때문에 써야함

        - console.log(req,params);로 찍어 보면 -> { id: '1234567' } 이런 식으로 나옴

        ```javascript
        export const see = (req, res) => {
            return res.send(`Watch Video #${req.params.id}`);
        };
        ```

        - (※중요) :id는 :id가 없는 주소보다 무조건 아래에 위치해야 함
          -> express가 그냥 주소인데 :id로 인식을 해버림
          -> 하지만 정규식을 썼다면 순서는 상관이 없어짐

    2. 근데 우리는 id를 숫자만 받아야 함 But! string이 들어온다면? -> 정규식 필요(regular expression) -> 정규식은 문자열로부터 특정 정보를 추출해내는 방법
        - ?: ab ? cd -> 'b'는 쓰든 말든 상관 없음(옵션)
        - ()?: ab(cd)?e -> 'cd'는 쓰든 말든 상관 없음(그룹화된 옵션)
        - +: ab + cd -> 'b'만 있다면 한 개 이든 엄청나게 많든 적든 상관 없음
        - \*: ab \* cd -> 사이에 뭐가 들어오든 'cd'만 있으면 됨
        - (※중요) (\\d+) 옵션으로 숫자만 받아오자, d는 digit(숫자)

<!-- TEMPLATES -->

13. Pug - HTML return, 고성능 템플릿 엔진

    -   npm i pug
    -   express에게 html 헬퍼로 pug를 쓰겠다고 말하기
    -   sever.js -> app.set("view engine", "pug");
    -   src/views/home.pug 생성

    ```javascript
    // res.render("home", {pageTitle:"Home"});
    // render는 두 가지 변수를 받음, ("viewName", 템플릿에 보낼 변수들...);
    export const trending = (req, res) => res.render("home");
    ```

    -   따로 export 하거나 import 할 필요가 없음
    -   express는 기본적으로 프로젝트 폴더 안의 views를 찾음(process.cwd();)
        -> 따라서 /wetube/src/views, 'src' 경로 설정 필요
    -   (※중요) 'package.json'이 바로 서버가 시작하는 위치

14. Failed to lookup view "home" in views directory "/home/gaetaegoo/wetube/views" 에러 해결 방법

    -   구린 방법: view 디렉토리를 src 밖으로 빼낸다

    ```javascript
    app.set("views", process.cwd() + "/src/views");
    ```

15. pug 템플릿에 JS 넣기

```pug
//- #{}
footer &copy; #{new Date().getFullYear()} Wetube
```

16. 하나의 footer만 가지게 하려면?

    -   모든 페이지에 일일이 footer를 수정하는 것은 힘들기 때문에, 하나의 footer만 수정해도 나머지 전체가 수정되게 하려면?

    -   /src/views/partials/footer.pug -> partials 디렉토리를 만들고

```pug
//- footer가 필요한 부분에 include 해주기
include partials/footer.pug
```

17. footer 빼고 계속 같은 html코드(레이아웃의 베이스)가 반복되는 데 어떻게 할까?

    -   base.pug를 만들고 base가 될 html코드를 작성

    -   각 pug 파일들마다 'extends base.pug'라고 적기만 하면 끝

    -   하지만 각 페이지마다 너무 똑같이 보이기 때문에 결국 base는 노쓸모

18. block: 템플릿의 창문,

-   2. base.pug에서 pageTitle에 관한 정보를 받아서 출력해서, 각 페이지에 뿌려줌

```pug
head
    //- block head
    title #{pageTitle} | Wetube
body
    block content
```

-   1. 컨트롤러에서 pageTitle에 관한 정보(Home)를 base.pug에 넘겨주면

```javascript
export const trending = (req, res) => res.render("home", { pageTitle: "Home" });
```

19. MVP.css

    -   html을 최소한으로 예쁘게 꾸미기
    -   https://andybrewer.github.io/mvp/

20. template에서 conditionals(if, else if, else...)쓰기
    -   https://pugjs.org/language/conditionals.html

```javascript
// 가짜 유저를 만든 다음, trending에 추가
const fakeUser = {
    username: "gaetaegoo",
    loggedIn: true,
};

export const trending = (req, res) =>
    res.render("home", { pageTitle: "Home", fakeUser: fakeUser });
```

```pug
//- 가짜 유저가 로그인 했다면 로그아웃 링크, 로그인 안 했다면 로그인 링크
if fakeUser.loggedIn
    li
        a(href="/login") Logout
else
     li
        a(href="/login") Login
```

21. template에서 iteration(반복) 쓰기

```javascript
export const trending = (req, res) => {
    // (중요)array 생성하여 home으로 보내기
    const videos = [];
    res.render("home", { pageTitle: "Home", videos });
};
```

```pug
ul
    //- home에서 받아서 각 리스트로 뿌려주기
    //- video 부분의 이름은 상관없지만, videos 부분은 controller 부분과 맞춰주기
    //- index나 key로도 뿌릴 수 있다
    each video in videos
        //- le #{video}
        //- 객체를 받을 수도 있다
        li=video.title
    else
        //- pug는 자동적으로 array안의 내용물을 찾는다
        li Sorry nothing found.
```

22. mixin: partial이긴 한데 데이터를 받을 수 있는 partial(똑똑함)

```pug
each video in videos
    div
        h4=video.title
        ul
            li #{video.rating}/5.
            li #{video.comments} comments.
            li Posted #{video.createdAt}.
            li #{video.views} views.
else
    li Sorry nothing found.
```

-   views/mixins/video.pug 만든 후 ->

```pug
mixin video(videoInfo)
    div
        h4=videoInfo.title
        ul
            li #{videoInfo.rating}/5.
            li #{videoInfo.comments} comments.
            li Posted #{videoInfo.createdAt}.
            li #{videoInfo.views} views.
```

-   home.pug에서 include 해주기

```pug
extends base.pug
//- include
include mixins/video.pug

block content
    h2 Welcome here you will see the trending videos.
    each videoInfo in videos
        //- '+'로 mixin 추가
        +video(videoInfo)
    else
        li Sorry nothing found.
```

<!-- DATABASE -->

23. video.pug의 mixin video(videoInfo)에서 링크 달아주기

```pug
//- a(href="/videos/" + videoInfo.id)=videoInfo.title
a(href=`/videos/${videoInfo.id}`)=videoInfo.title
```

24. videoController에서 각 컨트롤러 부분 함수 완성

```javascript
export const see = (req, res) => {
    // const id = req.params.id;
    const { id } = req.params;
    const video = videos[id - 1];
    return res.render("watch", {
        pageTitle: `Watching: ${video.title}`,
        video,
    });
};
```

25. ternary operator(watch.pug)

```pug
//- {변수 === 조건 ? "참" : "거짓"}
#{video.views === 1 ? "view" : "views"}
```

26. '/' 유무에 따른 경로 차이

    -   http://localhost:4000/ -> root 경로

    -   /edit -> http://localhost:4000/edit -> root 경로에 바로 붙음
    -   edit -> http://localhost:4000/videos/edit -> relative url

27. (※※※중요)우리가 가진 data를 어떻게 backend로 보낼 것이냐?

-   예를들어 edit.pug에서 edit from을 만든다고 할 때,
    action을 통해서 url을 보낼건데 이미 같은 url이므로,
    action을 지워주고 method="post"로 보낼 것임

```pug
//- form(action="")
form(method="POST")
    input(name="title", placeholder="Video Title", value=video.title, required)
    input(type="submit", value="Save")
```

-   서버에게 post를 이해시키기 위해서 controller에서 펑션 만들고, router에서 router 추가

```javascript
export const postEdit = (req, res) => {
    const { id } = req.params;
    // redirect로 edit을 마쳤으면 다시 watch 페이지로 이동
    return res.redirect(`/videos/${id}`);
};
```

-   그렇다면 form에서 작성된(수정된) 정보는 또 어떻게 가져올 것이냐?
-   일단 express에게 from을 처리하고 싶다고 말해야 함
-   extended 옵션이 from의 데이타를 JS object형식으로 반환해 줌

```javascript
// server.js
app.use(express.urlencoded({ extended: true }));
```

-   videoController.js에서

```javascript
export const postEdit = (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    // 가짜 DB를 위한 title 교체 방법
    // videos[id - 1].title = title;
    return res.redirect(`/videos/${id}`);
};
```

28. (※중요)GET과 POST의 차이점?

    -   기본적으로 form은 GET 방식
    -   GET은 url 그 자체로서 (data를 가지고) 가져옴 or 받아옴(예를들면 검색)

    -   POST는 파일을 보내거나, DB에 있는 값을 바꾸는 뭔가를 보낼 때 사용(로그인 등)
    -   POST는 req.body를 사용함

```javascript
// videoRouter.get("/:id(\\d+)/edit", getEdit);
// videoRouter.post("/:id(\\d+)/edit", postEdit);
// 위 두 라인을 한 줄에 적도록 하자
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);
```

29. upload 부분 만들기

-   (※※중요)input에 name속성이 없으면 console.log(req.body)가 텅 빈 객체만 보여줌
-   새로운 newVideo{}를 만들어주고, videos.push(newVideo);

```javascript
export const postUpload = (req, res) => {
    const { title } = req.body;
    const newVideo = {
        // title: req.body.title,
        title,
        rating: 0,
        comments: 0,
        createdAt: "just now",
        views: 0,
        id: videos.length + 1,
    };
    videos.push(newVideo);
    return res.redirect("/");
};
```

30. mongoDB

-   일반적인 DB는 행 기반(sql)의 형식이지만(like 엑셀 시트),
-   mongoDB는 document-based(문서)의 DB로써 objects형식(like JSON)

-   mongodb로 db를 켜고, mongosh로 실행

31. mongoose

-   node.js와 mongoDB와 상호작용하기 위해서 사용

-   'npm i mongoose'로 설치

-   db.js 파일 생성

```javascript
import mongoose from "mongoose";

// strictQuery를 connect보다 위로 올려주자
mongoose.set("strictQuery", true);
// url 뒤에 db(wetube)명 적어주기
mongoose.connect("mongodb://127.0.0.1:27017/wetube");

const handleOpen = () => console.log("✅ Connected to DB");
// error는 mongoose에서 받아옴
const handleError = (error) => console.log("DB Error", error);

const db = mongoose.connection;
// on은 여러번 발생시킬 수 있음, once는 오로지 한 번
// db 변수명 없는 방법 => mongoose.connection.once("open", handleOpen);
db.once("open", handleOpen);
db.on("error", handleError);
```

-   sever.js에 import 해주기

```javascript
import "./db";
```

<!-- CRUD(Create(생성), Read(읽기), Update(수정), Delete(삭제)) -->

32. data모델의 파일들은 대게 대문자로 시작

-   models -> Video.js

33. mongoose에게 애플리케이션의 데이터들이 어떻게 생겼는지 알려주기

```javascript
import mongoose from "mongoose";

// 비디오가 가진 데이타의 형식(틀) 알려주기
// Schema 대문자 주의
const videoSchema = new mongoose.Schema({
    // title: { type: String }
    title: String,
    description: String,
    createdAt: Date,
    hashtags: [{ type: String }],
    meta: {
        views: Number,
        rating: Number,
    },
});

// model은 대문자가 아님
// mongoose는 첫 번째 인자로 컬렉션을 만듬 => Video -> videos(소문자 강제화 + s)
// => 강제로 바뀌는 게 싫다면 세 번째 인자로 컬렉션 이름 줄 수 있음
// const videoModel = mongoose.model("Video", videoSchema, "video");
const videoModel = mongoose.model("Video", videoSchema);

export default videoModel;
```

-   server.js 에서 import 하기

```javascript
import videoModel from "./models/Video";
```

34. init.js 생성

-   database나 model같은 것들을 sever.js에서 빼오자

-   nodemon 작동 불가 -> package.json 수정

```javascript
// 서버가 시작하자마자 db랑 model 받아오게 하기
import "./db";
import "./models/Video";
import app from "./server";

const PORT = 4000;

const handleListening = () =>
    console.log(`✅ listening on port 'http://localhost:${PORT}' 🚀`);

app.listen(PORT, handleListening);
```

35. videoController.js에서 fake db인 'videos' 관련 전부 삭제

36. videoController.js에서 Video모델 import

-   Model.fine() -> 2가지 방법 -> 1. callback / 2. promise
-   promise가 더 세련된 방법이나, callback으로 기본 원리부터 알자
-   callback의 장점: 에러들을 바로 볼 수 있음
-   callback의 단점: 함수 안에 함수를 넣어야 함(노 세련)

```javascript
export const home = (req, res) => {
    // {}: search terms가 비어 있으면 모든 형식을 찾는 의미
    // (): error와 documents(모델명으로 바꿔도 됨)라는 고유 signature를 가짐
    Video.find({}, (error, videos) => {
        // errors null
        // videos[]
        console.log("errors", error);
        console.log("videos", videos);
    });
    // 위의 두 줄 코드보다 먼저 나온다
    // 이유: page를 req하고 -> Hello World! 출력 한 뒤 ->
    // render 과정을 거쳐야 -> logger를 얻게 됨 -> callback 함수: Video.find();
    console.log("Hello World!");
    res.render("home", { pageTitle: "Home", videos: [] });
};
```

```javascript
// promise: await는 async의 함수 안에서만 사용 가능
// try & catch
// await가 db를 기다려줌: db에게 결과를 받아 줄 때 까지
export const home = async (req, res) => {
    try {
        const videos = await Video.find({});
        res.render("home", { pageTitle: "Home", videos });
    } catch (error) {
        return res.render("error");
    }
};
```

```javascript
// res.render을 한 번 더 하면 안 됨
// render 자체를 실행하는데에 있어서 return은 사실 없어도 됨
// 하지만 render 후 function 자체를 종료하기 위해 return을 써줌
export const home = (req, res) => {
    Video.find({}, (error, videos) => {
        return res.render("home", { pageTitle: "Home", videos });
    });
    // render한 것은 다시 render할 수 없음: redirect(), sendStatus(), end() 등등 포함 (express에서 오류 발생)
    // callback(return이 있지만) 함수보다 먼저 실행 되어서 서버 종료
    // return res.end();
};
```

37. videoController.js에서 upload 부분 완성

```javascript
export const postUpload = async (req, res) => {
    // hashtags.split(",").map((word) => `#${word}`);
    const { title, description, hashtags } = req.body;
    try {
        // const video = new Video({})
        // db에 파일이 저장되는 것을 기다릴 수 있게함
        // await video.save();
        await Video.create({
            title,
            description,
            hashtags: hashtags.split(",").map((word) => `#${word}`),
        });
    } catch (error) {
        console.log(error);
        return res.render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
    // return res.redirect("/");
};
```

38. video.pug(mixin) 수정 및 watch.pug 수정

```javascript
mixin video(video)
    div
        h4
            //- a(href="/videos/" + videoInfo.id)=videoInfo.title
            a(href=`/videos/${video.id}`)=video.title
        p=video.description
        small=video.createdAt
        hr
```

```pug
extends base.pug

block content
    //- h3 #{video.views} #{video.views === 1 ? "view" : "views"}
    p=video.description
    small=video.createdAt
    a(href=`${video.id}/edit`) Edit Video &rarr;
```

39. [0-9a-f]{24} => 24자리의 16진법 정규식

40. controller.js에서 watch, getEdit 수정

```javascript
export const watch = async (req, res) => {
    // const id = req.params.id;
    // const { id } = req.params;
    const { id } = req.params;
    // findByOne() or findById() / 뒤에 .exec() 안 붙여도 됨
    const video = await Video.findById(id);
    // 맨 처음 error를 다뤄주는 것도 좋음(니코 방식)
    if (!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("watch", { pageTitle: video.title, video });
};
```

```javascript
export const getEdit = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};
```

41. middleware(hook)는 무조건 model 생성되기 전에 만들기

```javascript
// middleware(hook): 특정 함수의 특정 기능 전에 사전 적용
// 모든 save 이벤트에 적용(중간에서 가로채서 적용 시킴)
videoSchema.pre("save", async function () {
    this.hashtags = this.hashtags[0]
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));
});
```

42. mongo compass: https://ckddn9496.tistory.com/98

43. (※중요)hashtags를 다루는 두 가지 방법(static)

-   findByIdAndUpdate()에서는 save 훅업이 발생하지 않음 => 다른 방법을 알아보자
-   Video.js에 function을 만들어서 관리하기 => 이것도 괜찮음 근데 다른것도 알아보자
-   static을 사용하면 import 없이도 Model.function()형태로 사용이 가능함 => super cool

```javascript
// 첫 번째 방법
// import Video, { formatHashtags } from "../models/Video";
// hashtags: formatHashtags(hashtags),
export const formatHashtags = (hashtags) =>
    hashtags
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));
```

```javascript
// 두 번째 방법(추천)
videoSchema.static("formatHashtags", function (hashtags) {
    return hashtags
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));
});
```

44. mixins에서 hashtag들 보여주기

```pug
ul
    each hashtags in video.hashtags
        li=hashtags
```

45. deleteVideo

```javascript
export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    // 웬만한 경우엔 remove말고 delete를 쓰자
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};
```

46. params / body / query

-   라우터로 지정한 :id -> req.params
-   pug파일에서 input으로 받은 내용 -> req.body(form이 POST일 때)
-   pug파일에서 input으로 받은 url내용 -> req.query (form이 GET일 때)

47. controller.js => search 완성

```javascript
// 라우터로 지정한 :id -> req.params
// pug파일에서 input으로 받은 내용 -> req.body(form이 POST일 때)
// pug파일에서 input으로 받은 url내용 -> req.query (form이 GET일 때)
export const search = async (req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            // regex(regular expression): mongodb가 해줌
            // i(ignore case): 대소문자 구분 X
            // `^${keyword}`: keyword로 시작하는 것만
            // `${keyword}$`: keyword로 끝나는 것만
            title: {
                $regex: new RegExp(keyword, "i"),
            },
        });
    }
    return res.render("search", { pageTitle: "Search", videos });
};
```

<!-- User Part -->

48. models -> User.js 생성 -> init.js에서 User import
    -> controller(get&post) & router(get&post) & pug(join form) 만들기

49. (※중요)password hashing(보안 처리)

-   db에 password가 그대로 노출되면 위험

-   npm i bcrypt
    블로피시 암호에 기반을 둔 암호화 해시 함수(salt 통합)

```javascript
// User.js에서 create(this)되는 password를 hashing처리 해주기
userSchema.pre("save", async function () {
    // bcrypt.hash(생성비번, salt값)
    this.password = await bcrypt.hash(this.password, 5);
});
```

50. $or: [ {}, {} ]

```javascript
// const usernameExists = await User.exists({ username });
// if (usernameExists) {
//     return res.render("join", {
//         pageTitle,
//         errorMessage: "This username is already taken.",
//     });
// }
// const emailExists = await User.exists({ email });
// if (emailExists) {
//     return res.render("join", {
//         pageTitle,
//         errorMessage: "This email is already taken.",
//     });
// }

const exists = await User.exists({
    $or: [{ username }, { email }],
});

if (exists) {
    return res.render("join", {
        pageTitle,
        errorMessage: "This email/username is already taken.",
    });
}
```

51. status code

-   이메일or유저네임 중복이거나, 패스워드가 서로 달라서 생기는 오류인데도 브라우저는
    200메시지(성공)를 받기 때문에, 유저네임+닉네임을 저장할 거냐고 물어봄 -> 따라서
    강제로 이건 400(클라이언트 에러)메시지라고 보내서 저장할 거냐고 안 물어보게 해야함

-   브라우저는 200메시지 상태의 url을 계속 저장하기 때문에, 불필요한(위에서 말한)url들은 400메시지를 넘겨줘서, 브라우저가 url을 저장하지 않게 하는게 유저에게 좋음

-   200(OK): 서버가 요청을 제대로 처리했다는 뜻이다. 이는 주로 서버가 요청한 페이지를 제공했다는 의미로 쓰인다.

-   400(Bad Request): 서버가 요청의 구문을 인식하지 못할 때 발생한다. 클라이언트 측에서 문제가 있을 때 주로 발생한다.

-   404(Not Found): 서버가 요청한 페이지를 찾을 수 없을 때 발생한다. 서버에 존재하지 않는 페이지에 대한 요청이 있을 경우 서버는 이 코드를 제공한다.

```javascript
return res.status(400).render;
return res.status(404).render;
```

52. compare: '로그인 시 유저가 적는 비번 vs DB에 해싱된 체로 저장된 비번'

```javascript
// bcrypt.compare(유저가 적는 암호, db에 저장된 암호)
const ok = await bcrypt.compare(password, user.password);
if (!ok) {
    return res.status(400).render("login", {
        pageTitle,
        errorMessage: "Wrong password",
    });
}
```

53. (※※중요)User 기억하기

-   유저에게 쿠키 보내기

    -   세션: 백엔드와 브라우저 간에 어떤 활동을 했는지 기억(memory, history)
    -   페이지에서 HTTP 요청 -> 요청을 처리함 -> 이후로 백엔드가 할 수 있는 것 X
        -> 브라우저도 할 수 있는 것 X -> 연결이 유지된 상태가 아님 -> 서버가
        누가 요청을 보냈는지 잊어버림 -> 브라우저도 잊어버림 -> stateless 상태
    -   그래서 우리는 유저에게 어떤 정보를 남겨야 함
    -   유저가 백엔드에 뭔가 요청할 때마다 누가 요청하는지 알 수 있게 만들기

-   express-session

    -   미들웨어로 express에서 세션을 처리할 수 있게 해줌
    -   npm i express-session
    -   서버를 재시작 할 때마다 서버는 세션을 잊음(대신 메모리에 저장)
    -   나중에는 백엔드가 세션을 잊지 않도록 mongodb와 연결할 예정

```javascript
// sever.js
import session from "express-session";

// session(before our Routers)
app.use(
    session({
        secret: "Hello!",
        resave: true,
        saveUninitialized: true,
    })
);

// List of users that the backend remembers.
app.use((req, res, next) => {
    req.sessionStore.all((error, sessions) => {
        console.log(sessions);
        next();
    });
});

// URL to verify the session ID.
app.get("/add-one", (req, res, next) => {
    req.session.potato += 1;
    return res.send(`${req.session.id}\n${req.session.potato}`);
});
```

-   백엔드는 브라우저에게 쿠키(세션 id)를 보냄
-   백엔드의 메모리에 세션을 저장할 수 있는 DB가 생김
-   백엔드의 각 세션들을 id를 가졌고, 이 id를 브라우저에게 보냄, 그러면
-   브라우저가 요청을 보낼 때 마다, 그 id를 같이 보내줘서 일치하는 지 알 수 있고
-   만약 서로 다른 브라우저가 있다면 각 브라우저에 맞는 세션 id를 확인함
-   브라우저는 서로 다른 카운터를 가지고 있음

54. controller에서 유저가 로그인하면, 그 유저에 대한 정보를 세션에 담기

```javascript
// postLogin에 추가
// req.session object에 정보를 저장
req.session.loggedIn = true;
req.session.user = user;
```

-   pug랑 express가 서로 locals를 공유 할 수 있도록 설정
-   locals object를 바꾸면, templates에서 해당 내용을 확인 가능
-   locals에 내용을 넣으면(전역변수), 모든 템플릿에서 사용 가능

```javascript
// List of users that the backend remembers.
app.use((req, res, next) => {
    // global argument => all template
    res.locals.sexy = "you";
    res.locals.siteName = "xxxxxx";
    // locals: [Object: null prototype] {},
    console.log(res);
    req.sessionStore.all((error, sessions) => {
        console.log(sessions);
        next();
    });
});
```

55. (※중요)localMiddlewares

-   middlewares.js 파일 생성 및 임포트(before session)

```javascript
// sever.js
// Middleware
app.use(localsMiddleware);

// middlewares.js
// 템플릿의 모든 곳에 적용중인 사항(locals 안에 넣기만 하면 됨)
export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    // console.log(req.session);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user;
    console.log(res.locals);
    next();
};
```

56. (※중요)connect-mongo

-   세션을 mongoDB에 저장함(서버의 메모리에 저장 X)
-   서버를 재시작해도 세션은 DB에 저장돼 있음
-   npm install connect-mongo
-   세션은 브라우저가 backend를 방문할 때 만들어짐
-   store: MongoStore.crete({})

```javascript
// import MongoStore
import MongoStore from "connect-mongo";

// session(before Routers)
app.use(
    session({
        secret: "Hello!",
        resave: true,
        saveUninitialized: true,
        // mongoDB로 url 설정
        store: MongoStore.create({
            mongoUrl: "mongodb://127.0.0.1:27017/wetube",
        }),
    })
);
```

57. (※중요)Uninitialized Sessions(초기화되지 않은 세션들)

-   쿠키 삭제 -> 새로고침 -> 새로운 쿠키 자동 생성 -> 반복
-   DB에 쿠키 정보들이 계속 쌓임(모든 사용자들에게 허용)
-   만약 봇(fake human)이나 로그인하지 않고 구경만 하려는 사용자들이 방문 했다면?
-   모든 session들을 DB에 싸그리 저장하는 것은 좋은 생각은 아님
-   로그인한 사용자의 session만 저장하는게 좋다
-   resave와 saveUninitialized를 'true -> false'로 변경
-   세션을 수정할 때만 세션을 DB에 저장 -> 쿠키 넘겨줌
-   다시 말하면 backend가 로그인한 유저에게만 쿠키를 전달

```javascript
// session(before Routers)
app.use(
    session({
        secret: "Hello!",
        // true -> false로 변경
        resave: false,
        // true -> false로 변경
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: "mongodb://127.0.0.1:27017/wetube",
        }),
    })
);
```

-   resave : 모든 request마다 세션의 변경사항이 있든 없든 세션을 다시 저장한다.

*   true:

-   스토어에서 세션 만료일자를 업데이트 해주는 기능이 따로 없으면 true로 설정하여 매 request마다 세션을 업데이트 해주게 한다.

*   false:

-   변경사항이 없음에도 세션을 저장하면 비효율적이므로 동작 효율을 높이기 위해 사용한다.
-   각각 다른 변경사항을 요구하는 두 가지 request를 동시에 처리할때 세션을 저장하는 과정에서 충돌이 발생할 수 있는데 이를 방지하기위해 사용한다.

*   saveUninitialized : uninitialized 상태인 세션을 저장한다. 여기서 uninitialized 상태인 세션이란 request 때 생성된 이후로 아무런 작업이 가해지지않는 초기상태의 세션을 말한다.

-   true:

*   클라이언트들이 서버에 방문한 총 횟수를 알고자 할때 사용한다.

-   false:

*   uninitialized 상태인 세션을 강제로 저장하면 내용도 없는 빈 세션이 스토리지에 계속 쌓일수 있다. 이를 방지, 저장공간을 아끼기 위해 사용한다.

58. more cookies

-   secret: 쿠키에 sign할 때 사용하는 string
    쿠키에 sign하는 이유는 우리 backend가 쿠키를 줬다는 걸 보여주기 위함,
    이것을 잘 보호해야 누군가 너의 쿠키를 훔쳐서 마치
    너인 척을 할 수 있는 것을 방지하게 됨,
    secret을 사용할 땐 string을 사용하게 되는데,
    이것은 길고 강력하고 무작위로 작성되야 함

-   domain: 이 쿠키를 만든 backend가 누구인지 알려줌
    쿠키가 어디에서 왔는지 어디로 가야하는지 알려줌

-   path: 단순 url

-   expires: 쿠키의 만료 날짜, 만약 만료날짜를 지정하지 않으면
    이것은 session cookie로 설정 됨(브라우저를 닫거나 컴퓨터 재시작시 세션 사라짐)
    cookie: { maxAge: 20000, },

```javascript
// session(before Routers)
app.use(
    session({
        store: MongoStore.create({
            mongoUrl: "mongodb://127.0.0.1:27017/wetube",
        }),
        secret: "Hello!",
        resave: false,
        saveUninitialized: false,
        // millisecond 단위
        // cookie: {
        //     maxAge: 20000,
        // },
    })
);
```

59. .env 파일 생성(src 파일 밖에다 생성)

-   npm i dotenv
-   .gitignore에 .env 경로 추가
-   .env에 환경변수 추가 및 js에서 경로 설정

```javascript
// init.js
// === require("dotenv").config();
// require 방식은 dotenv를 사용하려는 모든 파일마다 적용해야함
import "dotenv/config";
```

<!-- GitHub login -->

60. 깃헙으로 로그인 과정

-   https://github.com/settings/applications/app
-   https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps

-   사용자를 깃헙으로 보냄(redirect) -> 로그인 하게 됨 ->

```javascript
// login.pug
a(href="https://github.com/login/oauth/authorize?client_id=0ddc5728c441b86aa161&allow_signup=false&scope=user:email") Continue with GitHub &rarr;
```

-   public 정보보다 더 많은 정보들이 필요함 -> scope로 전송 필요(어떤 정보를 가져올 것에 대한 것) -> 깃헙이 비번, 보안, 이메일 인증 등 모든 걸 처리 함 ->
-   (깃헙에게)승인이 나면 -> token과 함께 웹 사이트로 돌아감 ->
-   사용자 정보에 접근할 수 있음

```javascript
// login.pug
a(href="/users/github/start") Continue with GitHub &rarr;

// userRouter & userController
// 위의 미친듯하게 긴 url을 function으로 처리
export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: "0ddc5728c441b86aa161",
        allow_signup: false,
        // scope는 꼭 공백으로
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};
```

-   Authorization callback URL(http://localhost:4000/users/github/finish)
-   Authorization을 누르면 위 url로 callback 하면서 github이 code를 남겨줌(code=cecb89f4223ea68cfce3)

-   GitHub에서 준 코드를 Access 토큰으로 바꾸자(그 전에 client_id를 .env로 옮겨주자 -> 이유는 모든 환경에서 사용하기 위해)

```javascript
export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        // secret은 반드시 숨길 것
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    // fetch: 무언가를 하고 싶거나, 가져오고 싶을 때
    // fetch는 브라우저에서만 사용 가능해서, NodeJS에는 포함 X
    const data = await fetch(finalUrl, {
        method: "POST",
        // header에 json으로 accept하지 않으면, 단순 text로만 응답이 옴
        headers: {
            Accept: "application / json",
        },
    });
    const json = await data.json();
};
```

-   npm i node-fetch: fetch는 브라우저에서만 사용 가능해서, NodeJS에는 포함 X

-   바뀐 access_token을 인증을 위해 보내주자

```javascript
export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        // secret은 반드시 숨길 것
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    // fetch: 무언가를 하고 싶거나, 가져오고 싶을 때
    // fetch는 브라우저에서만 사용 가능해서, NodeJS에는 포함 X(최근 버전은 포함 O)

    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            // header에 json으로 accept하지 않으면, 단순 text로만 응답이 옴
            headers: {
                Accept: "application/json",
            },
        })
    ).json();

    // 위 코드랑 합쳐지면서 생략
    // const json = await data.json();

    // front에서 확인
    // res.send(JSON.stringify(json));

    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        // await(await fetch(url, { 옵션 })).json();
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();

        console.log(userData);

        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();

        console.log("----------------------------------------------");
        console.log(emailData);

        const email = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!email) {
            return res.redirect("/login");
        }
    } else {
        return res.redirect("/login");
    }
};
```

-   primary && verified === true: 둘다 만족하는 email 찾기

```javascript
emails.find((email) => email.primary === true && email.verified === true);
```

61. 이미 계정이 있는 사람(같은 email) VS 깃헙으로 로그인 하려는 사람(같은 email)
    1. 이미 password가 있으니 그걸로 로그인 해(깃헙 안 돼)
    2. 똑같은 email이 있다는 걸 증명했으니, 깃헙으로 로그인 해도 돼(암호 없어도 돼)

-   primary && verified === true인 email을 DB에서 찾고, email이 같다면 로그인 시켜주기
-   만약 email이 없다면 계정을 생성하도록 유도

```javascript
// 위 과정을 만족하는 email이 db상에 있다면 로그인 허용
const existingUser = await User.findOne({ email: emailObj.email });
if (existingUser) {
    req.session.loggedIn = true;
    req.session.user = existingUser;
    return res.redirect("/");
} else {
    // (db상에 email이 없다면)create an account
    const user = await User.create({
        name: userData.name,
        email: emailObj.email,
        username: userData.login,
        password: "",
        location: userData.location,
        socialOnly: true,
    });
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}
```

-   'socialOnly: true or false'로 로그인 유저 구분하기 -> postLogin에서 socialOnly가 false(암호를 사용해서 가입)인 유저만 찾을 수 있음

```javascript
// User.js
const userSchema = new mongoose.Schema({
    socialOnly: { type: Boolean, default: false },
});

// export const postLogin
const user = await User.findOne({ username, socialOnly: false });
```

-   코드 리팩토링: 'if(조건)' -> 'if(!조건)' 우선으로

```javascript
// const existingUser = await User.findOne({ email: emailObj.email });
// if (existingUser) {
//     req.session.loggedIn = true;
//     req.session.user = existingUser;
//     return res.redirect("/");
// } else {
//     // (db상에 email이 없다면)create an account
//     const user = await User.create({
//         name: userData.name,
//         email: emailObj.email,
//         username: userData.login,
//         password: "",
//         location: userData.location,
//         socialOnly: true,
//     });
//     req.session.loggedIn = true;
//     req.session.user = user;
//     return res.redirect("/");
// }

let user = await User.findOne({ email: emailObj.email });
if (!user) {
    user = await User.create({
        // (db상에 email이 없다면)create an account
        email: emailObj.email,
        socialOnly: true,
        username: userData.login,
        password: "",
        name: userData.name,
        location: userData.location,
    });
}
// 과정을 만족하는 email이 db상에 있다면 로그인 허용
req.session.loggedIn = true;
req.session.user = user;
return res.redirect("/");
```

62. 로그아웃

```javascript
// userController.js
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};
```

<!-- Edit Profile -->

63. 기본 과정

    1. (user)router 설정
    2. (user)controller 만들기
    3. edit-profile.pug 생성

```pug
//- loggedInUser 사용 가능(middleWares 덕분)
form(method="POST")
    input(name="name", type="text", value=loggedInUser.name,    placeholder="Name", required)
    input(name="email", type="email", value=loggedInUser.email  placeholder="Email", required)
    input(name="username", type="text", value=loggedInUser.username placeholder="Username", required)
    input(name="location", type="text", value=loggedInUser.location placeholder="Location", required)
    button Update Profile
```

-   여기서 문제점! -> 로그인 하지 않은 사람들이 방문하는 url에 접근을 금지시킬(route 보호) middleware가 필요함

```javascript
// user가 loggedIn 돼 있다면, 요청을 계속하게 함
// 그렇지 않다면 login page로
export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/login");
    }
};

// user가 loggedIn 돼 있지 않으면, 요청을 계속하게 하고
// 그렇지 않다면 홈으로
export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/");
    }
};
```

64. (※중요)postEdit

-   DB에서는 user(email)를 업데이트 했는데, session은 DB와 연결돼 있지 않음(edit 화면에서 수정된 email로 보이지가 않음, 근데 DB에서는 바껴있음)

-   프론트엔드는 session에서 정보를 받아오는데, session은 로그인 할 때 한 번만 작성되고 있음 -> 따라서 session도 따로 업데이트를 해줘야 함

```javascript
// middlewares에서 loggedInUser를 사용중(모든 view에 적용)
// user: req.session.user,
export const postEdit = async (req, res) => {
    const {
        session: {
            // db상에는 id가 아니라 _id로 저장
            user: { _id },
        },
        body: { name, email, username, location },
    } = req;
    // 위 session으로 넣어버리고 생략
    // const { name, email, username, location } = req.body;

    // 방법1:
    await User.findByIdAndUpdate(_id, {
        name,
        email,
        username,
        location,
    });
    // 방법1: 직접 일일이 넣어주기
    req.session.user = {
        name,
        email,
        username,
        location,
    };

    // 방법2: 한 번에 처리하기(User를 session에 넣기)
    const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
            name,
            email,
            username,
            location,
        },
        // updated된 정보를 반영하는 옵션
        { new: true }
    );
    req.session.user = updatedUser;
    return res.render("edit-profile");
};
```

-   만약 수정하려는 이메일과 유저네임이 이미 있는 경우라면?

```javascript
const exists = await User.exists({
    // Not Equals(특정 필드 값과 일치하지 않는 모든 데이타)
    _id: { $ne: { _id } },
    $or: [{ email }, { username }],
});

if (exists) {
    return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "email/username is already taken.",
    });
}
```

65. password change

```javascript
export const postChangePassword = async (req, res) => {
    // session에서 현재 로그인된 사용자를(id를 통해)확인하고, form에서 정보를 가져옴
    const {
        session: {
            user: { _id },
        },
        body: { oldPassword, newPassword, newPassword2 },
    } = req;

    // 세션속 _id를 찾아서 user가 누군지 명시해주기
    const user = await User.findById(_id);

    // 기존의 비밀번호가 맞는지 확인 작업
    const passwordOk = await bcrypt.compare(oldPassword, user.password);
    if (!passwordOk) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrect.",
        });
    }

    // 새로운 비밀번호 확인 작업
    if (newPassword !== newPassword2) {
        // 브라우저는 비번이 무조건 맞는 주 알기 떄문에, status(400) 전달
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            // 나중에는 에러메시지를 직접 보내는 대신, 어떤 template에도 보낼 수 있는 알림 사용
            errorMessage: "The password does not match the confirmation.",
        });
    }

    user.password = newPassword;

    // 새로운 비밀번호 hash 작업 거치기(pre("Save", async function()))
    await user.save();

    // 비밀번호 변경 후 로그아웃 처리
    return res.redirect("/users/logout");
};
```

66. MongoServerError: E11000 duplicate key error collection: wetube.users index:

-   Please remove the database and start again.
    On your console:
    `use wetube` and then
    `db.dropDatabase()`

67. File Uploads

-   파일 선택 input 만들기

```pug
label(for="avatar") Avatar
input(name="avatar", type="file", id="avatar", accept="image/*")
```

-   multer middleware 설치(npm i multer)
-   form을 multer로 설정하기

```pug
form(method="POST", enctype="multipart/form-data")
```

-   middlewares.js에서 multer 설정

```javascript
export const uploadFiles = multer({
    dest: "uploads/",
});
```

-   userRouter.js에서 single 설정

```javascript
.post(uploadFiles.single("avatar"), postEdit);
```

-   postEdit에서 multer 작동 확인

```javascript
export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        // body에 file 추가
        body: { name, email, username, location },
        file,
    } = req;
    // console로 확인
    console.log(file);
```

-   파일 업로드: fail.path vs avatarUrl

```javascript
export const postEdit = async (req, res) => {
    const {
        session: {
            // db상에는 id가 아니라 _id로 저장
            // avatarUrl
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        // 파일이 존재하지 않으면 사용할 수 없음
        // file: {path},
        file,
    } = req;

    const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
            name,
            email,
            username,
            location,
            // 파일이 존재한다면(input으로 업로드를 했다면) file.path /
            // 파일이 존재 X라면(업로드를 안 했다면) avatarUrl
            avatarUrl: file ? file.path : avatarUrl,
            // 파일이 존재하지 않으면 사용할 수 없음
            // avatarUrl: path,
        },
        // updated된 정보를 반영하는 옵션
        { new: true }
    );
```

-   (※중요)절대 절대 절대! DB에는 파일 저장하지 말 것!(※중요) -> 대신에 파일의 위치를 저장한다!

-   브라우저에게 파일을 보기 위해서 어디로 가야하는지 알려줘야 함(static files serving) -> 폴더 전체를 브라우저에게 노출

```javascript
// server.js
app.use("/uploads", express.static("uploads"));
```

```pug
    //- "/"를 추가해줘서 절대경로 이미지로 바꿔주기
    img(src="/" + loggedInUser.avatarUrl, width="100", height="100")
```

68. Multer(video uploads)
    1. form으로 보낸 파일을 업로드 시켜줌
    2. 그 파일에 관한 정보를 제공해 줌
    3. 파일명을 완전히 랜덤으로 생성해 줌
    4. 그 파일을 우리가 지정한 폴더에 저장해 줌

-   routers에서 multer를 먼저 사용해주고 -> controller에 파일에 관한 정보 제공 -> 컨트롤러에서 해당 함수(multer가 포함된)를 작동시키면 -> 파일 업로드 -> 파일명 변환 -> 컨트롤러에서 req.file을 사용 가능 -> 유저가 파일을 보내지 않을 수도 있기 때문에 -> form에 file이 있다면 req에 있는 file.path를 사용, 근데 file이 없다면 user의 avatarUrl을 사용

-   브라우저가 아직 업로드한 파일이 존재하는지 모름 -> 시도를 한다면 404(not found)에러가 뜸 -> express에게 만약 누군가 /uploads로 가려고 한다면, uploads폴더의 내용을 보여줘라고 알려줘야 함 -> 업로드한 모든 사진들이 저장되고 있는데, 별로 좋은 방법이 아님 -> 특히나 서버자체에 파일을 저장하는 것은 절대 안 됨! -> 따라서 서버가 사라졌다가 다시 돌아와도 파일은 그대로 있도록 하기 위해 다른 곳에 저장이 필요 -> 예를들면 Amazon의 하드드라이브 등

-   multer에서 fileSize 옵션을 줘서, image는 1MB이하로, video는 10MB이하로 제한하기

```javascript
// middlewares.js
export const avatarUpload = multer({
    dest: "uploads/avatars",
    // in bytes
    // 3mb
    limits: { fileSize: 3000000 },
});

export const videoUpload = multer({
    dest: "uploads/videos",
    // 10mb
    limits: { fileSize: 10000000 },
});

// userRouter.js
.post(avatarUpload.single("avatar"), postEdit);

// videoRouter.js
.post(avatarUpload.single("avatar"), postEdit);
```

-   model에 videoSchema에서 fileUrl을 추가

```javascript
fileUrl: { type: String, require: true },
```

-   videoController에서 postUpload의 fileUrl(file.path) 경로 추가

```javascript
// multer는 req.file을 제공해 줌(그 안에는 path가 존재)
// 코드 리팩토링: const { path } = req.file;
const { path: fileUrl } = req.file;

await Video.create({
    title,
    description,
    // multer는 req.file을 제공해 줌(그 안에는 path가 존재)
    fileUrl,
    // 이렇게 일일이 복붙 하는 법은 구리다 => 적절한 방법을 찾자!
    // 1. Video.js에서 const formatHashtags 변수를 만들어서 가져다 쓰기
    hashtags: Video.formatHashtags(hashtags),
});
```

-   edit-profile.pug과 upload.pug 에서 enctype 반드시 설정 하기

```pug
//- enctype 반드시 설정 해주기
form(method="POST", enctype="multipart/form-data")
```

-   watch.pug에서 video element 추가

```pug
//- videoController.js의 watch에서 video를 가져와서
//- video.fileUrl의 경로설정 해주기 + controls 추가
video(src="/" + video.fileUrl, controls)
```

69. User Profile

-   user는 여러개의 video를 가지기 & video는 하나의 user만 가지기
-   영상을 소유한 user만 'edit video & delete video'를 가능하게
-   user는 자신이 uploads한 영상들을 모아서 볼 수 있도록 하기
-   users와 videos를 서로 연결 해주기

```pug
//- middlewares에서 만든 loggedInUser 활용
li
    a(href=`/users/${loggedInUser._id}`) My Profile |
```

```javascript
//userController.js
export const see = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).render("404", { pageTitle: "User not found." });
    }
    return res.render("users/profile", {
        pageTitle: user.name,
        user,
    });
};
```

-   users와 videos를 서로 연결 -> 우선 db에서 users와 videos안의 내용을 전부 삭제 -> id를 사용해야 함(유니크 하기 때문) -> user에는 해당 user가 업로드한 모든 영상 id를 저장 -> video에는 해당 영상을 올린 user의 id를 저장

```javascript
//  Video.js -> videoSchema
owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
```

-   이제 영상을 업로드할 때 업로드하는 사용자의 id를 전송해야 함

```javascript
// videoController.js -> postUpload

// session에서 id를 가져와서
const {
    user: { _id },
} = req.session;

// Video모델에 있는 owner(오브젝트)에서 id만 생성해 주기
await Video.create({
    title,
    description,
    fileUrl,
    owner: _id,
    hashtags: Video.formatHashtags(hashtags),
});
```

-   populate가 있어야 영상 주인만 아래 버튼이 보임

-   로그인된 사람의 id와 영상의 owner의 id가 일치하면, 로그인 된 사용자가 이 영상의 주인이라는 뜻

```pug
//- video.owner의 id는 object인데, loggedInUser._id는 string
if String(video.owner._id) === String(loggedInUser._id)
```

```javascript
// videoController.js의 watch에 추가
// 영상 올린 사람 이름을 watch.pug에 표현하려는 변수
const owner = await User.findById(video.owner);
```

-   위의 코드를 더 짧게 만들어보자

```javascript
// videoController.js의 watch에 추가
// 위 코드를 .populate("owner");로 마무리
const video = await Video.findById(id).populate("owner");
```

-   내가 업로드한 영상들을 가져오자(My Profile에서)

```javascript
// video의 owner id가, url에 있는 id와 같은 video를 찾기
const videos = await Video.find({ owner: user._id });
```

-   아래의 코드를 짧게 만들어 보자(우선 DB 초기화 필요)
-   user는 여러개의 video 소유 가능, 반대로 video는 하나의 user만 있음(이를 기반으로 코드를 더 짧고 효율적이게 리팩토링)

```javascript
// userController.js
export const see = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).render("404", { pageTitle: "User not found." });
    }
    // video의 owner id가, url에 있는 id와 같은 video를 찾기
    const videos = await Video.find({ owner: user._id });
    // console.log(videos);
    return res.render("users/profile", {
        pageTitle: user.name,
        user,
        videos,
    });
};
```

```javascript
// User.js
// object가 아닌 array(많은 비디오를 담을 수 있음)
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            // required: true,
        },
    ],

// videoController.js
export const postUpload = async (req, res) => {
    const {
        user: { _id },
    } = req.session;

    const { path: fileUrl } = req.file;

    const { title, description, hashtags } = req.body;
    try {
        // newVideo로 변수화
        const newVideo = await Video.create({
            title,
            description,
            fileUrl,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        // User.videos의 array에 push
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    } catch (error) {
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};

// userController.js
export const see = async (req, res) => {
    const { id } = req.params;
    // populate 추가
    const user = await User.findById(id).populate("videos");
    if (!user) {
        return res.status(404).render("404", { pageTitle: "User not found." });
    }
    return res.render("users/profile", {
        pageTitle: user.name,
        user,
    });
};
```

```pug
//- profile.pug
block content
    //- 그냥 videos가 아닌 user.videos
    each video in user.videos
        +video(video)
    else
        li Sorry nothing found.
```

-   그전에 save(); 과정에서 반복되는 hash 작업을 수정하자(middlewares)

```javascript
// password hashing
// 반복적으로 비밀번호가 hash 되는 것은 좋지 않음(hash가 hash 되기 때문)
userSchema.pre("save", async function () {
    // isModified: property가 하나라도 수정되면 true, 그게 아니면 false
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);
    }
});
```

-   (※중요!!)영상의 소유주만 수정, 삭제 등이 가능하도록 만들자 -> 물론 template상에서 edit과 delete를 가려주곤 있지만, 백엔드에서 반드시 보호해야 함!

```javascript
// videoController.js
// 아래의 작업을 getEdit / postEdit / deleVideo에 해주기
const {
    user: { _id },
} = req.session;
// JS에선 생김새 + 데이터타입까지 비교(owner는 object, _id는 string)
// console.log(typeof video.owner, typeof _id);
if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
}

// populate를 어디에 쓰고 어디에 안 쓸지 잘 생각하자(전부를 가져오는 기능)
// 위에서는 owner와 _id의 서로 id만 비교하니까 노필요
```

<!-- front-end -->

70. Webpack(※※※중!!!!!!!!요!!!!!!※※※)

-   .scss(sassy) -> .css로 변환 필요 -> 브라우저가 이해를 못 하기 때문
-   Webpack은 신상 JS 코드들을 받아서 -> 구식 JS 코드로 변형 시켜줌
-   웹팩을 직접 배우기보단 웹팩이 포함된 툴들을 사용하는 게 일반적이지만 -> 웹팩은 업계 표준이고 적어도 어떻게 작동하는지는 알아야 그 뒤에 무슨 일이 일어나는지 알게 됨

-   npm i webpack webpack-cli --save-dev(=== '-D')

-   entry(소스파일)가 있고, 여기가 네(webpack)가 결과물을 보낼 폴더(output)야
    -> entry: 우리가 처리하고자 하는 파일(소스파일, 예: main.js)
    -> output: 위 entry를 가지고 압축, 변형 등을 통해 나온 섹시 코드

-   webpack.config.js 생성(src 밖에) -> 오래된 JS 코드만 이해 가능

```javascript
// webpack.config.js
module.exports = {
    entry: "./src/client/js/main.js",
    output: {
        filename: "main.js",
        path: "./assets/js",
    },
};

// package.json -> scripts
"assets": "webpack --config webpack.config.js"
```

-   rules: 모든 css 파일을 가져다가(test), 다음의 설정으로 변환 적용(use) -> loader(웹팩 용어)
    -> babel-loader 설치: npm install babel-loader -D

```javascript
// 반드시 아래 웹팩의 구성을 기억하자!
module.exports = {
    entry: "./src/client/js/main.js",
    mode: "development",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "assets", "js"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", { targets: "defaults" }],
                        ],
                    },
                },
            },
        ],
    },
};
```

-   Express한테 assets(js->main.js)가 있다고 알려줘야 함

```javascript
// server.js
app.use("/static", express.static("assets"));

// base.pug
script((src = "/static/js/main.js"));
```

-   client안에 scss 만들고 그 안에, style.scss와 \_variable.scss 만들기

-   이상한 css파일(scss)을 가져다가 일반적인 css로 바꿈 -> 바뀐 css를 웹사이트로 불러옴

-   이 과정에서 3가지 loader가 필요함(npm 들어가서 각각 설치)
    1. scss를 가져다가 일반 css로 변형시킬 loader -> sass-loader
    2. 폰트같은 것을 불러올 때 css에 유용하게 쓰일 css-loader
    3. 변환한 css를 웹사이트에 적용시킬 style-loader

```javascript
// webpack.config.js
{
    test: /\.scss$/,
    // 역순으로 입력하는 이유: webpack은 뒤에서부터 시작하기 때문
    use: ["style-loader", "css-loader", "sass-loader"],
},
```

-   miniCssExtraPlugin: 해당 코드를 다른 파일로 분리시킴(npm install --save-dev mini-css-extract-plugin)
-   style-loader를 쓰지 말고 위 플러그인을 쓰자

```javascript
// webpack.config.js
// 아래 두 코드는 그냥 웹팩 doc에서 긁어 왔음
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
plugins: [new MiniCssExtractPlugin()],
// style-loader의 위치에 플러그인 적기
use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
```

-   main.js와 main.css가 같은 공간에 생기는 것을 방지하기 위해

```javascript
// webpack.config.js
// output에서 filename을 'js/'를 붙여서 바꿔 주고, path에서 뒤에 "js"를 삭제
output: {
        filename: "js/main.js",
        path: path.resolve(__dirname, "assets"),
    },

// 플러그인 안에 filename을 만들고 'css/'를 붙이기
plugins: [
        new MiniCssExtractPlugin({
            filename: "css/styles.css",
        }),
    ],
```

-   client를 실시간으로 감시하기 위해

```javascript
// webpack.config.js
watch: true,
```

-   assets이 재실행 될 때 마다 output을 리셋 시키기(중첩 코드 예방)

```javascript
output: {
        filename: "xxxx/main.js",
        path: path.resolve(__dirname, "assets"),
        clean: true,
    },
```

-   (※중요!※) front에서 js코드를 변경시킨다고 해서 back의 서버까지 재구동 되는 것을 원치 않음(nodemon stop)

```javascript
// nodemon.json
// 프론트에서 관리되는 부분들 모두 ignore 처리
// package.json에서 구동명령어 변경을 위한 exec 설정
{
    "ignore": ["webpack.config.js", "src/client/*", "assets/*"],
    "exec": "babel-node src/init.js"
}

// package.json
// nodemon과 webpack 구동 명령어 변경
"scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "dev:server": "nodemon",
        "dev:assets": "webpack"
    },
```

-   .gitignore에 '/assets' 반드시 추가

<!-- Styles -->
<!-- #10 STYLES 강의 참조 -->

<!-- Video Player -->

71. 비디오 플레어이를 위한 js 파일

-   https://developer.mozilla.org/ko/docs/Web/API/HTMLMediaElement

```javascript
entry: {
        // 여러개의 entry 생성
        main: "./src/client/js/main.js",
        videoPlayer: "./src/client/js/videoPlayer.js",
    },

// 여러개의 entry를 위한 [name] 변수
        filename: "js/[name].js",
```

-   watch.pug와 videoPlayer.js

```pug
//- watch.pug
div
    button#play Play
    button#mute Mute
    span#time 00:00/00:00
    input(type="range", step="0.1", min="0", max="1")#volume

block scripts
    //- static인 이유는 우리 서버에 등록한 이름이라서
    script(src="/static/js/videoPlayer.js")
```

-   비디오 플레이 버튼 + 비디오 뮤트 버튼

```javascript
// videoPlayer.js
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

const defaultVolume = 0.5;
let inputVolume = defaultVolume;
let changeVolume = defaultVolume;
video.volume = defaultVolume;

const handlePlayClick = (event) => {
    // paused: true or false를 반환 함
    video.paused = video.paused ? video.play() : video.pause();

    playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMuteClick = (event) => {
    // muted: true or false를 반환
    video.muted = video.muted ? false : true;

    muteBtn.innerText = video.muted ? "Unmute" : "Mute";

    /*
     * 1. 볼륨을 최대로 내릴 때, inputVolume은 값이 계속 내려가면서 저장
     * 2. 따라서 inputVolume은 changeVolume보다 값이 클 수 없음(고정 상황)
     * 3. 만약 unmute(video.volume === 0)시 'changeVolume > inputVolume'라면,
     * 4. changeVolume으로 돌아가고(볼륨을 끌어내리면서 mute한 상황)
     * 5. 만약 둘의 값이 같은 경우(바로 mute버튼을 클릭한 상황)은 inputVolume으로 돌아감
     */
    volumeRange.value = video.muted
        ? 0
        : inputVolume < changeVolume
        ? changeVolume
        : inputVolume;

    video.volume = volumeRange.value;
};

const handleInputVolume = (event) => {
    const {
        target: { value },
    } = event;

    if (video.muted) {
        video.muted = false;
        muteBtn.innerText = "Mute";
    }

    if (video.volume === 0) {
        video.muted = true;
        muteBtn.innerText = "Unmute";
    }

    inputVolume = value;
    video.volume = value;
};

function handleChangeVolume(event) {
    const {
        target: { value },
    } = event;

    if (video.volume === 0) {
        video.muted = true;
        muteBtn.innerText = "Unmute";
    } else {
        changeVolume = value;
    }
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleInputVolume);
volumeRange.addEventListener("change", handleChangeVolume);
```

72. Duration and Current Time(미디어 재생바)

-   loadedMetadata: 비디오를 제외한 모든 것, 미디어의 첫 번째 프레임이 로딩 완료된 시점에 발생
-   timeupdate: currentTime 속성이 변경되는 시점에 발생

```javascript
const handleLoadedMetadata = (event) => {
    totalTime.innerText = Math.floor(video.duration);
};

const handleTimeUpdate = (event) => {
    currentTime.innerText = Math.floor(video.currentTime);
};

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
```

73. Date Constructor: JS안에 있는 date class

-   컴퓨터는 1970년 1월 1일부터 날짜를 세기 시작 함
-   new Date(): ()안에 넣어야할 argument는, 이 시간을 기준으로 한 밀리초여야 함

-   29초 뒤의 시간을 얻고 싶은데 어떻게 할까?

```javascript
// substring(시작 인덱스, 종료 인덱스)
new Date(29 * 1000); // Fri Mar 17 2023 00:32:25 GMT+0900 (한국 표준시)
new Date(29 * 1000).toISOString(); // 1970-01-01T00:00:29.000Z
new Date(seconds * 1000).toISOString().substring(11, 19); // 00:00:29

// videoPlayer.js
const formatTime = (seconds) =>
    new Date(seconds * 1000).toISOString().substring(11, 19);

const handleLoadedMetadata = (event) => {
    // formatTime으로 덮어주기
    totalTime.innerText = formatTime(Math.floor(video.duration));
};

const handleTimeUpdate = (event) => {
    // formatTime으로 덮어주기
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
};
```

-   타임라인에 따라 실제로 영상도 움직여보자

```javascript
// videoPlayer.js
const handleTimelineChange = (event) => {
    const {
        target: { value },
    } = event;
    // video.currentTime: get or set 둘 다 가능
    video.currentTime = value;
};
```

-   #11.7 fullScreen에서 README 요약 일단 정지!

-   #11.7 ~ #13.5까지 깃 업로드로 대체

<!-- Flash Messages  -->

74. npm i express-flash: 템플릿에서 사용자에게 메시지를 남길 수 있게 하는 미들웨어

```javascript
// flash message가 필요한 곳이라면 어디든 사용
req.flash("error", "Not authorized");
req.flash("info", "Password updated");
```
