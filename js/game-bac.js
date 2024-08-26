const LAST_ROUND = 9;
const ANSWER_SIZE = 3;

let answer = [];
let round = 1;
let isPlay = true;
let isStopScreen = false;
let isShowAlertModal = false;

function startGame() {
    // 정답 생성
    createAnswer();
}

function stopGame(isWin) {
    isPlay = false;

    showGameResult(isWin);
    stopScreen();
}

function restartGame() {
    clearModals();
    initGame();
    initScreen();
    startGame();
}

function initGame() {
    answer = [];
    round = 1;
    isPlay = true;
}

function initScreen() {
    for (let i = 0; i < LAST_ROUND; i++) {
        // 스코어 보드 초기화
        recordList[i].getElementsByTagName("td")[0].innerHTML = '';
        recordList[i].getElementsByTagName("td")[1].innerHTML = '';
    }

    if (isStopScreen === true) {
        for (let i = 0; i < ANSWER_SIZE; i++) {
            formInput[i].readOnly = false;
            formInput[i].style.backgroundColor = "#FFF";
            formInput[i].style.fontWeight = "400";
        }

        formButton.disabled = false;
        formButton.style.cursor = "pointer";
        formButton.style.backgroundColor = "#FFF";
    }

    for (let i = 0; i < ANSWER_SIZE; i++) {
        formInput[i].value = '';
    }
    num1.focus();

    restartButton.classList.remove("blink");
}

// 게임 종료 후 재시작 전까지 게임 진행할 수 없도록 화면 조정
function stopScreen() {
    isStopScreen = true;

    for (let i = 0; i < ANSWER_SIZE; i++) {
        formInput[i].value = answer[i]; // 정답 출력
        formInput[i].readOnly = true;
        formInput[i].style.backgroundColor = "#CCC";
        formInput[i].style.fontWeight = "700";
    }

    formButton.disabled = true;
    formButton.style.cursor = "auto";
    formButton.style.backgroundColor = "#CCC";
}

// 정답 생성(4자리 수)
function createAnswer() {
    for (let i = 0; i < ANSWER_SIZE; i++) {
        let randomNumber = getRandom(10, 0);

        if (answer.indexOf(randomNumber) === -1) {
            answer.push(randomNumber);
        } else {
            i--;
        }
    }
    console.table(answer);
}

// 게임 재시작 버튼 클릭 이벤트
const restartButton = document.getElementById("restart-button");

restartButton.addEventListener("click", function() {
    restartGame();
});

// 사용자 입력값 유효성 검사
const formInputWrapper = document.getElementsByClassName("form__input-wrapper")[0];
const num1 = document.getElementById("num1");
const num2 = document.getElementById("num2");
const num3 = document.getElementById("num3");
// const num4 = document.getElementById("num4");

// 키 입력 이벤트
formInputWrapper.addEventListener("keyup", function(e) {
    if (isPlay === false) {
        return;
    }

    // 엔터키로 값 확인 / 경고 모달창 닫기를 함께 사용 중에
    // 모달창을 닫기위해 엔터를 눌렀을 때도 값 확인이 바로 진행되어 모달창이 연속해서 계속 뜨는 오류 발생
    // 해결을 위하여 0.1초 지연 후 플래그를 바꿔주도록 하였음
    if (isShowAlertModal === true) {
        let timer = setTimeout(() => {
            isShowAlertModal = false;
        }, 10);
    }

    // 입력값이 0-9가 아니면 value값을 공백으로 변경
    const regExp = /[^0-9]/g;

    if (regExp.test(e.target.value)) {
        e.target.value = "";
    }

    // 값 입력 시 자동으로 다음 필드로 이동
    if (e.target.value.length === 1 && e.target.nextElementSibling) {
        e.target.nextElementSibling.focus();
    }

    // 엔터 입력 시 값 검사
    if (e.code === "Enter" && isShowAlertModal === false) {
        checkInput();
    }
});

// 확인 버튼 클릭 시 검사
// 1. 빈값 체크
// 2. 중복 체크
function checkInput() {
    // 검사할 요소 변수에 저장
    // let numArr = [num1.value, num2.value, num3.value, num4.value];
    let numArr = [num1.value, num2.value, num3.value];


    // 빈값 체크
    for (let i = 0; i < ANSWER_SIZE; i++) {
        if (!numArr[i]) {
            isShowAlertModal = true;
            showAlert("숫자를 전부 입력해주세요.");
            return;
        }
    }

    // 중복 체크
    let numSet = new Set(numArr); // 중복을 허용하지 않는 Set 객체에 array 대입

    if (numArr.length > numSet.size) {
        isShowAlertModal = true;
        showAlert("중복된 숫자가 있어요!");
        return;
    }

    checkCorrectAnswer();
}

// 유효성 검사 통과 시 정답 판별
const formButton = document.getElementById("bat-form-button");
const formInput = document.getElementsByClassName("form__input");

function checkCorrectAnswer() {
    let userInputArr = [];

    for (let i = 0; i < ANSWER_SIZE; i++) {
        userInputArr.push(parseInt(formInput[i].value));
    }

    let result = checkResult(userInputArr);

    // 화면에 기록 갱신
    showRecord(userInputArr, result);

    // 게임 진행 체크
    checkGameProgress(result);
}

// 입력값 체크
function checkResult(userInputArr) {
    // 아웃인 경우
    if (checkUserOut(userInputArr) === true) {
        return "out";
    }

    // 아웃이 아닌 경우
    return checkHit(userInputArr);
}

// 아웃인지 체크
function checkUserOut(userInputArr) {
    for (let i = 0; i < ANSWER_SIZE; i++) {
        if (answer.indexOf(userInputArr[i]) !== -1) {
            return false;
        };
    }

    return true;
}

// 볼인지 스트라이크인지 체크
function checkHit(userInputArr) {
    let result = { ball: 0, strike: 0 };

    for (let i = 0; i < ANSWER_SIZE; i++) {
        if (answer.indexOf(userInputArr[i]) !== -1) {
            // 볼인지 스트라이크인지 체크
            if (answer.indexOf(userInputArr[i]) === i) {
                result.strike++;
            } else {
                result.ball++;
            }
        }
    }

    return result;
}

// 게임 진행 체크
function checkGameProgress(result) {
    // if (result.strike === 4) {
    //     stopGame(true);
    //     return;
    // }
    if (result.strike === 3) {
        stopGame(true);
        return;
    }

    if (round === LAST_ROUND) {
        stopGame(false);
        return;
    }

    moveNextRound();
}

// 화면에 기록 갱신
const recordList = document.getElementById("record-list").getElementsByTagName("tr");

function showRecord(userInputArr, result) {
    let userInputRecord = recordList[round-1].getElementsByTagName("td")[0];
    let hitRecord = recordList[round-1].getElementsByTagName("td")[1];

    // 사용자 입력값 출력
    for (let i = 0 ; i < ANSWER_SIZE; i++) {
        if (i === ANSWER_SIZE - 1) {
            userInputRecord.innerHTML = userInputRecord.innerHTML + userInputArr[i];
        } else {
            userInputRecord.innerHTML = userInputRecord.innerHTML + userInputArr[i] + ",&nbsp;";
        }
    }

    // 결과 출력
    if (result === "out") {
        hitRecord.innerHTML = hitRecord.innerHTML + "아웃";
        return;
    }

    hitRecord.innerHTML = hitRecord.innerHTML + `${result.ball}볼, ${result.strike}스트라이크`;
}

// 다음 라운드로 이동
function moveNextRound() {
    // input값 초기화
    for (let i = 0; i < ANSWER_SIZE; i++) {
        formInput[i].value = '';
    }
    num1.focus();

    // 라운드 카운트 추가
    round++;
}

// 난수 생성
function getRandom(max, min) {
    return parseInt(Math.random() * (max - min)) + min;
}

// info 모달창 열기
const infoButton = document.getElementById("info-button");

infoButton.addEventListener("click", function() {
    infoModal.classList.add("show");
});

// info 모달창 닫기
const infoModal = document.getElementById("info-modal");
const infoModalCloseButton = document.getElementById("info-modal-close-button");

infoModal.addEventListener("click", function(e) {
    if (e.target === infoModal || e.target === infoModalCloseButton) {
        infoModal.classList.remove("show");
        num1.focus();
    }
});

//커스텀 KNY
//랭킹 등록 모달창 열기




// 경고 모달창 출력
const alertModalTitle = document.getElementById("alert-modal-title");

function showAlert(alertMsg) {
    alertModalTitle.innerHTML = `
    <span class="modal__content-title--alert color-red">
        📢 ${alertMsg}
    </span>
    `;

    alertModal.classList.add("show");
}

// 경고 모달창 닫기
const alertModal = document.getElementById("alert-modal");
const alertModalCloseButton = document.getElementById("alert-modal-close-button");

alertModal.addEventListener("click", function(e) {
    if (e.target === alertModal || e.target === alertModalCloseButton) {
        alertModal.classList.remove("show");
    }
});

// 게임 종료 시 결과 출력
const gameResultImg = document.getElementsByClassName("game-result")[0];

//결과 모달창 닫기
const resultmodalclosebtn = document.getElementById("result-modal-close-button");
resultmodalclosebtn.addEventListener("click", function(e) {
    document.getElementById("result-modal").classList.remove("show");
});

//커스텀 KNY
//모달 계층 2번째에 창 추가 모달계층 첫번째는 인포메이션 창이다.
const modal = document.getElementsByClassName("modal")[1];
const modalTitle = document.getElementsByClassName("modal__content-title")[1];


function showGameResult(isWin) {
    playerScore = 100 - 10 * (round - 1); // 게임 점수 계산

    // Win 이미지 모달 활성화
    if (isWin) {
        gameResultImg.style.backgroundImage = `url('img/common/win.png')`;
        gameResultImg.classList.add("show");

        // 2초 후 Win 이미지 모달 제거 및 점수 모달 활성화
        setTimeout(() => {
            gameResultImg.classList.remove("show");

            document.getElementById('final-score').textContent = playerScore.toString();
            document.getElementById("result-modal").classList.add("show");
            //document.getElementById('game-result-modal').classList.add('show');
        }, 2000);
    } else {
        gameResultImg.style.backgroundImage = `url('img/common/lose.png')`;
        gameResultImg.classList.add("show");

        // 패배 이미지는 2초 후 사라짐
        setTimeout(() => {
            gameResultImg.classList.remove("show");
        }, 2000);
    }
}

//결과창 랭킹창
const resultmodal = document.getElementById("result-modal");
const rankingmodal = document.getElementById("ranking-modal");

//esc로 변경
// 엔터키 클릭으로 모달창 닫기
document.addEventListener("keydown", function(e) {
    if (infoModal.classList.contains("show")) {
        if (e.code === "Escape") {
            infoModal.classList.remove("show");
        }
    }

    if (alertModal.classList.contains("show")) {
        if (e.code === "Escape" && isShowAlertModal === true) {
            alertModal.classList.remove("show");
        }
    }

    //커스텀 KNY
    if(modal.classList.contains("show")){
        if (e.code === "Escape") {
            modal.classList.remove("show");
        }
    }

    //결과창에서 입력
    if(resultmodal.classList.contains("show")){
        if (e.code === "Escape") {
            resultmodal.classList.remove("show");
        }
        if (e.code === "Enter") {
            saveScore();
        }
    }

    //랭킹 창에서 입력
    if(rankingmodal.classList.contains("show")){
        if (e.code === "Escape") {
            rankingmodal.classList.remove("show");
        }
    }
});

window.onload = function() {
    startGame();
};


//커스텀 KNY
function registerNameScore( _name) {
    playerScore = 100 - 10*(round-1);
    localStorage.setItem("nameScore", playerScore);

}

//로컬 스토리지는 각 페이지마다 + 각 브라우저 마다 따로 관리되는 자료구조 키 밸류
function startLocalStorage(storageName, isClear){
    if(isClear){
        localStorage.removeItem(storageName);
        console.log("해당 아이템 지웠어요.")
        return;
    }
    else{
        if(!localStorage.getItem(storageName)) {
            console.log("해당 이름은 있네요");
        }else{
            console.log("해당 이름이 없으므로 값을 생성합니다.");
            registerNameScore(storageName);
        }
    }
}

//커스텀 GPT센세
function saveScore() {
    let playerName = document.getElementById('player-name').value;
    let score = document.getElementById('final-score').textContent;

    if (!playerName) {
        alert("닉네임을 입력해주세요.");
        return;
    }

    let scores_baseball = JSON.parse(localStorage.getItem('scores_baseball')) || [];
    scores_baseball.push({ name: playerName, score: parseInt(score) });
    scores_baseball.sort((a, b) => b.score - a.score);

    if (scores_baseball.length > 10) {
        scores_baseball.length = 10; // 상위 10개만 저장
    }

    localStorage.setItem('scores_baseball', JSON.stringify(scores_baseball));

    // 점수 모달 창 닫기
    resultmodal.classList.remove('show');

    // 랭킹 모달 창 표시
    showRankings();
}

function showRankings() {
    let scores_baseball = JSON.parse(localStorage.getItem('scores_baseball')) || [];
    let modalContent = '<ul>';
    scores_baseball.forEach((entry, index) => {
        if(index===0){
            modalContent += `<li>🌟${index + 1}. ${entry.name} - ${entry.score}점</li>`;

        }
        modalContent += `<li>${"  "}${index + 1}. ${entry.name} - ${entry.score}점</li>`;
    });
    modalContent += '</ul>';
    document.getElementById('ranking-list').innerHTML = modalContent;
    document.getElementById('ranking-modal').classList.add('show');
}

function clearModals() {
    // 모든 모달 창을 숨깁니다.
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

console.log("만약 스토리지 청소 하고 싶으면 clearStorage() 호출하세요.");
//kny custom
function clearStorage(){
    localStorage.clear();
}