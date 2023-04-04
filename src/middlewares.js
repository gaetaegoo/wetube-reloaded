import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

// .env에서 'AWS_ID 와 AWS_SECRET' 가져오기
// const s3 = new aws.S3({
//     credentials: {
//         accesskeyId: process.env.AWS_ID,
//         secretAccessKey: process.env.AWS_SECRET,
//     },
// });

const s3 = new S3Client({
    region: "ap-northeast-2",
    credentials: {
        apiVersion: "2023-03-26",
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    },
});

// S3와 로컬uploader를 분리하여 업로드
const isFlyio = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: "wetube-gaetaegoo",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (request, file, ab_callback) {
        const newFileName = Date.now() + "-" + file.originalname;
        const fullPath = "images/" + newFileName;
        ab_callback(null, fullPath);
    },
});

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: "wetube-gaetaegoo",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (request, file, ab_callback) {
        const newFileName = Date.now() + "-" + file.originalname;
        const fullPath = "videos/" + newFileName;
        ab_callback(null, fullPath);
    },
});

export const localsMiddleware = (req, res, next) => {
    // console.log(req.session);
    // console.log(res.locals);
    res.locals.siteName = "Wetube";
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    // 로그인 하지 않은 자들이 접근할 때 url 자체는 들어올 수 있도록
    // 빈 오브젝트도 설정해줌
    res.locals.loggedInUser = req.session.user || {};
    res.locals.isFlyio = isFlyio;
    next();
};

// user가 loggedIn 돼 있다면, 요청을 계속하게 함
// 그렇지 않다면 login page로
export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Log in first.");
        return res.redirect("/login");
    }
};

// user가 loggedIn 돼 있지 않으면, 요청을 계속하게 하고
// 그렇지 않다면 홈으로
export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
};

export const avatarUpload = multer({
    dest: "uploads/avatars/",
    // in bytes
    // 3mb
    limits: { fileSize: 3000000 },
    storage: isFlyio ? s3ImageUploader : undefined,
});

export const videoUpload = multer({
    dest: "uploads/videos/",
    // 10mb
    limits: { fileSize: 10000000 },
    storage: isFlyio ? s3VideoUploader : undefined,
});
