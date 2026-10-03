// =================================================================
// SHOWCASE MANAGER: CƠ CẤU QUÀ TẶNG & BỐC THĂM MAY MẮN (GALA TLQM)
// KIẾN TRÚC MỞ (CONFIG-DRIVEN ARCHITECTURE) - DỄ DÀNG THÊM QUÀ & GHÉP GIỌNG
// =================================================================

class ShowcaseManager {
  constructor() {
    // 1. Tải cấu hình mở từ window.GALA_PRIZES_CONFIG
    this.config = window.GALA_PRIZES_CONFIG || { slides: [], settings: {} };
    this.slidesData = this.config.slides || [];
    this.settings = this.config.settings || {};

    this.currentSlide = 0;
    this.totalSlides = this.slidesData.length || 11;

    // Runtime state
    this.hasStarted = false;
    this.settingVoice = true;
    this.settingMusic = true;
    this.settingAuto = false;
    this.userVolume = this.settings.defaultVolume || 0.55;
    this.autoPlayTimer = null;

    // Audio elements
    this.voiceAudio = new Audio();
    this.luckySound = new Audio(this.settings.luckyDrumSrc || 'assets/voices/luckydraw.mp3');
    this.auditionAudio = new Audio(); // Dùng riêng để nghe thử giọng trong Modal Ghép Giọng
    this.currentlyAuditioningIndex = null;

    this.bgMusic = document.getElementById('prize-bg-music');
    if (!this.bgMusic) {
      this.bgMusic = new Audio(this.settings.bgMusicSrc || 'assets/voices/sound-background.mp3');
      this.bgMusic.id = 'prize-bg-music';
      this.bgMusic.loop = true;
      document.body.appendChild(this.bgMusic);
    }
    this.bgMusic.volume = this.userVolume;

    // Khởi tạo ánh xạ giọng nói & tiêu đề từ danh sách cấu hình
    this.updateVoiceMapping();

    this.init();
  }

  updateVoiceMapping() {
    this.slideVoiceMap = {};
    this.slideTitles = [];

    this.slidesData.forEach((s, idx) => {
      this.slideVoiceMap[idx] = s.voice || null;
      this.slideTitles.push(s.name ? `${idx + 1}. ${s.name}` : (s.tabTitle || `Slide ${idx + 1}`));
    });
  }

  init() {
    // Tự động render giao diện dựa trên dữ liệu cấu hình
    this.renderTabs();
    this.renderSlides();
    this.renderDots();
    this.renderConfigModalTable();

    this.setupEvents();
    this.setupAudioHandlers();
    this.setupConfigModal();
    this.updateControlsUI();

    // Khởi tạo ở slide đầu tiên
    this.goToSlide(0);
  }

  // =================================================================
  // 1. DYNAMIC RENDERING METHODS
  // =================================================================

  renderTabs() {
    const tabNav = document.getElementById('prize-tab-nav');
    if (!tabNav) return;
    tabNav.innerHTML = '';

    this.slidesData.forEach((slide, index) => {
      const btn = document.createElement('button');
      btn.className = 'showcase-tab-btn' + (index === 0 ? ' active' : '');
      btn.setAttribute('data-slide', index);
      const icon = slide.tabIcon ? `<i class="${slide.tabIcon}"></i>` : '<i class="fas fa-gift"></i>';
      btn.innerHTML = `${icon} ${slide.tabTitle || `Slide ${index + 1}`}`;
      btn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.goToSlide(index);
      });
      tabNav.appendChild(btn);
    });
  }

  renderSlides() {
    const container = document.querySelector('.prize-slides-container');
    if (!container) return;
    container.innerHTML = '';

    this.slidesData.forEach((slide, index) => {
      const slideDiv = document.createElement('div');
      slideDiv.id = slide.id || `prize-slide-${index + 1}`;
      slideDiv.className = 'prize-slide' + (index === 0 ? ' active' : '');

      let html = '';
      switch (slide.type) {
        case 'opening':
          html = `
            <div class="prize-slide-inner">
              <div class="prize-brand-header">
                <img src="${slide.content.logo}" alt="TLQM Logo" class="prize-logo-hero">
                <span class="prize-subtext-pill">${slide.content.badge}</span>
              </div>
              <h2 class="prize-company-name">${slide.content.companyName}</h2>
              <h1 class="prize-main-title gold-shimmer">${slide.content.mainTitle}</h1>
              <div class="prize-gold-divider"></div>
              <p class="prize-lead-caption">${slide.content.caption}</p>
            </div>
          `;
          break;

        case 'transition':
          html = `
            <div class="prize-slide-inner">
              <span class="prize-badge-lg">${slide.content.badge}</span>
              <h2 class="prize-welcome-text">${slide.content.welcomeText}</h2>
              <h1 class="prize-main-title gold-shimmer huge-gala-title">${slide.content.mainTitle}</h1>
              <p class="prize-slogan-quote">${slide.content.quote}</p>
            </div>
          `;
          break;

        case 'stats':
          const target = slide.content.totalTarget || 17;
          const badgesHtml = (slide.content.summaryBadges || []).map(b => `
            <div class="prize-card-pill ${b.highlight ? 'highlight-gold' : ''}">
              <span class="card-pill-tag ${b.tagClass}">${b.tag}</span>
              <span class="card-pill-desc">${b.desc}</span>
            </div>
          `).join('');

          html = `
            <div class="prize-slide-inner">
              <div class="prize-stats-header">
                <span class="prize-huge-counter count-up" id="prize-counter-${target}" data-target="${target}">0</span>
                <h2 class="prize-stats-label">${slide.content.label}</h2>
              </div>
              <div class="prize-summary-cards">
                ${badgesHtml}
              </div>
            </div>
          `;
          break;

        case 'prize':
        case 'grand-prize':
          const isGrand = slide.type === 'grand-prize';
          if (isGrand) slideDiv.classList.add('prize-slide-grand');

          html = `
            <div class="prize-slide-inner">
              <span class="prize-category-tag ${slide.categoryClass || 'tag-gold'}">${slide.category}</span>
              <h1 class="prize-product-name ${slide.goldShimmer ? 'gold-shimmer' : ''} ${isGrand ? 'grand-title' : ''}">${slide.name}</h1>
              <div class="prize-showcase-frame ${isGrand ? 'grand-frame' : ''}">
                <img src="${slide.image}" alt="${slide.imageAlt || slide.name}" class="prize-product-img">
              </div>
              <div class="prize-quantity-badge">
                <span class="badge-count ${isGrand ? 'grand-count' : ''}">${slide.badgeCount}</span>
                ${slide.badgeSub ? `<span class="badge-sub">${slide.badgeSub}</span>` : ''}
              </div>
            </div>
          `;
          break;

        case 'drama':
          slideDiv.classList.add('prize-slide-drama');
          html = `
            <div class="prize-slide-inner">
              <div class="drama-card">
                <div class="drama-icon">${slide.content.icon}</div>
                <h1 class="gold-shimmer drama-headline">${slide.content.headline}</h1>
                <p class="drama-subhead">${slide.content.subhead}</p>
                <div class="drama-pulse-btn-wrap">
                  <button class="action-btn prize-btn-reveal" onclick="window.showcaseManager.nextSlide()">
                    <i class="fas fa-sparkles"></i> ${slide.content.buttonText} <span class="kbd-hint">Space / Enter</span>
                  </button>
                </div>
              </div>
            </div>
          `;
          break;

        case 'backdrop':
          slideDiv.classList.add('prize-slide-backdrop');
          html = `
            <div class="prize-slide-inner">
              <div class="backdrop-brand-top">
                <img src="${slide.content.logo}" alt="TLQM Logo" class="backdrop-logo">
                <p class="backdrop-company">${slide.content.company}</p>
              </div>
              <h1 class="gold-shimmer backdrop-title">${slide.content.title}</h1>
              
              <div class="backdrop-invitation-box">
                <h2 class="invitation-main">${slide.content.invitationMain}</h2>
                <h3 class="invitation-sub">${slide.content.invitationSub}</h3>
              </div>

              <!-- Digital Lucky Draw Arena -->
              <div class="lucky-draw-arena">
                <!-- 3-Digit Slot Display -->
                <div class="lucky-slot-display">
                  <div class="lucky-slot-box" id="slot-digit-1"><span class="slot-digit-val">0</span></div>
                  <div class="lucky-slot-box" id="slot-digit-2"><span class="slot-digit-val">0</span></div>
                  <div class="lucky-slot-box" id="slot-digit-3"><span class="slot-digit-val">0</span></div>
                </div>

                <!-- Grand Winner Announcement Banner (High Impact for Stage LED) -->
                <div id="lucky-winner-announcement" class="lucky-winner-card hidden">
                  <div class="winner-trophy-badge">🏆 CHÚC MỪNG VÉ MAY MẮN TRÚNG GIẢI!</div>
                  <div id="lucky-winner-number" class="winner-number-highlight">MÃ SỐ 000</div>
                  <div id="lucky-winner-name" class="winner-name-highlight">HỌ VÀ TÊN</div>
                  <div id="lucky-winner-dept" class="winner-dept-text">Phòng Ban • Chức Vụ</div>
                  <div id="lucky-winner-prize" class="winner-prize-badge">GIẢI THƯỞNG</div>
                </div>

                <!-- Operator Recording Console (Ban Tổng Giám đốc bốc phiếu bên ngoài -> Ghi nhận vào hệ thống) -->
                <div class="lucky-record-console">
                  <div class="lucky-record-header">
                    <span class="lucky-record-title">
                      <i class="fas fa-pen-to-square" style="color: var(--tlqm-amber); margin-right: 6px;"></i>
                      Ghi Nhận Kết Quả Bốc Thăm (Ban Tổng Giám Đốc Bốc Phiếu Bên Ngoài):
                    </span>
                    <span class="lucky-participants-tag" id="lucky-participants-badge">
                      <i class="fas fa-users"></i> 65 Nhân sự dự tiệc / 111 CBCNV
                    </span>
                  </div>

                  <div class="lucky-record-inputs-grid">
                    <div class="lucky-field-col">
                      <label for="input-lucky-emp-code">Mã / Tên nhân viên trúng thăm:</label>
                      <div class="lucky-input-with-icon">
                        <i class="fas fa-id-badge"></i>
                        <input type="text" id="input-lucky-emp-code" placeholder="Gõ mã NV (VD: 066, 005...) hoặc họ tên" list="lucky-emp-datalist" autocomplete="off" />
                        <datalist id="lucky-emp-datalist"></datalist>
                      </div>
                    </div>

                    <div class="lucky-field-col">
                      <label for="select-lucky-prize">Hạng giải thưởng trao tặng:</label>
                      <div class="lucky-input-with-icon">
                        <i class="fas fa-award"></i>
                        <select id="select-lucky-prize">
                          <option value="nhat">🏆 01 Giải Nhất - Quạt Sưởi Gốm Kangaroo (1.250k)</option>
                          <option value="nhi">🥈 05 Giải Nhì - Bàn Là Hơi Nước Tefal (499k)</option>
                          <option value="ba">🥉 08 Giải Ba - Ấm Đun Siêu Tốc Bear 1.5L (299k)</option>
                          <option value="mayman" selected>🎁 12 Giải May Mắn - Pin Sạc Dự Phòng Delites (199k)</option>
                          <option value="dacbiet">⭐ Giải Đặc Biệt / Bổ Sung Ban Lãnh Đạo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Live Employee Info Card (Auto-populated when code is typed) -->
                  <div id="lucky-emp-preview" class="lucky-emp-preview hidden">
                    <div class="preview-avatar"><i class="fas fa-user-check"></i></div>
                    <div class="preview-details">
                      <div class="preview-name" id="preview-emp-name">Nguyễn Quang Đạt</div>
                      <div class="preview-sub" id="preview-emp-sub">Trưởng ban Quản lý dự án • Phòng Kế hoạch - Dự án</div>
                    </div>
                    <div class="preview-status" id="preview-emp-status">🟢 Có mặt tại Gala</div>
                  </div>

                  <!-- Action Buttons Row -->
                  <div class="lucky-record-actions-row">
                    <button type="button" id="btn-lucky-record-submit" class="btn-gala btn-gala-gold" title="Vinh danh mã số này lên màn hình LED và ghi vào danh sách">
                      <i class="fas fa-bullhorn"></i> Vinh Danh Màn LED & Ghi Nhận
                    </button>
                    <button type="button" id="btn-lucky-random-pick" class="action-btn" title="Quay ngẫu nhiên 1 người tham dự Gala chưa trúng giải (Dự phòng)">
                      <i class="fas fa-shuffle"></i> Quay Ngẫu Nhiên
                    </button>
                    <button type="button" id="btn-backdrop-lucky" class="action-btn lucky-drum-btn" onclick="window.showcaseManager.toggleLuckySound()" title="Âm thanh Trống Dồn (Phím L)">
                      <i class="fas fa-drum"></i> Trống Dồn <span class="kbd-hint">L</span>
                    </button>
                    <button type="button" class="action-btn" onclick="window.confettiEngine && window.confettiEngine.celebrate(); window.soundEngine && window.soundEngine.playCheer();" title="Bắn pháo hoa vỗ tay (Phím C)">
                      <i class="fas fa-trophy"></i> Pháo Hoa <span class="kbd-hint">C</span>
                    </button>
                  </div>
                </div>

                <!-- Live Recorded Winners Table (Danh sách đã trao thưởng) -->
                <div class="lucky-winners-board">
                  <div class="lucky-winners-board-header">
                    <span class="board-title">
                      <i class="fas fa-list-check" style="color: var(--tlqm-gold); margin-right: 6px;"></i>
                      Bảng Kết Quả Bốc Thăm Đã Trao (<span id="lucky-winners-count">0</span> giải):
                    </span>
                    <button type="button" id="btn-lucky-reset-all" class="action-btn text-danger" title="Xóa toàn bộ lịch sử trúng thưởng">
                      <i class="fas fa-rotate-left"></i> Đặt Lại
                    </button>
                  </div>

                  <div id="lucky-winners-table-container" class="lucky-winners-table-container">
                    <!-- Populated dynamically by luckyDrawManager -->
                  </div>
                </div>
              </div>
            </div>
          `;
          break;

        default:
          html = `<div class="prize-slide-inner"><h2>${slide.name || 'Slide Quà Tặng'}</h2></div>`;
      }

      slideDiv.innerHTML = html;
      container.appendChild(slideDiv);
    });

    if (window.luckyDrawManager) {
      window.luckyDrawManager.init();
    }
  }

  renderDots() {
    const dotsContainer = document.getElementById('prize-dots-nav');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'prize-dot' + (i === 0 ? ' active' : '');
      dot.title = this.slideTitles[i] || `Slide ${i + 1}`;
      dot.setAttribute('data-slide-index', i);
      dot.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  renderConfigModalTable() {
    const tbody = document.getElementById('prize-config-table-body');
    const totalInfo = document.getElementById('prize-config-total-info');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (totalInfo) {
      totalInfo.textContent = `📋 Tổng số: ${this.totalSlides} Slide trình chiếu đã cấu hình`;
    }

    this.slidesData.forEach((slide, index) => {
      const tr = document.createElement('tr');
      const voiceFile = slide.voice || null;
      const typeLabel = slide.category || slide.type || 'Nội dung';
      const title = slide.name || slide.tabTitle || `Slide ${index + 1}`;

      tr.innerHTML = `
        <td style="text-align: center; font-weight: 800; color: var(--tlqm-navy);">${index + 1}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-heading);">${title}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${slide.tabTitle || ''}</div>
        </td>
        <td style="text-align: center;">
          <span class="prize-category-tag ${slide.categoryClass || 'tag-silver'}" style="margin: 0; padding: 2px 8px; font-size: 0.75rem;">
            ${typeLabel}
          </span>
        </td>
        <td>
          ${voiceFile 
            ? `<code style="background: rgba(34,56,115,0.06); padding: 3px 6px; border-radius: 4px; font-size: 0.85rem; color: var(--tlqm-navy);">${voiceFile}</code>` 
            : '<span style="color: #94a3b8; font-style: italic; font-size: 0.85rem;">(Không có giọng đọc)</span>'}
        </td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 6px; justify-content: center;">
            ${voiceFile ? `
              <button class="action-btn btn-audition" data-index="${index}" title="Nghe thử giọng này" style="padding: 4px 10px; font-size: 0.82rem;">
                <i class="fas fa-play"></i> Nghe Thử
              </button>
            ` : `
              <button class="action-btn" disabled style="opacity: 0.4; padding: 4px 10px; font-size: 0.82rem;">
                <i class="fas fa-volume-xmark"></i> Không voice
              </button>
            `}
            <button class="action-btn btn-jump-slide" data-index="${index}" title="Chuyển đến slide này trên sân khấu" style="padding: 4px 10px; font-size: 0.82rem; background: var(--tlqm-navy); color: #fff;">
              <i class="fas fa-eye"></i> Xem
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Gắn sự kiện nghe thử & nhảy slide trong modal
    tbody.querySelectorAll('.btn-audition').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        this.toggleAudition(idx, btn);
      });
    });

    tbody.querySelectorAll('.btn-jump-slide').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        this.goToSlide(idx);
        const modal = document.getElementById('prize-config-modal');
        if (modal) modal.classList.remove('show');
      });
    });
  }

  toggleAudition(index, btn) {
    if (this.currentlyAuditioningIndex === index && !this.auditionAudio.paused) {
      // Đang phát giọng này -> bấm dừng
      this.auditionAudio.pause();
      this.auditionAudio.currentTime = 0;
      this.currentlyAuditioningIndex = null;
      btn.innerHTML = '<i class="fas fa-play"></i> Nghe Thử';
      btn.classList.remove('active');
    } else {
      // Đang phát giọng khác hoặc chưa phát -> đổi sang phát giọng này
      const voicePath = this.slidesData[index]?.voice;
      if (!voicePath) return;

      // Reset tất cả các nút nghe thử khác
      document.querySelectorAll('#prize-config-table-body .btn-audition').forEach(b => {
        b.innerHTML = '<i class="fas fa-play"></i> Nghe Thử';
        b.classList.remove('active');
      });

      this.auditionAudio.src = voicePath;
      this.auditionAudio.currentTime = 0;
      this.auditionAudio.volume = 0.9;
      this.auditionAudio.play().then(() => {
        this.currentlyAuditioningIndex = index;
        btn.innerHTML = '<i class="fas fa-pause"></i> Dừng Lại';
        btn.classList.add('active');
      }).catch(err => {
        console.warn('Audition audio play blocked', err);
        if (window.app) window.app.showToast('⚠️ Không thể phát file âm thanh này!', 'Err');
      });

      this.auditionAudio.onended = () => {
        this.currentlyAuditioningIndex = null;
        btn.innerHTML = '<i class="fas fa-play"></i> Nghe Thử';
        btn.classList.remove('active');
      };
    }
  }

  setupConfigModal() {
    const configBtn = document.getElementById('btn-prize-config-modal');
    const modal = document.getElementById('prize-config-modal');
    const closeBtn = document.getElementById('prize-config-modal-close');

    if (configBtn && modal) {
      configBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.renderConfigModalTable();
        modal.classList.add('show');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.stopAudition();
        modal.classList.remove('show');
      });
    }

    // Đóng khi click ngoài khung modal
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.stopAudition();
          modal.classList.remove('show');
        }
      });
    }
  }

  stopAudition() {
    if (this.auditionAudio) {
      this.auditionAudio.pause();
      this.auditionAudio.currentTime = 0;
      this.currentlyAuditioningIndex = null;
    }
  }

  // =================================================================
  // 2. CONTROLS & NAVIGATION LOGIC
  // =================================================================

  setupEvents() {
    // Prev / Next button
    const prevBtn = document.getElementById('showcase-prev');
    const nextBtn = document.getElementById('showcase-next');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.prevSlide();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        if (!this.hasStarted) {
          this.startProgram();
        } else {
          this.nextSlide();
        }
      });
    }

    // Start / MC trigger button (Play / Pause toggle)
    const startBtn = document.getElementById('btn-prize-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.togglePlayPauseProgram();
      });
    }

    // Toggle Voice button
    const voiceBtn = document.getElementById('btn-prize-voice');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => this.toggleVoice());
    }

    // Toggle Music button
    const musicBtn = document.getElementById('btn-prize-music');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => this.toggleMusic());
    }

    // Toggle Auto button
    const autoBtn = document.getElementById('btn-prize-auto');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => this.toggleAutoPlay());
    }

    // Lucky draw sound button
    const luckyBtn = document.getElementById('btn-prize-lucky');
    if (luckyBtn) {
      luckyBtn.addEventListener('click', () => this.toggleLuckySound());
    }

    // Replay voice button
    const replayBtn = document.getElementById('showcase-replay-voice');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => this.replayVoice());
    }
  }

  setupAudioHandlers() {
    // When MC voice begins: duck bg music & update button to Pause
    this.voiceAudio.addEventListener('play', () => {
      this.duckMusic(true);
      this.updateStartButton(true);
    });

    // When MC voice pauses: restore bg music & update button to Play
    this.voiceAudio.addEventListener('pause', () => {
      this.duckMusic(false);
      this.updateStartButton(false);
    });

    // When MC voice finishes: restore bg music, auto advance if enabled
    this.voiceAudio.addEventListener('ended', () => {
      this.duckMusic(false);
      this.updateStartButton(false);
      if (this.settingAuto) {
        clearTimeout(this.autoPlayTimer);
        const delay = this.settings.autoAdvanceDelay || 1800;
        this.autoPlayTimer = setTimeout(() => {
          this.nextSlide();
        }, delay);
      }
    });

    this.voiceAudio.addEventListener('error', () => {
      this.duckMusic(false);
      this.updateStartButton(false);
      if (this.settingAuto) {
        clearTimeout(this.autoPlayTimer);
        this.autoPlayTimer = setTimeout(() => {
          this.nextSlide();
        }, 3000);
      }
    });

    // Lucky drum sound ended
    this.luckySound.addEventListener('ended', () => {
      this.updateLuckyBtnVisuals(false);
    });
  }

  togglePlayPauseProgram() {
    const isPlaying = this.voiceAudio && !this.voiceAudio.paused && !this.voiceAudio.ended;
    if (isPlaying) {
      this.pauseProgram();
    } else {
      this.resumeOrStartProgram();
    }
  }

  pauseProgram() {
    if (this.voiceAudio) {
      this.voiceAudio.pause();
    }
    clearTimeout(this.autoPlayTimer);
    this.updateStartButton(false);
    if (window.app) {
      window.app.showToast('⏸️ Đã tạm dừng giọng đọc MC & trình chiếu', 'Space');
    }
  }

  resumeOrStartProgram() {
    this.hasStarted = true;
    if (this.settingMusic && this.bgMusic && this.bgMusic.paused) {
      this.bgMusic.play().catch(e => console.warn('Background music auto-play blocked', e));
    }
    if (this.voiceAudio && this.voiceAudio.src && this.voiceAudio.paused && this.voiceAudio.currentTime > 0 && !this.voiceAudio.ended) {
      this.voiceAudio.play().catch(e => console.warn('Voice resume blocked', e));
    } else {
      this.playVoiceForSlide(this.currentSlide);
    }
    this.updateStartButton(true);
    if (window.app) {
      window.app.showToast('▶️ Đang phát thuyết minh quà tặng', 'Space');
    }
  }

  updateStartButton(isPlaying) {
    const startBtn = document.getElementById('btn-prize-start');
    if (!startBtn) return;
    if (isPlaying) {
      startBtn.innerHTML = '<i class="fas fa-pause"></i> Tạm Dừng <span class="kbd-hint">Space</span>';
      startBtn.classList.add('program-running');
      startBtn.title = 'Tạm dừng giọng đọc & trình chiếu (Space)';
    } else {
      const label = this.hasStarted ? 'Tiếp Tục' : 'Bắt Đầu';
      startBtn.innerHTML = `<i class="fas fa-play"></i> ${label} <span class="kbd-hint">Space</span>`;
      startBtn.classList.remove('program-running');
      startBtn.title = 'Bắt đầu / Tiếp tục trình chiếu (Space)';
    }
  }

  startProgram() {
    this.resumeOrStartProgram();
  }

  goToSlide(index) {
    clearTimeout(this.autoPlayTimer);
    if (index < 0) index = 0;
    if (index >= this.totalSlides) index = this.totalSlides - 1;
    this.currentSlide = index;

    const currentSlideConfig = this.slidesData[index] || {};

    // 1. Update slides visibility
    const slides = document.querySelectorAll('.prize-slide');
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    // 2. Update tab pills
    const tabBtns = document.querySelectorAll('#prize-tab-nav .showcase-tab-btn');
    tabBtns.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    // 3. Update dots
    const dots = document.querySelectorAll('#prize-dots-nav .prize-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // 4. Update progress bar
    const progressBar = document.getElementById('prize-progress-bar');
    if (progressBar) {
      const progressPercent = ((index + 1) / this.totalSlides) * 100;
      progressBar.style.width = `${progressPercent.toFixed(2)}%`;
    }

    // 5. Update indicator text
    const indicator = document.getElementById('showcase-indicator');
    if (indicator) {
      indicator.textContent = `${index + 1} / ${this.totalSlides}`;
    }

    // 6. Slide-specific special triggers (Dynamic from config)
    if (currentSlideConfig.type === 'stats' || currentSlideConfig.content?.totalTarget) {
      const targetVal = currentSlideConfig.content?.totalTarget || 17;
      this.animateCounter(targetVal);
    }
    
    if (currentSlideConfig.triggerFlash || currentSlideConfig.type === 'grand-prize') {
      this.triggerFlashEffect();
    }
    
    if (currentSlideConfig.triggerConfetti) {
      if (window.confettiEngine) window.confettiEngine.celebrate();
    }
    
    if (currentSlideConfig.triggerCheer) {
      if (window.soundEngine) window.soundEngine.playCheer();
    }

    // 7. Play voice if started and enabled
    if (this.hasStarted && this.settingVoice) {
      this.playVoiceForSlide(index);
    } else if (this.hasStarted && this.settingAuto && !this.slideVoiceMap[index]) {
      // Slide without voice (e.g. suspense drama) auto advances after delay
      const suspenseDelay = this.settings.suspenseSlideDelay || 4200;
      this.autoPlayTimer = setTimeout(() => {
        this.nextSlide();
      }, suspenseDelay);
    }

    // 8. Toast
    if (window.app) {
      const title = this.slideTitles[index] || `Slide ${index + 1}`;
      window.app.showToast(title, `${index + 1}`);
    }
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.goToSlide(this.currentSlide + 1);
    } else if (this.settingAuto) {
      this.settingAuto = false;
      this.updateControlsUI();
      if (window.app) window.app.showToast('✅ Đã hoàn tất các slide quà tặng!', 'End');
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    }
  }

  playVoiceForSlide(index) {
    const soundPath = this.slideVoiceMap[index];
    this.voiceAudio.pause();
    this.voiceAudio.currentTime = 0;

    if (!soundPath) {
      this.duckMusic(false);
      return;
    }

    this.voiceAudio.src = soundPath;
    setTimeout(() => {
      this.voiceAudio.play().catch(err => {
        console.warn('Voice play blocked or interrupted', err);
        this.duckMusic(false);
      });
    }, 250);
  }

  replayVoice() {
    if (window.soundEngine) window.soundEngine.playClick();
    this.playVoiceForSlide(this.currentSlide);
    if (window.app) window.app.showToast('🔁 Phát lại MC Thuyết Minh', 'R');
  }

  duckMusic(duck) {
    if (!this.bgMusic) return;
    const targetVol = duck ? this.userVolume * 0.2 : this.userVolume;
    this.fadeVolume(this.bgMusic, targetVol);
  }

  fadeVolume(audio, targetVol) {
    const step = 0.05;
    const current = audio.volume;
    if (Math.abs(current - targetVol) <= step) {
      audio.volume = targetVol;
      return;
    }
    if (current > targetVol) {
      audio.volume = Math.max(0, current - step);
    } else {
      audio.volume = Math.min(1, current + step);
    }
    setTimeout(() => this.fadeVolume(audio, targetVol), 40);
  }

  toggleVoice() {
    this.settingVoice = !this.settingVoice;
    if (!this.settingVoice) {
      this.voiceAudio.pause();
      this.duckMusic(false);
    } else if (this.hasStarted) {
      this.playVoiceForSlide(this.currentSlide);
    }
    this.updateControlsUI();
    if (window.app) {
      window.app.showToast(this.settingVoice ? '🗣️ MC Thuyết Minh: Bật' : '🔇 MC Thuyết Minh: Tắt', 'V');
    }
  }

  toggleMusic() {
    this.settingMusic = !this.settingMusic;
    if (this.bgMusic) {
      if (this.settingMusic) {
        this.bgMusic.play().catch(e => console.warn(e));
      } else {
        this.bgMusic.pause();
      }
    }
    this.updateControlsUI();
    if (window.app) {
      window.app.showToast(this.settingMusic ? '🎵 Nhạc Nền: Bật' : '🔇 Nhạc Nền: Tắt', 'B');
    }
  }

  toggleAutoPlay() {
    this.settingAuto = !this.settingAuto;
    clearTimeout(this.autoPlayTimer);
    if (this.settingAuto) {
      if (!this.hasStarted) this.startProgram();
      if (this.voiceAudio.paused) {
        this.autoPlayTimer = setTimeout(() => this.nextSlide(), 3000);
      }
    }
    this.updateControlsUI();
    if (window.app) {
      window.app.showToast(this.settingAuto ? '⏯️ Tự Động Chuyển Slide: Bật' : '⏸️ Tự Động Chuyển Slide: Tắt', 'A');
    }
  }

  toggleLuckySound() {
    if (this.luckySound.paused) {
      this.luckySound.currentTime = 0;
      this.luckySound.play().catch(e => console.warn(e));
      this.updateLuckyBtnVisuals(true);
      if (window.app) window.app.showToast('🥁 Bật Trống Dồn Bốc Thăm!', 'L');
    } else {
      this.luckySound.pause();
      this.updateLuckyBtnVisuals(false);
      if (window.app) window.app.showToast('⏸️ Dừng Trống Dồn', 'L');
    }
  }

  updateLuckyBtnVisuals(isPlaying) {
    const luckyBtns = [
      document.getElementById('btn-prize-lucky'),
      document.getElementById('btn-backdrop-lucky')
    ];
    luckyBtns.forEach(btn => {
      if (btn) {
        btn.classList.toggle('active-lucky', isPlaying);
        if (isPlaying) {
          btn.innerHTML = '<i class="fas fa-drum-steelpan fa-spin"></i> Đang Đổ Trống... <span class="kbd-hint">L</span>';
        } else {
          btn.innerHTML = '<i class="fas fa-drum"></i> Trống Bốc Thăm <span class="kbd-hint">L</span>';
        }
      }
    });
  }

  updateControlsUI() {
    const voiceBtn = document.getElementById('btn-prize-voice');
    if (voiceBtn) {
      voiceBtn.innerHTML = this.settingVoice 
        ? '<i class="fas fa-microphone"></i> MC <span class="kbd-hint">V</span>'
        : '<i class="fas fa-microphone-slash"></i> MC: Tắt <span class="kbd-hint">V</span>';
      voiceBtn.classList.toggle('active', this.settingVoice);
    }

    const musicBtn = document.getElementById('btn-prize-music');
    if (musicBtn) {
      musicBtn.innerHTML = this.settingMusic
        ? '<i class="fas fa-music"></i> Nhạc <span class="kbd-hint">B</span>'
        : '<i class="fas fa-volume-xmark"></i> Nhạc: Tắt <span class="kbd-hint">B</span>';
      musicBtn.classList.toggle('active', this.settingMusic);
    }

    const autoBtn = document.getElementById('btn-prize-auto');
    if (autoBtn) {
      autoBtn.innerHTML = this.settingAuto
        ? '<i class="fas fa-pause"></i> Auto <span class="kbd-hint">A</span>'
        : '<i class="fas fa-forward"></i> Auto: Tắt <span class="kbd-hint">A</span>';
      autoBtn.classList.toggle('active', this.settingAuto);
    }
  }

  animateCounter(target) {
    const counter = document.getElementById(`prize-counter-${target}`) || document.querySelector('.prize-huge-counter');
    if (!counter) return;
    let startTimestamp = null;
    const duration = 1800;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeVal = 1 - Math.pow(1 - progress, 4);
      counter.textContent = Math.floor(easeVal * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        counter.textContent = target;
      }
    };
    requestAnimationFrame(step);
  }

  triggerFlashEffect() {
    const flash = document.getElementById('prize-flash-overlay');
    if (!flash) return;
    flash.classList.remove('flash-active');
    void flash.offsetWidth; // force reflow
    flash.classList.add('flash-active');
  }

  stopAllAudio() {
    if (this.voiceAudio) this.voiceAudio.pause();
    if (this.luckySound) this.luckySound.pause();
    if (this.bgMusic) this.bgMusic.pause();
    this.stopAudition();
    this.updateLuckyBtnVisuals(false);
    this.updateStartButton(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.showcaseManager = new ShowcaseManager();
});
