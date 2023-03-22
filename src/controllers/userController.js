import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
    const { name, email, username, password, password2, location } = req.body;
    const pageTitle = "Join";

    // const usernameExists = await User.exists({ username });
    // if (usernameExists) {
    //     return res.render("join", {
    //         pageTitle,
    //         errorMessage: "Username already taken.",
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
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This email/username is already taken.",
        });
    }

    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match.",
        });
    }

    try {
        await User.create({
            name,
            email,
            username,
            password,
            password2,
            location,
        });
        return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: error._message,
        });
    }
};

export const getLogin = (req, res) => {
    res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    // 어차피 username을 계속 찾으니까 exists를 삭제
    // const exists = await User.exists({ username });
    const user = await User.findOne({ username, socialOnly: false });
    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists.",
        });
    }
    // bcrypt.compare(유저가 적는 암호, db에 저장된 암호)
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password",
        });
    }
    // req.session object에 정보를 저장
    // 실제로 세션을 initialize(초기화)하는 부분
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        // scope는 꼭 공백으로
        // access_token은 scope에 적은 옵션만 담아서 보내줌
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};

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

        // console.log(userData);

        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();

        console.log(
            "---------------------------------------------------------"
        );
        // console.log(emailData);

        // email 객체에서 양 조건을 만족하는 email 찾기
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if (!user) {
            user = await User.create({
                // (db상에 email이 없다면)create an account
                email: emailObj.email,
                socialOnly: true,
                avatarUrl: userData.avatar_url,
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
    } else {
        return res.redirect("/login");
    }
};

export const logout = (req, res) => {
    // req.session.destroy();

    // flash를 위한(no destroy)
    // flash는 session을 필요로 하기 때문에 destroy하면 로그아웃 후에 못 씀
    req.session.user = null;
    res.locals.loggedInUser = req.session.user;
    req.session.loggedIn = false;

    req.flash("info", "Bye Bye.");
    return res.redirect("/");
};
export const getEdit = (req, res) => {
    return res.render("edit-profile", {
        pageTitle: "Edit Profile",
    });
};

// middlewares에서 loggedInUser를 사용중(모든 view에 적용)
// user: req.session.user,
export const postEdit = async (req, res) => {
    const {
        session: {
            // db상에는 id가 아니라 _id로 저장
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        // 파일이 존재하지 않으면 사용할 수 없음
        // file: {path},
        file,
    } = req;

    // console.log(file);
    // 위 session으로 넣어버리고 생략
    // const { name, email, username, location } = req.body;

    // 갑자기 편집 안 되면 findById로 바꾸자(중괄호 없애야 함)
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

    req.session.user = updatedUser;

    return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
    // GitHub 사용자는 홈로 되돌리기
    if (req.session.user.socialOnly === true) {
        req.flash("error", "Can't change password.");
        return res.redirect("/");
    }
    return res.render("users/change-password", {
        pageTitle: "Change Password",
    });
};

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

    // 예전 암호와 새로운 암호과 같을 시 처리
    if (oldPassword === newPassword) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The old password equals new password",
        });
    }

    user.password = newPassword;

    // 1. 비밀번호를 변경 후, 로그아웃이 되게 한다면,
    //     어차피 session은 destroy되어 session에 신경을 쓰지 않아도 된다.
    // 2. 비밀번호를 변경 후, 로그인을 계속 유지한다면,
    //     session은 업데이트 해주는 게 좋을 것 같다.
    //     언제 어디서 다시 session을 쓸지 모르기 때문이다.

    // 새로운 비밀번호 hash 작업 거치기(pre("Save", async function()))
    await user.save();

    req.flash("info", "Password updated.");

    // 비밀번호 변경 후 로그아웃 처리
    return res.redirect("/users/logout");

    // 좀 더 안전하게 처리하는 방법
    // req.session.destroy();
    // return res.redirect("/login");
};

export const seeUser = async (req, res) => {
    const { id } = req.params;
    // populate 추가
    const user = await User.findById(id).populate({
        // 더블 populate
        // path: 가장 먼저 가져 올 populate
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    if (!user) {
        return res.status(404).render("404", { pageTitle: "User not found." });
    }
    return res.render("users/profile", {
        pageTitle: user.name,
        user,
    });
};

export const see2 = async (req, res) => {
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
