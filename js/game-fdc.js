"use strict";

// 게임 상태 관리에 필요한 변수 초기화
let stage = 1; // 게임 스테이지
let time = 15; // 남은 시간
let paletteRow = 2; // 팔레트 행
let paletteSize = paletteRow ** 2; // 팔레트 아이템 전체 갯수 (행의 제곱)
let targetIndex = 0;
let targetOpacity = 0.4; // 타겟 아이템 opacity
let color = {}; // 팔레트 아이템 색상 (red, green, blue 값을 저장하는 object)
let timer = 0; // 타이머

// 랭킹 관련 변수
const MAX_RANKING_ENTRIES = 5;
let rankings = JSON.parse(localStorage.getItem('rankings')) || [];

// DOM 요소 선택
const modal = document.getElementsByClassName("modal")[0];
const modalTitle = document.getElementsByClassName("modal__content-title")[0];
const modalCloseButton = document.getElementsByClassName("modal__content-close-button")[0];
const playerTime = document.getElementById("player-time");
const playerStage = document.getElementById("player-stage");
const palette = document.getElementsByClassName("palette")[0];
const paletteItem = document.getElementsByClassName("palette-item");
const showRankingInputBtn = document.getElementById('show-ranking-input');
const initialsInputDiv = document.getElementById('initials-input');
const submitInitialsBtn = document.getElementById('submit-initials');

// 게임 시작
function startGame() {
    createPlatteItem();

    timer = setInterval(() => {
        playerTime.innerHTML = --time;

        // 시간 초과
        if (time <= 0) {
            playerTime.innerHTML = 0;

            // 타이머 종료
            clearInterval(timer);

            // 결과 모달 출력
            showGameResult();
        }
    }, 1000);
}

// 팔레트 아이템 생성
function createPlatteItem() {
    targetIndex = createTargetItem(paletteSize);
    settingPlatteItem();
}

// 타겟 생성
function createTargetItem(paletteSize) {
    return Math.floor(Math.random() * paletteSize);
}

// 팔레트 아이템 세팅
function settingPlatteItem() {
    palette.innerHTML = ''; // 기존 아이템 삭제

    for (let i = 0; i < paletteSize; i++) {
        if (i === targetIndex) {
            palette.innerHTML += `<div class="palette-item" id="target"></div>`;
        } else {
            palette.innerHTML += `<div class="palette-item"></div>`;
        }
    }

    // 아이템 크기 세팅
    let itemSize = 100 / paletteRow;

    // 랜덤 색상 생성
    color = createColor(color);

    // 아이템 크기, 색상 적용
    for (let i = 0; i < paletteItem.length; i++) {
        paletteItem[i].style.width = `${itemSize}%`;
        paletteItem[i].style.height = `${itemSize}%`;

        let opacity = paletteItem[i].id === "target" ? targetOpacity : 1;
        paletteItem[i].style.backgroundColor = `rgba(${color.red}, ${color.green}, ${color.blue}, ${opacity}`;
    }
}

// 랜덤 색상 생성
function createColor() {
    return {
        red: Math.floor(Math.random() * 101) + 100,
        green: Math.floor(Math.random() * 101) + 100,
        blue: Math.floor(Math.random() * 101) + 100
    };
}

// 아이템 클릭 이벤트
palette.addEventListener("click", function (e) {
    if (e.target.className === "palette-item") {
        if (e.target.id === "target") {
            selectTargetItem();
        } else {
            selectWrongItem();
        }
    }
});

// 정답 처리
function selectTargetItem() {
    updateSettings();
    createPlatteItem();
}

// 설정 값 변경
function updateSettings() {
    palette.innerHTML = '';

    stage++;
    time = 15;

    if (stage % 2 === 1) {
        paletteRow++;
        paletteSize = paletteRow ** 2;
    }

    if (targetOpacity <= 0.92) {
        targetOpacity = +(targetOpacity + 0.02).toFixed(2);
    }

    playerTime.innerHTML = time;
    playerStage.innerHTML = stage;
}

// 오답 처리
function selectWrongItem() {
    time = Math.max(0, time - 3);

    palette.classList.add("vibration");
    setTimeout(() => palette.classList.remove("vibration"), 400);

    playerTime.innerHTML = time;
}

// 게임 설정 값 초기화
function initGame() {
    stage = 1;
    time = 15;
    paletteRow = 2;
    paletteSize = paletteRow ** 2;
    targetIndex = 0;
    targetOpacity = 0.4;
    color = {};
}

// 결과 텍스트 생성
function getResultText() {
    if (stage <= 5) return "한 번 더 해볼까요?";
    if (stage <= 10) return "조금만 더 해봐요!";
    if (stage <= 15) return "색깔 찾기 능력이 대단해요!";
    if (stage <= 20) return "엄청난 눈을 가지셨네요!";
    if (stage <= 25) return "다른 색깔 찾기의<br/>달인이시군요!";
    if (stage <= 30) return "여기까지 온 당신,<br/>혹시 '절대색감'이신가요?";
    return "탈인간의 능력을 가지셨습니다!!! 🙀";
}

// 로컬 스토리지를 이용한 랭킹 저장 및 관리
function saveRanking(initials, finalStage) {
    rankings.push({ initials, stage: finalStage });
    rankings.sort((a, b) => b.stage - a.stage);
    if (rankings.length > MAX_RANKING_ENTRIES) rankings.pop();
    localStorage.setItem('rankings', JSON.stringify(rankings));
}

function showRankings() {
    return `<h2>Ranking</h2><ol>` +
        rankings.map(entry => `<li>${entry.initials}: STAGE ${entry.stage}</li>`).join('') +
        `</ol>`;
}

// 게임 종료 시 결과 표시
function showGameResult() {
    let finalStage = stage; // 현재 스테이지 값을 저장
    let resultText = getResultText();
    modalTitle.innerHTML = `
        <h1 class="modal__content-title--result color-red">게임 종료!</h1>
        <span class="modal__content-title--stage">기록 : <strong>STAGE ${finalStage}</strong></span>
        <p class="modal__content-title--desc">${resultText}</p>
        ${showRankings()}
    `;
    showRankingInputBtn.style.display = 'inline-block';
    modal.classList.add("show");
}

// 모달 창 닫기
modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target === modalCloseButton) {
        location.reload(); // 페이지 새로고침
    }
});

// 랭킹 등록 버튼 클릭 시 이니셜 입력 폼 표시
showRankingInputBtn.addEventListener('click', function () {
    initialsInputDiv.style.display = 'block';
    showRankingInputBtn.style.display = 'none';
});

// 이니셜 입력 후 랭킹 저장
submitInitialsBtn.addEventListener('click', function () {
    let initials = document.getElementById('initials').value.toUpperCase();
    if (initials.length === 3) {
        saveRanking(initials, stage); // 게임 종료 시의 stage 값 사용
        location.reload(); // 페이지 새로고침
    } else {
        alert("3글자의 이니셜을 입력해주세요!");
    }
});

// 초기 값 세팅 및 게임 자동 시작
window.onload = function () {
    playerTime.innerHTML = time;
    playerStage.innerHTML = stage;
    startGame();
}
