const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

// 전역 변수
let stream;
let recorder;
let videoFile;

const handleDownload = (event) => {
    const a = document.createElement("a");
    // 비디오파일로 갈 수 있는 url
    a.href = videoFile;
    // a태그에 download 속성을 주면 다운로드를 시켜 줌
    a.download = "MyRecording.webm";
    // body에 a태그 추가
    document.body.appendChild(a);
    // 사용자가 링크를 클릭한 것처럼 작용
    a.click();
};

const handleStop = (event) => {
    startBtn.innerText = "Download Recording";
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleDownload);
    recorder.stop();
};

const handleStart = (event) => {
    /**
     * 1. 버튼의 텍스트 부분을 바꿈(Start Recoding -> Stop Recoding)
     * 2. EventListener를 제거(Stop Recoding 유지)
     * 3. 새로운 EventListener를 추가(Download Recoding 시작)
     * 4.
     */
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);

    // MediaRecorder: 비디오 녹화 코드
    // recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    // ondataavailable: BlobEvent, 비디오가 멈추면 발생되는 event
    recorder.ondataavailable = (event) => {
        // console.log("recoding done");
        // console.log(event);
        // 브라우저 메모리에서만 가능한 URL을 만들어 줌(실제로는 진짜 url을 만든 게 아님)
        videoFile = URL.createObjectURL(event.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    };
    // console.log(recorder); // inactive
    recorder.start();
    // console.log(recorder); // recoding

    // 5초동안만 녹화
    // setTimeout(() => {
    //     recorder.stop();
    // }, 5000);
};

// front-end에서 'async + await'를 쓰려면 'regeneratorRuntime을' 꼭 설치
// npm i regenerator-runtime
const init = async (event) => {
    // navigator.mediaDevices.getUserMedia(): 마법같은 이 코드를 기억하자
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    });
    // srcObject: url에선 src를 쓰지만, media에선 srcObject를 쓴다
    video.srcObject = stream;
    video.play();
};

init();

startBtn.addEventListener("click", handleStart);
