"use strict";

const CARD_IMG = [
    'bear', 'camel', 'cat', 'chick', 'chicken', 'cockroach', 'cow', 'dolphin',
    'elephant', 'fish', 'frog', 'horse', 'kitty', 'koala', 'monkey', 'penguin',
    'pig', 'porcupine', 'puffer-fish', 'rabbit', 'rat-head', 'shell', 'snail',
    'snake', 'squid', 'tiger', 'whale'
];
const BOARD_SIZE = 24;

let stage = 1;
let time = 1;
let timer = 0;
let isFlip = false;

let cardDeck = [];

// 게임 시작
function startGame() {
    initScreen();
    makeCardDeck();
    settingCardDeck();
    showCardDeck();
}

// 게임 재시작
function restartGame() {
    initGame();
    startGame();
}

// 게임 종료
function stopGame() {
    showGameResult();
}

// 게임 설정 초기화
function initGame() {
    stage = 1;
    time = 60;
    isFlip = false;
    cardDeck = [];
}

// 게임 화면 초기화
function initScreen() {
    const gameBoard = document.querySelector(".game__board");
    gameBoard.innerHTML = '';
    const playerTime = document.getElementById("player-time");
    const playerStage = document.getElementById("player-stage");
    playerTime.innerHTML = time;
    playerStage.innerHTML = stage;
    playerTime.classList.remove("blink");
    void playerTime.offsetWidth;
    playerTime.classList.add("blink");
}

// 카드 덱 생성
function makeCardDeck() {
    let randomNumberArr = [];

    for (let i = 0; i < BOARD_SIZE / 2; i++) {
        let randomNumber = getRandom(27, 0);

        if (randomNumberArr.indexOf(randomNumber) === -1) {
            randomNumberArr.push(randomNumber);
        } else {
            i--;
        }
    }

    randomNumberArr.push(...randomNumberArr);

    shuffle(randomNumberArr);

    for (let i = 0; i < BOARD_SIZE; i++) {
        cardDeck.push({ card: CARD_IMG[randomNumberArr[i]], isOpen: false, isMatch: false });
    }

    return cardDeck;
}

// 카드 섞기
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

// 난수 생성
function getRandom(max, min) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function settingCardDeck() {
    const gameBoard = document.querySelector(".game__board");
    for (let i = 0; i < BOARD_SIZE; i++) {
        gameBoard.innerHTML +=
            `
            <div class="card" data-id="${i}" data-card="${cardDeck[i].card}">
                <div class="card__back"></div>
                <div class="card__front"></div>
            </div>
        `;

        document.getElementsByClassName("card__front")[i].style.backgroundImage = `url('img/game-cm/card-pack/${cardDeck[i].card}.png')`;
    }
}

// 전체 카드 보여주는 함수
function showCardDeck() {
    let cnt = 0;
    const cardBack = document.getElementsByClassName("card__back");
    const cardFront = document.getElementsByClassName("card__front");

    let showCardPromise = new Promise((resolve) => {
        let showCardTimer = setInterval(() => {
            cardBack[cnt].style.transform = "rotateY(180deg)";
            cardFront[cnt++].style.transform = "rotateY(0deg)";

            if (cnt === cardDeck.length) {
                clearInterval(showCardTimer);
                resolve();
            }
        }, 200);
    });

    showCardPromise.then(() => {
        setTimeout(hideCardDeck, 2000);
    });
}

// 전체 카드 숨기는 함수
function hideCardDeck() {
    const cardBack = document.getElementsByClassName("card__back");
    const cardFront = document.getElementsByClassName("card__front");

    for (let i = 0; i < cardDeck.length; i++) {
        cardBack[i].style.transform = "rotateY(0deg)";
        cardFront[i].style.transform = "rotateY(-180deg)";
    }

    setTimeout(() => {
        isFlip = true;
        startTimer();
    }, 100);
}

// 카드 클릭 이벤트
document.querySelector(".game__board").addEventListener("click", function(e) {
    if (!isFlip || e.target.parentNode.className !== "card") return;

    let clickCardId = e.target.parentNode.dataset.id;
    if (!cardDeck[clickCardId].isOpen) {
        openCard(clickCardId);
    }
});

// 카드 오픈
function openCard(id) {
    const cardBack = document.getElementsByClassName("card__back");
    const cardFront = document.getElementsByClassName("card__front");

    cardBack[id].style.transform = "rotateY(180deg)";
    cardFront[id].style.transform = "rotateY(0deg)";
    cardDeck[id].isOpen = true;

    let openCardIndexArr = getOpenCardArr();

    if (openCardIndexArr.length === 2) {
        isFlip = false;
        checkCardMatch(openCardIndexArr);
    }
}

// 오픈한 카드의 index를 저장하는 배열 반환
function getOpenCardArr() {
    let openCardIndexArr = [];
    cardDeck.forEach((element, i) => {
        if (element.isOpen && !element.isMatch) {
            openCardIndexArr.push(i);
        }
    });
    return openCardIndexArr;
}

// 카드 일치 여부 확인
function checkCardMatch(indexArr) {
    let firstCard = cardDeck[indexArr[0]];
    let secondCard = cardDeck[indexArr[1]];

    if (firstCard.card === secondCard.card) {
        firstCard.isMatch = true;
        secondCard.isMatch = true;
        matchCard(indexArr);
    } else {
        firstCard.isOpen = false;
        secondCard.isOpen = false;
        closeCard(indexArr);
    }
}

// 카드 일치 처리
function matchCard(indexArr) {
    if (checkClear()) {
        clearStage();
    } else {
        setTimeout(() => { isFlip = true; }, 100);
    }
}

// 카드를 전부 찾았는지 확인하는 함수
function checkClear() {
    return cardDeck.every(element => element.isMatch);
}

// 카드 불일치 처리
function closeCard(indexArr) {
    setTimeout(() => {
        const cardBack = document.getElementsByClassName("card__back");
        const cardFront = document.getElementsByClassName("card__front");

        for (let i = 0; i < indexArr.length; i++) {
            cardBack[indexArr[i]].style.transform = "rotateY(0deg)";
            cardFront[indexArr[i]].style.transform = "rotateY(-180deg)";
        }
        isFlip = true;
    }, 800);
}

// 스테이지 클리어
function clearStage() {
    clearInterval(timer);

    if (stage <= 8) {
        time = 60 - (stage * 5);
    }
    stage++;
    cardDeck = [];
    document.querySelector(".stage-clear").classList.add("show");

    setTimeout(() => {
        document.querySelector(".stage-clear").classList.remove("show");
        initScreen();
        startGame();
    }, 2000);
}

// 게임 타이머 시작
function startTimer() {
    timer = setInterval(() => {
        document.getElementById("player-time").innerHTML = --time;

        if (time === 0) {
            clearInterval(timer);
            stopGame();
        }
    }, 1000);
}

// 게임 종료 시 출력 문구
function showGameResult() {
    let resultText = "";

    if (stage > 0 && stage <= 2) {
        resultText = "한 번 더 해볼까요?";
    } else if (stage > 2 && stage <= 4) {
        resultText = "조금만 더 해봐요!";
    } else if (stage > 4 && stage <= 5) {
        resultText = "짝 맞추기 실력이 대단해요!";
    } else if (stage > 5 && stage <= 7) {
        resultText = "기억력이 엄청나시네요!";
    } else if (stage > 7 && stage <= 9) {
        resultText = "당신의 두뇌,<br/>어쩌면<br/>컴퓨터보다 좋을지도..";
    } else if (stage > 9 && stage <= 11) {
        resultText = "여기까지 온 당신,<br/>혹시 '포토그래픽 메모리'<br/>소유자신가요?";
    } else if (stage > 11) {
        resultText = "탈인간의 능력을 가지셨습니다!!! 🙀";
    }

    const modalTitle = document.querySelector("#end-modal .modal__content-title");
    modalTitle.innerHTML = `
        <h1 class="modal__content-title--result color-red">
            게임 종료!
        </h1>
        <span class="modal__content-title--stage">
            기록 : <strong>STAGE ${stage}</strong>
        </span>
        <p class="modal__content-title--desc">
            ${resultText}
        </p>
    `;

    document.getElementById("end-modal").classList.add("show");

    // 닉네임 입력 및 점수 저장 버튼 이벤트 추가
    document.querySelector("#save-score").addEventListener("click", function() {
        const nickname = document.querySelector("#nickname").value;
        if (nickname) {
            saveScore(nickname, stage);
            document.querySelector("#ranking-message").style.display = "block"; // 점수 저장 메시지 표시
        } else {
            alert("닉네임을 입력해주세요.");
        }
    });

    // 랭킹 확인 버튼 이벤트 추가
    document.querySelector("#rank-button").addEventListener("click", function() {
        showRankingModal();
    });
}

// 모달창 닫기 버튼을 눌러도 게임 재시작 방지
document.querySelectorAll(".modal__content-close-button").forEach(button => {
    button.addEventListener('click', function(e) {
        const endModal = document.getElementById("end-modal");
        if (button.id === "close-ranking") {
            document.getElementById("rank-modal").classList.remove("show");
            endModal.classList.add("show"); // 랭킹 창을 닫을 때 종료 모달 다시 보여줌
        } else if (button.id === "rank-button") {
            endModal.classList.remove("show");
        } else if (button.id === "save-score") {
            e.stopPropagation();
        } else {
            endModal.classList.remove("show");
            restartGame();
        }
    });
});

// 랭킹 모달 창 표시 함수
function showRankingModal() {
    const scores = JSON.parse(localStorage.getItem("cardMatchingGameScores")) || [];

    scores.sort((a, b) => b.score - a.score); // 스테이지 내림차순 정렬

    const topScores = scores.slice(0, 10); // 상위 10개만 선택

    let rankingHtml = '<h1 class="modal__content-title--result color-blue">랭킹 상위 10</h1>';
    rankingHtml += '<ul>';

    topScores.forEach((entry, index) => {
        rankingHtml += `<li>${index + 1}. ${entry.nickname} - STAGE ${entry.score}</li>`;
    });

    rankingHtml += '</ul>';
    document.querySelector("#ranking-content").innerHTML = rankingHtml;

    document.getElementById("rank-modal").classList.add("show");
    document.getElementById("end-modal").classList.remove("show");
}

// 점수 저장 함수
function saveScore(nickname, score) {
    let scores = JSON.parse(localStorage.getItem("cardMatchingGameScores")) || [];
    scores.push({ nickname: nickname, score: score });
    localStorage.setItem("cardMatchingGameScores", JSON.stringify(scores));
}

// 기본 값 세팅 및 게임 자동 시작
window.onload = function() {
    const playerTime = document.getElementById("player-time");
    const playerStage = document.getElementById("player-stage");
    playerTime.innerHTML = time;
    playerStage.innerHTML = stage;

    startGame();
}
