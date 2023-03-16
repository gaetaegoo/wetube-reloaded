import Video from "../models/Video";
import User from "../models/User";

// export const home = (req, res) => {
//     // {}: search terms가 비어 있으면 모든 형식을 찾는 의미
//     // (): error와 documents(모델명으로 바꿔도 됨)라는 고유 signature를 가짐
//     Video.find({}, (error, videos) => {
//         // errors null
//         // videos[]
//         // console.log("errors", error);
//         // console.log("videos", videos);
//         console.log("B");
//         res.render("home", { pageTitle: "Home", videos });
//     });
//     // 위의 두 줄 코드보다 먼저 나온다
//     // 이유: page를 req하고 -> Hello World! 출력 한 뒤 ->
//     // render 과정을 거쳐야 -> logger를 얻게 됨 -> callback 함수: Video.find();
//     // console.log("Hello World!");
// };

// promise: await는 async의 함수 안에서만 사용 가능
// try & catch
// await가 db를 기다려줌: db에게 결과를 받아 줄 때 까지
// export const home = async (req, res) => {
//     try {
//         const videos = await Video.find({});
//         res.render("home", { pageTitle: "Home", videos });
//     } catch (error) {
//         return res.render("error");
//     }
// };

// res.render을 한 번 더 하면 안 됨
// render 자체를 실행하는데에 있어서 return은 사실 없어도 됨
// 하지만 render 후 function 자체를 종료하기 위해 return을 써줌
export const home = async (req, res) => {
    const videos = await Video.find({})
        .sort({ createdAt: "desc" })
        .populate("owner");
    return res.render("home", { pageTitle: "Home", videos });
    // render한 것은 다시 render할 수 없음: redirect(), sendStatus(), end() 등등 포함 (express에서 오류 발생)
    // callback(return이 있지만) 함수보다 먼저 실행 되어서 서버 종료
    // return res.end();
};

// export const watch = async (req, res) => {
//     // const id = req.params.id;
//     // const { id } = req.params;
//     const { params: id } = req;
//     // findByOne() or findById() / 뒤에 .exec() 안 붙여도 됨
//     const video = await Video.findById(id);
//     // 맨 처음 error를 다뤄주는 것도 좋음(니코 방식)
//     if (!video) {
//         return res.render("404", { pageTitle: "Video not found." });
//     }
//     return res.render("watch", { pageTitle: video.title, video });
// };

export const watch = async (req, res) => {
    const { id } = req.params;
    // 아래 주석 부분 코드를 .populate("owner");로 마무리
    const video = await Video.findById(id).populate("owner");
    // 영상 올린 사람 이름을 watch.pug에 표현하려는 변수
    // const owner = await User.findById(video.owner);
    // console.log(video);
    if (!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    // edit 템플릿에 video 오브젝트 전체를 보내야 함 => exists() 사용 불가
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    // JS에선 생김새 + 데이터타입까지 비교(owner는 object, _id는 string)
    // console.log(typeof video.owner, typeof _id);
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

export const postEdit = async (req, res) => {
    const {
        user: { _id },
    } = req.session;
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    // video 오브젝트 전체를 찾지 말고, id가 true인지 false인지만 체크하자(post에서만)
    const video = await Video.exists({ _id: id });
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    // getEdit에서 했던 작업과 똑같이(로그인 유저와 영상의 주인이 같을 때만)
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    // 2개의 인자가 필요 => id, update내용
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    });
    // 이렇게 일일이 타이핑 하는 법은 구리다 => 적절한 펑션을 찾자!
    // video.title = title;
    // video.description = description;
    // hashtags 앞에 #가 있다면 추가하지 않고, #가 없다면 추가
    // video.hashtags = hashtags
    //     .split(",")
    //     .map((word) => (word.startsWith("#") ? word : `#${word}`));
    // await video.save();
    return res.redirect(`/videos/${id}`);
};

// export const upload = (req, res) => res.send("Upload Video");

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
    const {
        user: { _id },
    } = req.session;

    // multer는 req.file을 제공해 줌(그 안에는 path가 존재)
    // 코드 리팩토링: const { path } = req.file;
    const { path: fileUrl } = req.file;

    // hashtags.split(",").map((word) => `#${word}`);
    const { title, description, hashtags } = req.body;
    try {
        // const video = new Video({})
        // db에 파일이 저장되는 것을 기다릴 수 있게함
        // await video.save();

        // newVideo로 변수화
        const newVideo = await Video.create({
            title,
            description,
            // multer는 req.file을 제공해 줌(그 안에는 path가 존재)
            fileUrl,
            // 업로드 될 영상의 id를 user model에도 저장 해줘야 함
            owner: _id,
            // 이렇게 일일이 복붙 하는 법은 구리다 => 적절한 방법을 찾자!
            // 1. Video.js에서 const formatHashtags 변수를 만들어서 가져다 쓰기
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        // User.videos의 array에 push
        // user.videos.unshift(newVideo._id);
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

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    // getEdit에서 했던 작업과 똑같이(로그인 유저와 영상의 주인이 같을 때만)
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    // 웬만한 경우엔 remove말고 delete를 쓰자
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

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
        }).populate("owner");
    }
    return res.render("search", { pageTitle: "Search", videos });
};

// 조회수 기록
export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        // 그냥 status를 하면 뒤에 .render같은 것이 필요 함(연결이 안 끝나기 때문)
        // 따라서 sendStatus를 해서 상태코드를 보내야 끝남
        // return res.status(404);
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
};
