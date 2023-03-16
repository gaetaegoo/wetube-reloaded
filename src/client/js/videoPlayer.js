const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

// watch.pug에서 보낸 'div#videoContainer(data-id=video._id)'의 id 정보
// console.log(videoContainer.dataset);

const defaultVolume = 0.5;
let inputVolume = defaultVolume;
let changeVolume = defaultVolume;
video.volume = defaultVolume;

let controlsTimeout = null;
let controlsMovementTimeout = null;

const handlePlayClick = (event) => {
    // paused: true or false를 반환 함
    video.paused = video.paused ? video.play() : video.pause();

    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = (event) => {
    // muted: true or false를 반환
    video.muted = video.muted ? false : true;

    muteBtn.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";

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

const formatTime = (seconds) =>
    new Date(seconds * 1000).toISOString().substring(11, 19);

const handleLoadedMetadata = (event) => {
    // formatTime으로 덮어주기
    // video.duration
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = (event) => {
    // formatTime으로 덮어주기
    // video.currentTime
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
    const {
        target: { value },
    } = event;
    // currentTime: get or set 둘다 가능
    video.currentTime = value;
};

const handleFullscreen = (event) => {
    const fullscreen = document.fullscreenElement;
    if (fullscreen) {
        // exitFullscreen은 document 필요
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    } else {
        // requestFullscreen은 element(videoContainer) 필요
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
    }
};

// 반복되는 부분 함수화
const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = (event) => {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    /*
     * 1. 3초안에 마우스를 움직이면 아래에서 생성된 새로운 timeout을 계속해서 clear 함
     * 2. 하지만 움직이지 않는다면, 아래에서 생성된 새로운 timeout을 clear 하지 않음
     */
    if (controlsMovementTimeout) {
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }
    // 마우스를 움직이지 않는다는 가정하에, 처음 3초는 showing add, 3초 후에는 showing remove
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = (event) => {
    // setTimeout(적용함수, 시간설정)
    // setTimeout은 고유한 id(숫자)값을 계속 준다
    // 그 id 값을 전역변수에 담고(controlsTimeout)
    // handleMouseMove 함수에서 사용하자
    controlsTimeout = setTimeout(hideControls, 3000);
};

const handleEnded = (event) => {
    // watch.pug에서 보낸 id 정보
    const { id } = videoContainer.dataset;
    // fetch: 백엔드로 요청 보내기
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleInputVolume);
volumeRange.addEventListener("change", handleChangeVolume);
// loadedmetadata: 미디어의 첫 번째 프레임이 로딩 완료된 시점에 발생
video.addEventListener("loadeddata", handleLoadedMetadata);
// timeupdate: currentTime 속성이 변경되는 시점에 발생
video.addEventListener("timeupdate", handleTimeUpdate);
// ended는 video에만 적용 가능함
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreen);
