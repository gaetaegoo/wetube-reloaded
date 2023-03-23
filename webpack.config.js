const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const BASE_JS = "./src/client/js/";

// resolve(): 경로를 만들어 줌
// console.log(path.resolve(__dirname, "assets", "js"));

// __dirname: 프로젝트 경로 전체, js에서 제공함
// console.log(__dirname);

module.exports = {
    entry: {
        // 여러개의 entry 생성
        main: `${BASE_JS}main.js`,
        videoPlayer: `${BASE_JS}videoPlayer.js`,
        recorder: `${BASE_JS}recorder.js`,
        commentSection: `${BASE_JS}commentSection.js`,
    },
    mode: "development",
    watch: true,
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/styles.css",
        }),
    ],
    output: {
        // 여러개의 entry를 위한 [name] 변수
        filename: "js/[name].js",
        path: path.resolve(__dirname, "assets"),
        clean: true,
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
            {
                test: /\.scss$/,
                // 역순으로 입력하는 이유: webpack은 뒤에서부터 시작하기 때문
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ],
    },
};
