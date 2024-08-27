"use strict";

const BG_COLOR = "#5579ce";
const COLOR_WHITE = "#FFF";

let turn = "PC"; // 게임 차례
let point = 0; // 사용자 획득 점수
let answerCount = 1; // 정답 개수
let answerArr = []; // 정답을 저장하는 배열
let playerSelectionCount = 0; // 사용자 선택 횟수
let isClick = false;

// 게임 시작
function startGame() {
    // 랜덤으로 정답 만들기
    createAnswer();

    // PC가 먼저 정답 선택
    selectAnswerOnPC();
}

// 게임 재시작
function restartGame() {
    initGame();
    initScreen();
    startGame();
}

// 게임 종료
function stopGame() {
    showGameResult();
}

// 게임 설정 초기화
function initGame() {
    turn = "PC";
    point = 0;
    answerCount = 1;
    answerArr = [];
    playerSelectionCount = 0;
}

// 게임 화면 초기화
function initScreen() {
    changeClickFlag(false); //클릭 가능 여부 매개변수로 전달

    turnText.innerHTML = turn; //현재 턴 표시
    pointText.innerHTML = point; //현재 점수 표시
}

// 게임 턴 변경 후 화면 갱신
function changeTurn(changeValue) {
    turn = changeValue; //true(클릭가능)
    turnText.innerHTML = turn; //현재 턴 표시

    if (turn === "YOU") {
        turnText.classList.remove("blink");
        void turnText.offsetWidth; // 레이아웃 강제 업데이트
        turnText.classList.add("blink"); //애니메이션 효과 재시작
    }

    // 눌려있는 버튼이 있다면 하얀색 배경으로 변경
    for (let i = 0; i < items.length; i++) {
        if (items[i].style.backgroundColor !== "rgb(255, 255, 255)") {
            items[i].style.backgroundColor = COLOR_WHITE;
        }
    }
}

// 점수 추가 후 화면 갱신
function addPoint(addValue) {
    point += addValue;
    pointText.innerHTML = point;
}

// 클릭 여부 변경
function changeClickFlag(flagValue) {
    let cursorStyle = "pointer"; //클릭 가능

    isClick = flagValue;

    //클릭 불가능
    if (isClick === false) {
        cursorStyle = "auto";
    }

    //각 item 요소의 커서 스타일 변경
    for (let i = 0; i < items.length; i++) {
        items[i].style.cursor = cursorStyle;
    }
}

// 정답 만들기
//무작위로 생성된 숫자를 answerArr 배열에 추가
function createAnswer() {
    for (let i = 0; i < answerCount; i++) {
        answerArr.push(getRandom(9, 0));
    }
}

// PC가 정답 선택
const items = document.getElementsByClassName("item");

function selectAnswerOnPC() {
            let cnt = 0;
            //비동기 작업이 완료될 때까지 대기
            let selectAnswerPromise = new Promise((resolve, reject) => {
                //타이머: 애니메이션 0.8초마다 실행
                let selectAnswerTimer = setInterval(() => {
            // bgChange 클래스가 부착되어 있다면 제거
            if (items[answerArr[cnt]].classList.contains("bgChange")) {
                items[answerArr[cnt]].classList.remove("bgChange");
                //브라우저가 클래스 제거한 것 인식하도록 함
                void items[answerArr[cnt]].offsetWidth;
            }
            // bgChange 클래스 다시 추가하여 애니메이션 트리거
            items[answerArr[cnt++]].classList.add("bgChange");

            //모든 요소에 애니메이션 적용되면 타이머 중지
            if (cnt === answerCount) {
                clearInterval(selectAnswerTimer);
                //Promise 해결
                resolve();
            }
        }, 800);
    });

    selectAnswerPromise.then(() => {
        // selectAnswerPromise 성공인 경우 실행할 코드
        //0.8초 후 waitGameStart 함수 실행
        setTimeout(waitGameStart, 800);
    });
}

// 게임 시작 전 대기
function waitGameStart() {
    // 정답 아이템에 배경색이 변하는 애니메이션을 주기 위해 부착했던 bgChange 클래스 제거
    for (let i = 0; i < answerArr.length; i++) {
        if (items[answerArr[i]].classList.contains("bgChange")) {
            items[answerArr[i]].classList.remove("bgChange");
        }
    }

    //클릭 가능 상태로 변경
    changeClickFlag(true);
    //사용자 차례로 변경
    changeTurn("YOU");
}

// 난수 생성
function getRandom(max, min) {
    return parseInt(Math.random() * (max - min)) + min;
}

// 사용자 클릭 이벤트
const itemWrapper = document.getElementsByClassName("item-wrapper")[0];

itemWrapper.addEventListener("click", function(e) {
    // isClick 값이 false면 클릭 이벤트가 발생하지 않도록 함
    if (isClick === false) {
        return;
    }

    //data-id 속성 값(사용자가 클릭한 요소)을 정수로 반환
    let targetId = parseInt(e.target.dataset.id);

    checkCorrectAnswer(targetId);
});

//사용자 정답 체크 
function checkCorrectAnswer(targetId) {
    // answerArr의 배열의 해당 요소와 targetid의 요소가 같은지 차례로 비교
    // 일치하면 배열 인덱스 1씩 증가
    if (targetId === answerArr[playerSelectionCount++]) {
        // 배열 인덱스가 증가하다 총 개수와 일치하면 clearStage 함수 호출
        if (playerSelectionCount === answerCount) {
            clearStage();
        }
    } else {
        stopGame();
    }
}

// 스테이지 클리어
const stageClearImg = document.getElementsByClassName("stage-clear")[0];

function clearStage() {
    // 설정값 재설정
    answerCount++;
    answerArr = [];
    playerSelectionCount = 0;
    addPoint(10); //점수 추가

    // 클릭 이벤트가 발생하지 않도록 설정 및 커서 스타일 변경
    changeClickFlag(false);

    //클리어 UI
    stageClearImg.classList.add("show");

    // 2초 후 다음 스테이지 시작
    setTimeout(() => {
        stageClearImg.classList.remove("show");
        changeTurn("PC"); // 턴 변경

        startGame();
    }, 2000);
}


const modalTitle = document.querySelector(".modal__content-title");
const nicknameInput = document.getElementById("nickname");
const resultModal = document.getElementById("result-modal");
// 게임 종료 시 출력 문구
function showGameResult() {

    modalTitle.innerHTML = `
    <h1 class="modal__content-title--result color-red">
        게임 종료!
    </h1>
    <span class="modal__content-title--stage">
        당신의 IQ : <strong>${point}</strong>
    </span>
    `;
    // 닉네임 입력 폼
    nicknameInput.value = "";
    //게임 종료 창 띄워줌
    resultModal.classList.add("show");

}

const rankingModal = document.getElementById("ranking-modal");
// 엔터 키를 눌렀을 때 점수 저장 및 랭킹 표시
nicknameInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); //기본동작 방지
        const nickname = nicknameInput.value.trim(); //닉네임 추출 및 공백 제거

        // 점수 저장
        saveScore(nickname, point);

        // 결과 모달 닫고 랭킹 모달 열기
        resultModal.classList.remove("show");
        // 랭킹 표시
        showRanking();
        rankingModal.classList.add("show");
    }
});

// 점수 저장 함수
function saveScore(nickname, score) {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push({ nickname: nickname, score: score });

    // 점수를 높은 순으로 정렬
    scores.sort((a, b) => b.score - a.score);

    // 상위 10개의 점수만 저장
    if (scores.length > 10) {
        scores = scores.slice(0, 10);
    }

    localStorage.setItem("scores", JSON.stringify(scores));
}

const modalRanking = document.querySelector(".modal__ranking");
// 랭킹 표시 함수
function showRanking() {
    const scores = JSON.parse(localStorage.getItem("scores")) || [];

    modalRanking.innerHTML = `
    <ol>
        ${scores.map((score, index) =>
        `<li>${index + 1}. ${score.nickname} 님의 IQ: ${score.score}</li><br>`
    ).join('')}
    </ol>
        `;
}

const closeRankingButton = document.getElementById("close-ranking-button");
// 랭킹 모달 닫기 버튼 클릭 시 게임 재시작
closeRankingButton.addEventListener("click", function() {
    rankingModal.classList.remove("show");
    restartGame();
});


// isClick이 ture인 경우에만 CSS hover와 비슷한 효과를 주기 위해 JS로 구현
// 아이템 요소에 마우스 over 시
itemWrapper.addEventListener("mouseover", function(e) {
    if (isClick === false) {
        return;
    }

    if (e.target.classList.contains("item") === true) {
        e.target.style.backgroundColor = BG_COLOR;
    }
});

// 아이템 요소에 마우스 out 시
itemWrapper.addEventListener("mouseout", function(e) {
    if (isClick === false) {
        return;
    }

    if (e.target.classList.contains("item") === true) {
        e.target.style.backgroundColor = COLOR_WHITE;
    }
});

const turnText = document.getElementById("turn");
const pointText = document.getElementById("point");

window.onload = function() {
    turnText.innerHTML = turn;
    pointText.innerHTML = point;

    startGame();
}

//callStorageClear();
function callStorageClear(){
    localStorage.clear();
}