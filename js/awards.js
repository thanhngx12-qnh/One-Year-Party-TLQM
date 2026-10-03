/**
 * ==============================================================================
 * AWARDS & LUCKY DRAW TAB MANAGER (GALA TLQM)
 * Quản lý chuyên biệt phân hệ Bốc Thăm May Mắn (26 Giải) & Trao Quà Gameshow
 * Tách biệt hoàn toàn khỏi Slide trình chiếu để MC / Lead Game thao tác tiện lợi
 * ==============================================================================
 */

class AwardsManager {
  constructor() {
    this.currentTab = 'lucky'; // 'lucky' | 'gameshow'
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('tlqm_stage_channel') : null;
  }

  init() {
    this.bindTabEvents();
    this.bindGameshowAwardsEvents();
    this.setupBroadcastReceiver();
    this.updateStandings();
    this.renderCustomAwards();
  }

  bindTabEvents() {
    const btnLucky = document.getElementById('tab-btn-lucky');
    const btnGameshow = document.getElementById('tab-btn-gameshow');

    if (btnLucky) {
      btnLucky.addEventListener('click', () => {
        this.switchTab('lucky');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    if (btnGameshow) {
      btnGameshow.addEventListener('click', () => {
        this.switchTab('gameshow');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }
  }

  switchTab(tabKey, broadcast = true) {
    this.currentTab = tabKey;

    const btnLucky = document.getElementById('tab-btn-lucky');
    const btnGameshow = document.getElementById('tab-btn-gameshow');
    const panelLucky = document.getElementById('awards-panel-lucky');
    const panelGameshow = document.getElementById('awards-panel-gameshow');

    if (btnLucky) btnLucky.classList.toggle('active', tabKey === 'lucky');
    if (btnGameshow) btnGameshow.classList.toggle('active', tabKey === 'gameshow');

    if (panelLucky) panelLucky.classList.toggle('active', tabKey === 'lucky');
    if (panelGameshow) panelGameshow.classList.toggle('active', tabKey === 'gameshow');

    if (tabKey === 'gameshow') {
      this.updateStandings();
      this.populateRecipientOptions();
      this.renderCustomAwards();
    }

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('AWARDS_SUBTAB_CHANGE', { tab: tabKey });
    }

    if (window.app && window.app.showToast) {
      window.app.showToast(
        tabKey === 'lucky' ? '🎲 Bốc Thăm May Mắn (26 Giải)' : '🏆 Trao Quà Gameshow & Bổ Sung',
        tabKey === 'lucky' ? 'Tab 1' : 'Tab 2'
      );
    }
  }

  setupBroadcastReceiver() {
    if (!this.channel) return;
    this.channel.addEventListener('message', (e) => {
      const msg = e.data;
      if (!msg || !msg.type) return;

      if (msg.type === 'AWARDS_SUBTAB_CHANGE') {
        this.switchTab(msg.tab, false);
      } else if (msg.type === 'CUSTOM_AWARDS_UPDATE') {
        this.renderCustomAwards();
      } else if (msg.type === 'SCORE_UPDATE' || msg.type === 'TEAM_COUNT_UPDATE') {
        this.updateStandings();
      }
    });
  }

  updateStandings() {
    const list = document.getElementById('awards-team-standings-list');
    if (!list) return;

    const pose = window.gamePose || window.poseGame;
    if (!pose) {
      list.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem; padding: 10px;">Chưa có dữ liệu điểm số Gameshow.</div>';
      return;
    }

    const teamCount = pose.teamCount || 2;
    const teamNames = pose.teamNames || ['Đội 1 (Áo Đỏ)', 'Đội 2 (Áo Xanh)', 'Đội 3 (Áo Vàng)', 'Đội 4 (Áo Tím)'];
    const scores = pose.scores || [0, 0, 0, 0];

    // Build teams array and sort by score descending
    const teams = [];
    for (let i = 0; i < teamCount; i++) {
      teams.push({
        index: i,
        name: teamNames[i] || `Đội ${i + 1}`,
        score: scores[i] || 0
      });
    }

    teams.sort((a, b) => b.score - a.score);

    const rankPrizes = [
      { rank: 1, medal: '🥇', tag: 'QUÁN QUÂN', prize: 'Thùng Quà Bí Mật 200.000đ + Cúp Vàng', class: 'rank-champion' },
      { rank: 2, medal: '🥈', tag: 'Á QUÂN', prize: 'Thùng Quà Bí Mật 100.000đ', class: 'rank-runnerup' },
      { rank: 3, medal: '🥉', tag: 'HẠNG BA', prize: 'Ô Cầm Tay Thương Hiệu TLQM', class: 'rank-third' },
      { rank: 4, medal: '🎖️', tag: 'HẠNG BỐN', prize: 'Ô Cầm Tay Thương Hiệu TLQM', class: 'rank-fourth' }
    ];

    list.innerHTML = teams.map((team, idx) => {
      const info = rankPrizes[idx] || { rank: idx + 1, medal: '🎖️', tag: `HẠNG ${idx + 1}`, prize: 'Ô Cầm Tay TLQM', class: '' };
      return `
        <div class="standing-team-item ${info.class}">
          <div class="standing-rank-badge">
            <span class="standing-medal">${info.medal}</span>
            <span class="standing-rank-label">${info.tag}</span>
          </div>
          <div class="standing-team-details">
            <div class="standing-team-name">${this.escapeHtml(team.name)}</div>
            <div class="standing-team-prize"><i class="fas fa-gift" style="color: var(--tlqm-amber); margin-right: 4px;"></i> ${info.prize}</div>
          </div>
          <div class="standing-team-score">
            <span class="standing-score-num">${team.score}</span>
            <span class="standing-score-unit">điểm</span>
          </div>
        </div>
      `;
    }).join('');
  }

  bindGameshowAwardsEvents() {
    const btnSubmit = document.getElementById('btn-awards-custom-submit');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => this.submitNewCustomAward());
    }

    const inputTitle = document.getElementById('input-awards-custom-title');
    if (inputTitle) {
      inputTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitNewCustomAward();
        }
      });
    }
  }

  populateRecipientOptions() {
    const select = document.getElementById('select-awards-custom-recipient');
    if (!select) return;

    const pose = window.gamePose || window.poseGame;
    const currentVal = select.value;
    select.innerHTML = '';

    if (pose) {
      for (let i = 0; i < pose.teamCount; i++) {
        const opt = document.createElement('option');
        opt.value = pose.teamNames[i];
        opt.textContent = `${pose.teamNames[i]} (${pose.scores[i]} điểm)`;
        select.appendChild(opt);
      }
    }

    const specialOptions = [
      'Cá nhân xuất sắc nhất / Đội trưởng',
      'Cổ động viên / Khán giả nhiệt tình nhất',
      'Toàn thể các Đội chơi tham gia',
      'Thành viên thi đấu hài hước nhất',
      'Ban Trọng tài / Ban Tổ chức'
    ];
    specialOptions.forEach(optText => {
      const opt = document.createElement('option');
      opt.value = optText;
      opt.textContent = `★ ${optText}`;
      select.appendChild(opt);
    });

    if (currentVal) select.value = currentVal;
  }

  submitNewCustomAward() {
    const inputTitle = document.getElementById('input-awards-custom-title');
    const selectRecipient = document.getElementById('select-awards-custom-recipient');
    const inputPrize = document.getElementById('input-awards-custom-prize');
    const formWrap = document.getElementById('awards-custom-form-wrap');

    const title = inputTitle ? inputTitle.value.trim() : '';
    const recipient = selectRecipient ? selectRecipient.value.trim() : '';
    const prize = inputPrize ? inputPrize.value.trim() : '';

    if (!title) {
      if (inputTitle) {
        inputTitle.focus();
        inputTitle.classList.add('error');
        setTimeout(() => inputTitle.classList.remove('error'), 800);
      }
      if (window.app && window.app.showToast) {
        window.app.showToast('⚠️ Vui lòng nhập tên giải thưởng!');
      }
      return;
    }

    const newAward = {
      id: 'award-' + Date.now(),
      title: title,
      recipient: recipient || 'Đội chơi xuất sắc',
      prize: prize || 'Phần Quà Lưu Niệm TLQM'
    };

    const pose = window.gamePose || window.poseGame;
    if (pose) {
      if (!pose.customAwards) pose.customAwards = [];
      pose.customAwards.push(newAward);
      pose.saveCustomAwards();
      pose.renderCustomAwards();
    } else {
      let saved = [];
      try {
        const raw = localStorage.getItem('tlqm_custom_awards');
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}
      saved.push(newAward);
      localStorage.setItem('tlqm_custom_awards', JSON.stringify(saved));
    }

    this.renderCustomAwards();

    if (inputTitle) inputTitle.value = '';
    if (inputPrize) inputPrize.value = '';
    if (formWrap) formWrap.style.display = 'none';

    if (window.soundEngine) window.soundEngine.playCorrect();
    if (window.app && window.app.showToast) {
      window.app.showToast(`🎖️ Lead Game đã thêm: ${newAward.title}!`);
    }

    if (window.stageSync) {
      const allAwards = (pose && pose.customAwards) || this.loadSavedCustomAwards();
      window.stageSync.broadcast('CUSTOM_AWARDS_UPDATE', { customAwards: allAwards });
    }
  }

  deleteCustomAward(id) {
    const pose = window.gamePose || window.poseGame;
    if (pose) {
      pose.customAwards = (pose.customAwards || []).filter(a => a.id !== id);
      pose.saveCustomAwards();
      pose.renderCustomAwards();
    } else {
      let saved = this.loadSavedCustomAwards().filter(a => a.id !== id);
      localStorage.setItem('tlqm_custom_awards', JSON.stringify(saved));
    }

    this.renderCustomAwards();

    if (window.soundEngine) window.soundEngine.playClick();
    if (window.app && window.app.showToast) {
      window.app.showToast('🗑️ Đã xóa giải thưởng');
    }

    if (window.stageSync) {
      const allAwards = (pose && pose.customAwards) || this.loadSavedCustomAwards();
      window.stageSync.broadcast('CUSTOM_AWARDS_UPDATE', { customAwards: allAwards });
    }
  }

  loadSavedCustomAwards() {
    try {
      const raw = localStorage.getItem('tlqm_custom_awards');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      {
        id: 'award-default-1',
        title: 'Giải Đội Trưởng Ấn Tượng Nhất',
        recipient: 'Cá nhân xuất sắc nhất / Đội trưởng',
        prize: 'Phần Quà Đặc Biệt TLQM'
      },
      {
        id: 'award-default-2',
        title: 'Giải Tạo Dáng Bùng Nổ & Sáng Tạo',
        recipient: 'Đội Trình Diễn Cười Nghiêng Ngả Nhất',
        prize: 'Phần Quà Lưu Niệm Độc Đáo TLQM'
      }
    ];
  }

  renderCustomAwards() {
    const list = document.getElementById('awards-custom-awards-list');
    if (!list) return;

    const pose = window.gamePose || window.poseGame;
    const awards = (pose && pose.customAwards) ? pose.customAwards : this.loadSavedCustomAwards();

    if (!awards || awards.length === 0) {
      list.innerHTML = `
        <div style="color: var(--text-secondary); font-size: 0.86rem; font-style: italic; padding: 8px 4px;">
          Chưa có giải thưởng bổ sung nào. Lead Game bấm nút <strong>"+ Thêm Giải"</strong> phía trên để bổ sung giải phong cách, MVP hoặc cổ động viên...
        </div>
      `;
      return;
    }

    list.innerHTML = awards.map(a => `
      <div class="custom-award-item" data-id="${a.id}">
        <div class="custom-award-info">
          <span class="custom-award-title-tag">🎖️ ${this.escapeHtml(a.title)}</span>
          <span class="custom-award-recipient"><i class="fas fa-user-check"></i> ${this.escapeHtml(a.recipient)}</span>
          <span class="custom-award-prize"><i class="fas fa-gift"></i> ${this.escapeHtml(a.prize)}</span>
        </div>
        <button type="button" class="btn-delete-award" title="Xóa giải này" onclick="window.awardsManager && window.awardsManager.deleteCustomAward('${a.id}')">
          <i class="fas fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }

  escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.awardsManager = new AwardsManager();
  window.awardsManager.init();
});
