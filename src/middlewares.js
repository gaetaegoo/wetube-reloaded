import multer from "multer";

export const localsMiddleware = (req, res, next) => {
    // console.log(req.session);
    // console.log(res.locals);
    res.locals.siteName = "Wetube";
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    // 로그인 하지 않은 자들이 접근할 때 url 자체는 들어올 수 있도록
    // 빈 오브젝트도 설정해줌
    res.locals.loggedInUser = req.session.user || {};
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
