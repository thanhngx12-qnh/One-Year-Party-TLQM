// Game 1: Vua Tiếng Việt (The King of Vietnamese)
class KingGame {
  constructor() {
    // Dữ liệu chính thức Gala Dinner (9 câu hỏi bảo mật)
    this.officialQuestions = [
      {
        scrambled: ['N', 'G', 'Ô', 'U', 'N', 'A', 'Q', 'H', 'T'],
        answer: 'THÔNG QUAN',
        hint: 'Thủ tục pháp lý quan trọng nhất để hàng hóa xuất nhập khẩu hợp pháp qua biên giới.'
      },
      {
        scrambled: ['A', 'K', 'Ử', 'H', 'U', 'C', 'Ẩ'],
        answer: 'CỬA KHẨU',
        hint: 'Nơi diễn ra các hoạt động xuất nhập khẩu, xuất nhập cảnh và giao thương quốc tế.'
      },
      {
        scrambled: ['G', 'À', 'N', 'Ù', 'T', 'L'],
        answer: 'TÀ LÙNG',
        hint: 'Cửa khẩu Quốc tế trọng điểm tại Cao Bằng - địa bàn hoạt động chiến lược của công ty.'
      },
      {
        scrambled: ['T', 'H', 'I', 'P', 'Ể', 'Á', 'R', 'N', 'T'],
        answer: 'PHÁT TRIỂN',
        hint: 'Mục tiêu và khát vọng không ngừng vươn xa của tập thể cán bộ nhân viên Tà Lùng Quang Minh.'
      },
      {
        scrambled: ['N', 'Ế', 'Đ', 'T', 'À', 'K', 'O'],
        answer: 'ĐOÀN KẾT',
        hint: 'Sức mạnh tập thể, sự đồng lòng gắn bó keo sơn giữa tất cả các thành viên.'
      },
      {
        scrambled: ['N', 'G', 'Ố', 'I', 'C', 'Ế', 'H', 'N'],
        answer: 'CỐNG HIẾN',
        hint: 'Tinh thần làm việc tận tâm, trách nhiệm của mỗi nhân sự vì sự phát triển chung.'
      },
      {
        scrambled: ['G', 'Ư', 'N', 'Ă', 'L', 'Ơ', 'T', 'G', 'N'],
        answer: 'TĂNG LƯƠNG',
        hint: 'Nguyện vọng tha thiết và được mong đợi nhất của anh chị em nhân viên cuối năm!'
      },
      {
        scrambled: ['T', 'Ờ', 'U', 'Ệ', 'I', 'T', 'V', 'Y'],
        answer: 'TUYỆT VỜI',
        hint: 'Từ miêu tả chính xác nhất bầu không khí và tinh thần của đêm tiệc Gala hôm nay!'
      },
      {
        scrambled: ['N', 'T', 'Ô', 'H', 'N', 'À', 'G', 'C', 'H'],
        answer: 'THÀNH CÔNG',
        hint: 'Đích đến rực rỡ cho mọi nỗ lực và sứ mệnh "Kết nối biên giới - Vươn tới toàn cầu".'
      }
    ];

    // Dữ liệu tập dượt / Demo (3 câu hỏi mẫu không lộ đề thi thật)
    this.demoQuestions = [
      {
        scrambled: ['Ổ', 'V', 'C', 'Ũ'],
        answer: 'CỔ VŨ',
        hint: 'Hành động nhiệt tình của khán giả tiếp thêm sức mạnh cho các đội thi!'
      },
      {
        scrambled: ['U', 'V', 'I', 'Ẻ', 'V'],
        answer: 'VUI VẺ',
        hint: 'Cảm xúc hân hoan, rạng rỡ của tất cả chúng ta trong đêm tiệc Gala tối nay!'
      },
      {
        scrambled: ['G', 'Đ', 'I', 'Ồ', 'Đ', 'N', 'Ộ'],
        answer: 'ĐỒNG ĐỘI',
        hint: 'Những người đồng nghiệp tuyệt vời kề vai sát cánh cùng vượt qua mọi thử thách.'
      }
    ];

    this.isOfficial = false;
    this.questions = this.demoQuestions;

    this.currentIndex = 0;
    this.totalSeconds = 15;
    this.remainingSeconds = 15;
    this.timerInterval = null;
    this.isRunning = false;
    this.isRevealed = false;
    this.isHintShown = false;

    this.init();
  }

  setDataMode(isOfficial, loadFirst = true) {
    this.isOfficial = !!isOfficial;
    this.questions = this.isOfficial ? this.officialQuestions : this.demoQuestions;

    const badge = document.getElementById('king-mode-badge');
    const desc = document.getElementById('king-sub-desc');

    if (badge) {
      badge.className = `game-data-badge ${this.isOfficial ? 'official' : 'demo'}`;
      badge.innerHTML = this.isOfficial
        ? `<i class="fas fa-crown"></i> DỮ LIỆU GALA THẬT (${this.questions.length} CÂU)`
        : `<i class="fas fa-flask"></i> BẢN TẬP DƯỢT DEMO (${this.questions.length} CÂU)`;
    }

    if (desc) {
      desc.textContent = this.isOfficial
        ? 'Thử tài nhanh trí sắp xếp nhóm chữ cái xáo trộn thành các từ khóa gắn liền với Tà Lùng Quang Minh trong vòng 15 giây.'
        : 'Bản tập dượt thử nghiệm với 3 câu mẫu vui nhộn để làm quen luật chơi & âm thanh. Dữ liệu thật cần mật mã Ban Tổ Chức.';
    }

    this.renderQuestionList();
    if (loadFirst) {
      this.loadQuestion(0, false);
    }
  }

  init() {
    this.renderQuestionList();
    this.loadQuestion(0);
    this.bindEvents();
  }

  bindEvents() {
    const btnStart = document.getElementById('king-start-timer');
    const btnHint = document.getElementById('king-show-hint');
    const btnReveal = document.getElementById('king-reveal-answer');
    const btnReset = document.getElementById('king-reset');
    const btnPrev = document.getElementById('king-prev-btn');
    const btnNext = document.getElementById('king-next-btn');

    if (btnStart) btnStart.addEventListener('click', () => this.toggleTimer());
    if (btnHint) btnHint.addEventListener('click', () => this.showHint());
    if (btnReveal) btnReveal.addEventListener('click', () => this.revealAnswer());
    if (btnReset) btnReset.addEventListener('click', () => this.resetQuestion());
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevQuestion());
    if (btnNext) btnNext.addEventListener('click', () => this.nextQuestion());
  }

  renderQuestionList() {
    const listContainer = document.getElementById('king-question-selector');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    this.questions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = `king-pill-btn ${idx === this.currentIndex ? 'active' : ''}`;
      btn.innerHTML = `Câu ${idx + 1} <span class="kbd-hint">${idx + 1}</span>`;
      btn.setAttribute('data-index', idx);
      btn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.loadQuestion(idx);
      });
      listContainer.appendChild(btn);
    });
  }

  selectQuestion(index, broadcast = true) {
    this.loadQuestion(index, broadcast);
  }

  loadQuestion(index, broadcast = true) {
    this.stopTimer();
    this.currentIndex = index;
    this.remainingSeconds = this.totalSeconds;
    this.isRevealed = false;
    this.isHintShown = false;

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('KING_SELECT_QUESTION', { questionIndex: index });
    }

    const q = this.questions[index];

    // Update title / counter
    const titleElem = document.getElementById('king-question-number');
    if (titleElem) titleElem.textContent = `CÂU ĐỐ SỐ ${index + 1} / ${this.questions.length}`;

    // Update selector active state
    const pills = document.querySelectorAll('.king-pill-btn');
    pills.forEach((p, i) => p.classList.toggle('active', i === index));

    // Render Scrambled Letters
    const tilesContainer = document.getElementById('king-tiles-container');
    if (tilesContainer) {
      tilesContainer.innerHTML = '';
      q.scrambled.forEach((char, i) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = char;
        tile.style.animationDelay = `${i * 0.06}s`;
        tile.title = 'Bấm để tương tác chữ cái';
        tile.addEventListener('click', () => {
          tile.style.transform = 'translateY(-10px) scale(1.15) rotate(6deg)';
          tile.style.borderColor = 'var(--tlqm-amber)';
          if (window.soundEngine) window.soundEngine.playClick();
          setTimeout(() => {
            tile.style.transform = '';
            tile.style.borderColor = '';
          }, 350);
        });
        tilesContainer.appendChild(tile);
      });
    }

    // Hide Answer Box
    const answerContainer = document.getElementById('king-answer-box');
    if (answerContainer) {
      answerContainer.classList.remove('revealed');
      answerContainer.innerHTML = '';
    }

    // Reset Hint
    const hintBox = document.getElementById('king-hint-box');
    if (hintBox) {
      hintBox.classList.remove('show');
      hintBox.textContent = '';
    }

    // Update buttons
    const btnStart = document.getElementById('king-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-play"></i> Bắt Đầu 15 Giây <span class="kbd-hint">Space</span>';
      btnStart.classList.remove('running');
    }

    this.updateTimerDisplay();
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(broadcast = true) {
    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = this.totalSeconds;
    }
    this.isRunning = true;
    const btnStart = document.getElementById('king-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-pause"></i> Tạm Dừng <span class="kbd-hint">Space</span>';
      btnStart.classList.add('running');
    }

    if (window.soundEngine) window.soundEngine.playTick();

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('KING_START_TIMER');
    }

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerDisplay();

      if (this.remainingSeconds <= 3 && this.remainingSeconds > 0) {
        if (window.soundEngine) window.soundEngine.playWarningTick();
        const vignette = document.getElementById('stage-urgent-vignette');
        if (vignette) vignette.classList.add('active');
      } else if (this.remainingSeconds > 3) {
        if (window.soundEngine) window.soundEngine.playTick();
      }

      if (this.remainingSeconds <= 0) {
        this.stopTimer();
        if (window.soundEngine) window.soundEngine.playWarningTick();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    const vignette = document.getElementById('stage-urgent-vignette');
    if (vignette) vignette.classList.remove('active');
    const btnStart = document.getElementById('king-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-play"></i> Tiếp Tục <span class="kbd-hint">Space</span>';
      btnStart.classList.remove('running');
    }
  }

  stopTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    const vignette = document.getElementById('stage-urgent-vignette');
    if (vignette) vignette.classList.remove('active');
    const btnStart = document.getElementById('king-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-redo"></i> Đếm Lại <span class="kbd-hint">Space</span>';
      btnStart.classList.remove('running');
    }
  }

  updateTimerDisplay() {
    const timerText = document.getElementById('king-timer-text');
    const timerCircle = document.getElementById('king-timer-circle');

    if (timerText) {
      timerText.textContent = this.remainingSeconds;
      timerText.classList.toggle('urgent', this.remainingSeconds <= 3);
    }

    if (timerCircle) {
      // 2 * PI * 40 = 251.3
      const totalOffset = 251.3;
      const progress = this.remainingSeconds / this.totalSeconds;
      const offset = totalOffset - (totalOffset * progress);
      timerCircle.style.strokeDashoffset = offset;
      timerCircle.classList.toggle('urgent', this.remainingSeconds <= 3);
    }
  }

  showHint() {
    if (this.isHintShown) return;
    this.isHintShown = true;
    const q = this.questions[this.currentIndex];
    const hintBox = document.getElementById('king-hint-box');
    if (hintBox) {
      hintBox.innerHTML = `<strong>💡 GỢI Ý CỦA MC:</strong> ${q.hint} <em>(Từ có ${q.answer.replace(/\s+/g, '').length} chữ cái, chữ cái đầu là "${q.answer[0]}")</em>`;
      hintBox.classList.add('show');
    }
    if (window.soundEngine) window.soundEngine.playHint();
  }

  revealAnswer(broadcast = true) {
    if (this.isRevealed) return;
    this.isRevealed = true;
    this.stopTimer();

    const q = this.questions[this.currentIndex];
    const answerContainer = document.getElementById('king-answer-box');
    if (answerContainer) {
      answerContainer.innerHTML = '';
      
      // Render answer words nicely
      const words = q.answer.split(' ');
      words.forEach(word => {
        const wordGroup = document.createElement('div');
        wordGroup.className = 'answer-word-group';
        for (let ch of word) {
          const letterBox = document.createElement('div');
          letterBox.className = 'answer-letter-tile';
          letterBox.textContent = ch;
          wordGroup.appendChild(letterBox);
        }
        answerContainer.appendChild(wordGroup);
      });

      answerContainer.classList.add('revealed');
    }

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('KING_REVEAL_ANSWER');
    }

    // Audio & Confetti celebration
    if (window.soundEngine) {
      window.soundEngine.playCorrect();
      setTimeout(() => window.soundEngine.playCheer(), 400);
    }
    if (window.confettiEngine) {
      window.confettiEngine.celebrate();
    }
  }

  resetQuestion(broadcast = true) {
    this.loadQuestion(this.currentIndex, broadcast);
    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('KING_RESET');
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.loadQuestion(this.currentIndex + 1);
    }
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.loadQuestion(this.currentIndex - 1);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.kingGame = new KingGame();
  window.gameKing = window.kingGame;
});
