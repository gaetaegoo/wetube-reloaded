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
const textarea = document.getElementById("textarea");

// watch.pug에서 보낸 'div#videoContainer(data-id=video._id)'의 id 정보
// console.log(videoContainer.dataset);

const defaultVolume = 0.5;
let inputVolume = defaultVolume;
let changeVolume = defaultVolume;
video.volume = defaultVolume;

let controlsTimeout = null;
let controlsMovementTimeout = null;

let videoStatus = false;

// 재생 및 일시정지
const handlePlayClick = (event) => {
    // paused: true or false를 반환 함
    video.paused = video.paused ? video.play() : video.pause();

    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

// 영상이 끝나면 일시정지 아이콘이 플레이 아이콘으로 바뀜
const handlePlayBtnIcon = (event) => {
    playBtnIcon.classList = "fas fa-play";
};

// 볼륨 조절
const handleMuteClick = (event) => {
    // muted: true or false를 반환
    video.muted = video.muted ? false : true;

    muteBtnIcon.classList = video.muted
        ? "fas fa-volume-mute"
        : "fas fa-volume-up";

    /**
     * 1. 볼륨을 최대로 내릴 때, inputVolume은 값이 계속 내려가면서 저장
     * 2. 따라서 inputVolume은 changeVolume보다 값이 클 수 없음(고정 상황)
     * 3. 만약 음소거(video.volume === 0)시 'changeVolume > inputVolume'라면,
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

// input은 움직이면서 계속 변화
const handleInputVolume = (event) => {
    const {
        target: { value },
    } = event;

    if (video.muted) {
        video.muted = false;
        muteBtnIcon.classList = "fas fa-volume-up";
    }

    if (video.volume === 0) {
        video.muted = true;
        muteBtnIcon.classList = "fas fa-volume-mute";
    }

    inputVolume = value;
    video.volume = value;
};

// change는 요소 변경이 끝나면 발생
function handleChangeVolume(event) {
    const {
        target: { value },
    } = event;

    if (video.volume === 0) {
        video.muted = true;
        muteBtnIcon.classList = "fas fa-volume-mute";
    } else {
        changeVolume = value;
    }
}

// 타임라인
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

// 타임라인 마우스로 옮길 때 재생 상태 변화
const handleTimelineMousedown = () => {
    videoStatus = video.paused ? false : true;
    video.pause();
};

const handleTimelineMouseup = () => {
    if (videoStatus) {
        video.play();
    } else {
        video.pause();
    }
};

// 전체 화면
const handleFullscreen = (event) => {
    // fullscreenElement, exitFullscreen은 document 필요
    const fullscreen = document.fullscreenElement;
    if (fullscreen) {
        document.exitFullscreen();
    } else {
        // requestFullscreen은 element(videoContainer) 필요
        videoContainer.requestFullscreen();
    }
};

// ESC로 전체 화면 종료 시, 전체 화면 버튼 원상 복구
const handleFullScreenBtn = (event) => {
    const fullScreen = document.fullscreenElement;
    if (fullScreen) {
        fullScreenIcon.classList = "fas fa-compress";
    } else {
        fullScreenIcon.classList = "fas fa-expand";
    }
};

// 반복되는 부분 함수화
// const hideControls = () => videoControls.classList.remove("showing");

/**
 * setTimeout: 일정 시간이 지난 후에 함수가 실행
 * clearTimeout: setTimeout을 취소하는 함수
 * NodeJS에서 setTimeout을 호출 하면, 타이머 식별자(timer identifier)가 반환 됨(콘솔로 찍어보자)
 */

/**
 * 비디오 내에 마우스 움직임이 있다면 계속 controls를 showing하는 클래스를 부여,
 * 동시에 마우스 움직임의 멈춤을 대비하여 showing클래스를 제거하는 setTimeout 을 움직임마다 실행
 */
const handleMouseMove = (event) => {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    videoControls.classList.add("showing");
    // controlsTimeout = setTimeout(() => {
    //     videoControls.classList.remove("showing");
    // }, 3000);
};

// const handleMouseMove = (event) => {
//     if (controlsTimeout) {
//         clearTimeout(controlsTimeout);
//         controlsTimeout = null;
//     }
//     /*
//      * 1. 3초안에 마우스를 움직이면 아래에서 생성된 새로운 timeout을 계속해서 clear 함
//      * 2. 하지만 움직이지 않는다면, 아래에서 생성된 새로운 timeout을 clear 하지 않음
//      */
//     if (controlsMovementTimeout) {
//         clearTimeout(controlsMovementTimeout);
//         controlsMovementTimeout = null;
//     }
//     // 마우스를 움직이지 않는다는 가정하에, 처음 3초는 showing add, 3초 후에는 showing remove
//     videoControls.classList.add("showing");
//     controlsMovementTimeout = setTimeout(hideControls, 3000);
//     console.log(controlsMovementTimeout);
// };

// const handleMouseLeave = (event) => {
//     // setTimeout(적용함수, 시간설정)
//     // setTimeout은 고유한 id(숫자)값을 계속 준다(콘솔로 찍어보면 앎)
//     // 그 id 값을 전역변수에 담고(controlsTimeout)
//     // handleMouseMove 함수에서 사용하자
//     controlsTimeout = setTimeout(hideControls, 3000);
//     console.log(controlsTimeout);
// };

// 영상 끝나면 조회수 증가
const handleEnded = (event) => {
    // watch.pug에서 보낸 id 정보
    const { id } = videoContainer.dataset;
    // fetch: 백엔드로 요청 보내기
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    });
};

// Space로 재생 및 일시정지
const handlePlaySpace2 = (event) => {
    event.preventDefault();
    if (event.code === "Space" && event.target.id !== textarea) {
        handlePlayClick();
    }
};

const handlePlaySpace = (event) => {
    if (event.target !== textarea && event.code == "Space") {
        handlePlayClick();
    }
};

// 키보드 방향키로 타임라인 Skip
const handleSkipArrow = (event) => {
    if (event.target !== textarea && event.code === "ArrowRight") {
        video.currentTime += 5;
    }
    if (event.target !== textarea && event.code === "ArrowLeft") {
        video.currentTime -= 5;
    }
};

// 키보드 m버튼으로 뮤트
const handleMuteKeyM = (event) => {
    if (event.target !== textarea && event.code === "KeyM") {
        handleMuteClick();
    }
};

playBtn.addEventListener("click", handlePlayClick);
video.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handlePlayBtnIcon);

muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleInputVolume);
volumeRange.addEventListener("change", handleChangeVolume);

// loadedmetadata: 미디어의 첫 번째 프레임이 로딩 완료된 시점에 발생
video.addEventListener("loadeddata", handleLoadedMetadata);
// timeupdate: currentTime 속성이 변경되는 시점에 발생
video.addEventListener("timeupdate", handleTimeUpdate);
// videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);

videoContainer.addEventListener("mousemove", handleMouseMove);

// ended는 video에만 적용 가능함
video.addEventListener("ended", handleEnded);

timeline.addEventListener("mousedown", handleTimelineMousedown);
timeline.addEventListener("mouseup", handleTimelineMouseup);

fullScreenBtn.addEventListener("click", handleFullscreen);
videoContainer.addEventListener("fullscreenchange", handleFullScreenBtn);

window.addEventListener("keydown", handlePlaySpace);
window.addEventListener("keydown", handleSkipArrow);
window.addEventListener("keydown", handleMuteKeyM);
