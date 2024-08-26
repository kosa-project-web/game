"use strict";

// 게임 기본 스피드 0.3초로 설정
let speed = 300;

// 게임 회차 및 승패 정보 저장
let count = 0;
let winCount = 0;
let drawCount = 0;
let loseCount = 0;
let playerScore = 0;
let pcScore = 0;

let playerLife = 3;

let timer = 0;
let lastPcSelection = "";
let pcSelection = "";

// 컴퓨터의 가위, 바위, 보 선택을 변경하는 함수
function changePcSelection() {
    while (true) {
        pcSelection = getRandom();

        // 이전 선택과 동일하지 않은 값이 나올 때까지 반복
        if (pcSelection !== lastPcSelection) {
            lastPcSelection = pcSelection;
            break;
        }
    }

    // 선택된 값에 따라 이미지와 alt 속성을 변경
    switch (pcSelection) {
        case 0:
            pcImage.src = "img/game-rps/scissors.png";
            pcImage.alt = "컴퓨터 선택: 가위";
            break;

        case 1:
            pcImage.src = "img/game-rps/rock.png";
            pcImage.alt = "컴퓨터 선택: 바위";
            break;

        case 2:
            pcImage.src = "img/game-rps/paper.png";
            pcImage.alt = "컴퓨터 선택: 보";
            break;

        default:
    }
}

// 0부터 2까지의 랜덤 숫자를 반환하는 함수
function getRandom() {
    return parseInt(Math.random() * 3);
}

const buttonWrapper = document.getElementsByClassName("game__button-wrapper")[0];
const scissorsButton = document.getElementById("scissors-button");
const rockButton = document.getElementById("rock-button");
const papersButton = document.getElementById("paper-button");

// 버튼 클릭 이벤트를 통해 사용자의 선택을 받아서 게임을 진행
buttonWrapper.addEventListener("click", function(e) {
    let playerSelection = "";

    // 선택된 버튼에 따라 playerSelection 값을 설정
    if (e.target === scissorsButton) {
        playerSelection = 0;
    } else if (e.target === rockButton) {
        playerSelection = 1;
    } else if (e.target === papersButton) {
        playerSelection = 2;
    } else {
        return;
    }

    // 게임 로직을 처리하는 함수 호출
    rockPaperSissors(playerSelection);
});

// 가위 바위 보 게임의 메인 로직을 처리하는 함수
function rockPaperSissors(playerSelection) {
    count++;

    // 컴퓨터의 선택을 멈추기 위해 타이머 중지
    clearInterval(timer);

    // 게임의 승패 결과를 확인
    let result = checkMatchResult(playerSelection, pcSelection);

    // 결과를 화면에 표시
    showMatchResult(result, playerSelection, pcSelection);

    // 플레이어의 생명이 다하면 게임 종료, 그렇지 않으면 다음 라운드를 준비
    if (playerLife === 0) {
        showGameResult();
    } else {
        restartGameAfterExitModal();
    }
}

// 플레이어와 컴퓨터의 선택을 비교해 결과를 반환하는 함수
function checkMatchResult(player, pc) {
    let result = player - pc;

    if (result === 0) {
        drawCount++;
        return 1; // 무승부
    } else if (result === -2 || result === 1) {
        winCount++;
        return 2; // 플레이어 승리
    } else if (result === -1 || result === 2) {
        loseCount++;
        return 0; // 플레이어 패배
    }
}

const roundModal = document.getElementById("round-modal");
const endModal = document.getElementById("end-modal");
const rankModal = document.getElementById("rank-modal");

const modalTitle = document.querySelector("#round-modal .modal__content-title");
const endModalTitle = document.querySelector("#end-modal .modal__content-title");
const rankModalTitle = document.getElementById("ranking-content");

const playerScoreItem = document.getElementById("score-player");
const pcScoreItem = document.getElementById("score-pc");

function showMatchResult(result, player, pc) {
    if (result !== 1 || result !== null) {
        calculateScore(result);
    }

    if (result === 0) {
        playerLife -= 1;
    } else if (result === 2) {
        playerLife += 1;
    }
    playerLifeItem.innerText = playerLife;

    if (playerLife > 0) {
        showRoundResult(result, player, pc);
    } else {
        showGameResult();
    }
}

// 라운드 종료 후 결과를 화면에 표시하는 함수
function showRoundResult(result, player, pc) {
    let colorList = ["color-red", "color-green", "color-blue"];
    let heartList = ["./img/common/broken-heart.png", "", "./img/common/heart.png"];
    let resultList = ["패배", "무승부", "승리"];
    let rpsList = ["✌", "✊", "✋"];

    // 결과를 반영한 HTML 코드 설정
    modalTitle.innerHTML = `
        <h1 class="modal__content-title--result ${colorList[result]}">
            ${resultList[result]}!<br />
        </h1>
        <figure class="modal__content-title--result-life">
            <img class="modal__content-title--result-life-img" src="${heartList[result]}" onerror="this.style.display='none'" />
        </figure>
        <p class="modal__content-title--desc">
            PC : ${rpsList[pc]}<br />
            Player : ${rpsList[player]}
        </p>
    `;

    // 승패 결과에 따라 애니메이션 적용
    const resultLifeItem = document.getElementsByClassName("modal__content-title--result-life")[0];
    resultLifeItem.style.animation = "blinkingEffect 400ms 6 alternate";

    // 모달을 화면에 표시
    roundModal.style.display = "block";
}

// 게임 종료 시 결과를 표시하고 게임 종료 모달을 보여주는 함수
function showGameResult() {
    endModalTitle.innerHTML = `
    <h1 class="modal__content-title--result color-red">
        게임 종료!
    </h1>
    <span class="modal__content-title--score">
        점수 : <strong>${playerScore}</strong>점
    </span>
    <p class="modal__content-title--desc">
        총 ${count}번의 대결 동안<br />
        <span class="color-blue">${winCount}번</span>의 승리<br />
        <span class="color-red">${loseCount}번</span>의 패배<br />
        <span class="color-green">${drawCount}번</span>의 무승부가<br />
        있었습니다.
    </p>
    <p id="ranking-message" class="color-blue" style="display:none; margin-top: 10px;">랭킹이 등록 되었습니다.</p>
    `;

    endModal.style.display = "block";
}

// 점수 저장 버튼 클릭 시 동작하는 함수
document.getElementById("save-score").addEventListener("click", function() {
    const nicknameInput = document.getElementById("nickname");
    const nickname = nicknameInput.value;
    const rankingMessage = document.getElementById("ranking-message");

    // 닉네임이 입력된 경우에만 점수를 저장하고 메시지를 표시
    if (nickname) {
        saveScore(nickname, playerScore);
        rankingMessage.style.display = 'block'; // 메시지 표시
        nicknameInput.value = ""; // 닉네임 입력 칸 비우기
    } else {
        alert("닉네임을 입력해주세요.");
    }
});

// 랭킹 버튼 클릭 시 동작하는 함수
document.getElementById("rank-button").addEventListener("click", function() {
    showRankingModal();
});

// 랭킹 모달을 표시하고 상위 10개의 랭킹을 보여주는 함수
function showRankingModal() {
    const scores = JSON.parse(localStorage.getItem("scores")) || [];

    // 점수를 기준으로 내림차순 정렬
    scores.sort((a, b) => b.score - a.score);

    const topScores = scores.slice(0, 10); // 상위 10개만 선택

    // 랭킹 목록을 생성
    let rankingHtml = '<h1 class="modal__content-title--result color-blue">랭킹 상위 10</h1>';
    rankingHtml += '<ul>';

    topScores.forEach((entry, index) => {
        rankingHtml += `<li>${index + 1}. ${entry.nickname} - ${entry.score}점</li>`;
    });

    rankingHtml += '</ul>';

    // 생성된 HTML을 모달에 삽입하고 모달을 표시
    rankModalTitle.innerHTML = rankingHtml;
    rankModal.style.display = "block";
}

// 랭킹 모달 닫기 버튼 클릭 시 동작하는 함수
document.getElementById("close-ranking").addEventListener("click", function() {
    rankModal.style.display = "none";
});

// 모달 바깥을 클릭해도 모달이 닫히도록 처리
window.addEventListener("click", function(event) {
    if (event.target === roundModal) {
        roundModal.style.display = "none";
        restartGame();
    } else if (event.target === endModal) {
        endModal.style.display = "none";
        restartGame();
    } else if (event.target === rankModal) {
        rankModal.style.display = "none";
    }
});

// 로컬 스토리지에 점수를 저장하는 함수
function saveScore(nickname, score) {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push({ nickname: nickname, score: score });
    localStorage.setItem("scores", JSON.stringify(scores));
}

// 게임 결과에 따라 점수를 계산하고 업데이트하는 함수
function calculateScore(result) {
    if (result === 2) {
        playerScore += 10;
        playerScoreItem.innerText = playerScore;
    } else if (result === 0) {
        pcScore += 10;
        pcScoreItem.innerText = pcScore;
    }
}

const timeRemain = document.getElementById("time-remain");

let closeTimer = 0;
let time = 5;

// 라운드 종료 후 자동으로 게임을 재시작하는 함수
function restartGameAfterExitModal() {
    timeRemain.innerText = time;

    closeTimer = setInterval(() => {
        timeRemain.innerText = --time;

        if (time === 0) {
            roundModal.style.display = "none";
            restartGame();
        }
    }, 1000);
}

// 모달 닫기 버튼 클릭 시 동작하는 함수 (게임 종료 시 재시작 처리)
const modalCloseButtons = document.querySelectorAll(".modal__content-close-button");

modalCloseButtons.forEach(button => {
    button.addEventListener("click", function() {
        if (button.id !== "save-score" && button.id !== "close-ranking") { // save-score와 close-ranking 버튼 클릭 시 게임이 재시작되지 않도록 예외 처리
            roundModal.style.display = "none";
            endModal.style.display = "none";
            restartGame();
        }
    });
});

// 게임을 재시작하는 함수 (점점 빠르게)
function restartGame() {
    clearInterval(closeTimer);

    time = 5;

    changePcSelection();

    playerLifeItem.innerText = playerLife;
    playerScoreItem.innerText = playerScore;
    pcScoreItem.innerText = pcScore;

    if (count <= 20) {
        speed -= 10;
    }

    timer = setInterval(changePcSelection, speed);
}

// 게임 종료 버튼 클릭 시 동작하는 함수
const stopButton = document.getElementById("stop-button");

stopButton.addEventListener("click", function() {
    showGameResult();

    clearInterval(timer);

    initGame();
});

// 게임 설정을 초기화하는 함수
function initGame() {
    speed = 300;
    playerLife = 3;
    playerScore = 0;
    pcScore = 0;
    count = 0;
    winCount = 0;
    drawCount = 0;
    loseCount = 0;
}

const playerLifeItem = document.getElementById("player-life");
const pcImage = document.getElementById("pc-image");

// 페이지 로드 시 초기 설정 및 타이머 시작
window.onload = function() {
    timer = setInterval(changePcSelection, speed);

    playerLifeItem.innerText = playerLife;
    playerScoreItem.innerText = playerScore;
    pcScoreItem.innerText = pcScore;
};
