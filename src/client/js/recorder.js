import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { async } from "regenerator-runtime";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

// 전역 변수
let stream;
let recorder;
let videoFile;

// 반복되는 str 함수화
const files = {
    input: "recoding.webm",
    output: "output.mp4",
    thumb: "thumbnail.jpg",
};

// 반복되는 다운로드 작업 함수화
const downloadFile = (fileUrl, fileName) => {
    const mp4A = document.createElement("a");
    mp4A.href = fileUrl;
    mp4A.download = fileName;
    document.body.appendChild(mp4A);
    mp4A.click();
};

const handleDownload = async (event) => {
    actionBtn.removeEventListener("click", handleDownload);
    actionBtn.innerText = "Transcoding..";
    actionBtn.disabled = true;

    // instance를 만들어 주고 log는 true, 콘솔에서 확인하려고
    const ffmpeg = createFFmpeg({ log: true });
    // await하는 이유: 사용자가 소프트웨어를 사용할 것이기 때문
    await ffmpeg.load();

    // writeFile: ffmpeg의 가상 세계에 파일을 생성
    // ffmpeg.FS(옵션, 파일명, binary data)
    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

    /**
     * "-i": input
     * 위에서 만들어 놓은 가상의 파일(recoding.webm)을 input으로 받음
     * "-r", "60": 영상을 초당 60프레임으로 만들기
     */
    await ffmpeg.run("-i", files.input, "-r", "60", files.output);

    // "-ss", "00:00:01": 영상의 특정 시간대로 감
    // "-frames:v", "1": 첫 프레임의 스크린샷 찍어줌
    await ffmpeg.run(
        "-i",
        files.input,
        "-ss",
        "00:00:01",
        "-frames:v",
        "1",
        files.thumb
    );

    /**
     * 가상의 파일을 readFile로 불러오기
     * 이 파일은 'Unit8Array(array of 8-bit unsigned integers)'
     * unsigned integers: 양수로만 이루어진 정수들
     * Unit8Array로 부터 blob을 만들 수는 없고, ArrayBuffer로는 가능
     * Unit8Array: 내가 하고 싶은 대로 할 수 있는 파일(합치기, 나누기, 수정하기 등)
     * ArrayBuffer: raw data에 접근할 때 필요함
     */
    const mp4File = ffmpeg.FS("readFile", files.output);
    // console.log(
    //     "🚀 ~ file: recorder.js:29 ~ handleDownload ~ mp4File:",
    //     mp4File,
    //     mp4File.buffer
    // );
    const thumbFile = ffmpeg.FS("readFile", files.thumb);

    // buffer를 사용하여 blob을 만들고, JS에게 type 알려주기
    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
    const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

    // createObjectURL로 마법의 url 만들기
    const mp4Url = URL.createObjectURL(mp4Blob);
    const thumbUrl = URL.createObjectURL(thumbBlob);

    // 아래 주석 처리한 다운로드(mp4, image)함수들
    downloadFile(mp4Url, "MyRecording.mp4");
    downloadFile(thumbUrl, "MyThumbnail.jpg");

    // const mp4A = document.createElement("a");
    // // 비디오파일로 갈 수 있는 url
    // mp4A.href = mp4Url;
    // // a태그에 download 속성을 주면 다운로드를 시켜 줌
    // mp4A.download = "MyRecording.mp4";
    // // body에 a태그 추가
    // document.body.appendChild(mp4A);
    // // 사용자가 링크를 클릭한 것처럼 작용
    // mp4A.click();

    // 다운로드 후 비디오 재생 멈춤
    // video.pause();
    // video.src = "";
    // stream.getTracks()[0].stop();\

    // const thumbA = document.createElement("a");
    // // 비디오파일로 갈 수 있는 url
    // thumbA.href = thumbUrl;
    // // a태그에 download 속성을 주면 다운로드를 시켜 줌
    // thumbA.download = "MyThumbnail.jpg";
    // // body에 a태그 추가
    // document.body.appendChild(thumbA);
    // // 사용자가 링크를 클릭한 것처럼 작용
    // thumbA.click();

    // 속도를 위해서, 임의로 만들어진 가상의 파일들 unlink
    ffmpeg.FS("unlink", files.input);
    ffmpeg.FS("unlink", files.output);
    ffmpeg.FS("unlink", files.thumb);

    // 메모리에 저장된 가상의 url 지우기
    URL.revokeObjectURL(videoFile);
    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumbUrl);

    // 처음부터 다시 시작
    actionBtn.disabled = false;
    actionBtn.innerText = "Record Again";
    actionBtn.addEventListener("click", handleStart);
};

// const handleStop = (event) => {
//     actionBtn.innerText = "Download Recording";
//     actionBtn.removeEventListener("click", handleStop);
//     actionBtn.addEventListener("click", handleDownload);
//     recorder.stop();
// };

const handleStart = (event) => {
    // 핸들스탑 없애고 새로 들어옴
    actionBtn.innerText = "Recording";
    actionBtn.disabled = true;

    actionBtn.removeEventListener("click", handleStart);

    // MediaRecorder: 비디오 녹화 코드
    // recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    // ondataavailable: BlobEvent, 비디오가 멈추면 발생되는 이벤트 핸들러(addEventListener)
    recorder.ondataavailable = (event) => {
        // console.log("recoding done");
        // console.log(event);

        /**
         * 브라우저 메모리에서만 가능한 URL을 만들어 줌(실제로는 진짜 url을 만든 게 아님)
         * 이 url은 서버에 있는 게 아니라, 브라우저를 닫기 전까지만 브라우저에 있음
         * event.date에 binary data(2진법)가 있음
         */
        videoFile = URL.createObjectURL(event.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
        // 핸들스탑 없애고 새로 들어옴
        actionBtn.innerText = "Download";
        actionBtn.disabled = false;
        actionBtn.addEventListener("click", handleDownload);
    };
    // console.log(recorder); // inactive
    recorder.start();
    // console.log(recorder); // recoding

    // 5초동안만 녹화
    setTimeout(() => {
        recorder.stop();
    }, 5000);
};

// front-end에서 'async + await'를 쓰려면 'regeneratorRuntime을' 꼭 설치
// npm i regenerator-runtime
const init = async (event) => {
    // navigator.mediaDevices.getUserMedia(): 마법같은 이 코드를 기억하자
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        // 크기 지정
        video: {
            width: 1024,
            height: 576,
        },
    });
    // srcObject: url에선 src를 쓰지만, media에선 srcObject를 쓴다
    video.srcObject = stream;
    video.play();
};

init();

actionBtn.addEventListener("click", handleStart);
