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

function changePcSelection() {
    while (true) {
        pcSelection = getRandom();

        if (pcSelection !== lastPcSelection) {
            lastPcSelection = pcSelection;
            break;
        }
    }

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

function getRandom() {
    return parseInt(Math.random() * 3);
}

const buttonWrapper = document.getElementsByClassName("game__button-wrapper")[0];
const scissorsButton = document.getElementById("scissors-button");
const rockButton = document.getElementById("rock-button");
const papersButton = document.getElementById("paper-button");

buttonWrapper.addEventListener("click", function(e) {
    let playerSelection = "";

    if (e.target === scissorsButton) {
        playerSelection = 0;
    } else if (e.target === rockButton) {
        playerSelection = 1;
    } else if (e.target === papersButton) {
        playerSelection = 2;
    } else {
        return;
    }

    rockPaperSissors(playerSelection);
});

function rockPaperSissors(playerSelection) {
    count++;

    clearInterval(timer);

    let result = checkMatchResult(playerSelection, pcSelection);

    showMatchResult(result, playerSelection, pcSelection);

    if (playerLife === 0) {
        showGameResult();
    } else {
        restartGameAfterExitModal();
    }
}

function checkMatchResult(player, pc) {
    let result = player - pc;

    if (result === 0) {
        drawCount++;
        return 1;
    } else if (result === -2 || result === 1) {
        winCount++;
        return 2;
    } else if (result === -1 || result === 2) {
        loseCount++;
        return 0;
    }
}

const roundModal = document.getElementById("round-modal");
const endModal = document.getElementById("end-modal");

const modalTitle = document.querySelector("#round-modal .modal__content-title");
const endModalTitle = document.querySelector("#end-modal .modal__content-title");

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

// 라운드 결과 모달 창
function showRoundResult(result, player, pc) {
    let colorList = ["color-red", "color-green", "color-blue"];
    let heartList = ["./img/common/broken-heart.png", "", "./img/common/heart.png"];
    let resultList = ["패배", "무승부", "승리"];
    let rpsList = ["✌", "✊", "✋"];

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

    const resultLifeItem = document.getElementsByClassName("modal__content-title--result-life")[0];
    resultLifeItem.style.animation = "blinkingEffect 400ms 6 alternate";

    roundModal.style.display = "block";
}

// 게임 종료 모달 창
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

// 닉네임 입력 칸과 저장 버튼 관련 CSS 및 기능 수정
document.getElementById("save-score").addEventListener("click", function() {
    const nicknameInput = document.getElementById("nickname");
    const nickname = nicknameInput.value;
    const rankingMessage = document.getElementById("ranking-message");
    if (nickname) {
        saveScore(nickname, playerScore);
        rankingMessage.style.display = 'block'; // 메시지 표시
        nicknameInput.value = ""; // 닉네임 입력 칸 비우기
    } else {
        alert("닉네임을 입력해주세요.");
    }
});

// 랭킹 버튼 이벤트
document.getElementById("rank-button").addEventListener("click", function() {
    showRankingModal();
});

// 랭킹 모달 창
function showRankingModal() {
    const scores = JSON.parse(localStorage.getItem("scores")) || [];

    scores.sort((a, b) => b.score - a.score);

    let rankingHtml = '<h1 class="modal__content-title--result color-blue">랭킹</h1>';
    rankingHtml += '<ul>';

    scores.forEach((entry, index) => {
        rankingHtml += `<li>${index + 1}. ${entry.nickname} - ${entry.score}점</li>`;
    });

    rankingHtml += '</ul>';
    rankingHtml += '<button class="white-button modal__content-close-button" type="button">닫기</button>';

    endModalTitle.innerHTML = rankingHtml;

    const closeButton = document.querySelector("#end-modal .modal__content-close-button");
    closeButton.addEventListener("click", function() {
        endModal.style.display = "none";
        // 여기서만 게임 재시작하도록 설정
        restartGame();
    });
}

function saveScore(nickname, score) {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push({ nickname: nickname, score: score });
    localStorage.setItem("scores", JSON.stringify(scores));
}

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

const modalCloseButtons = document.querySelectorAll(".modal__content-close-button");

modalCloseButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (button.id !== "save-score") {  // save-score 버튼 클릭 시 게임이 재시작되지 않도록 예외 처리
            roundModal.style.display = "none";
            endModal.style.display = "none";
            restartGame();
        }
    });
});

// 모달 바깥을 클릭해도 모달이 닫히도록 수정
window.addEventListener('click', function(event) {
    if (event.target === roundModal) {
        roundModal.style.display = "none";
        restartGame();
    } else if (event.target === endModal) {
        endModal.style.display = "none";
        restartGame();
    }
});

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

const stopButton = document.getElementById("stop-button");

stopButton.addEventListener("click", function() {
    showGameResult();

    clearInterval(timer);

    initGame();
});

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

window.onload = function() {
    timer = setInterval(changePcSelection, speed);

    playerLifeItem.innerText = playerLife;
    playerScoreItem.innerText = playerScore;
    pcScoreItem.innerText = pcScore;
}
