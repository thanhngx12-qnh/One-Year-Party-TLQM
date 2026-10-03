/**
 * Digital Lucky Draw Manager for Gala Dinner TLQM
 * 
 * Thiết kế chuẩn hóa theo quy trình thực tế của Gala:
 * 1. Ban Tổng Giám đốc bốc thăm phiếu may mắn bên ngoài sân khấu.
 * 2. MC / Kỹ thuật viên ghi nhận Mã nhân viên vào hệ thống.
 * 3. Hệ thống tự động nhận diện Họ tên, Phòng ban, Chức vụ từ danh sách 111 nhân sự (65 nhân sự dự tiệc từ Master Excel).
 * 4. Vinh danh lên màn hình LED lớn: 3 ô số quay dừng đúng mã NV, hiển thị Banner Vinh Danh, pháo hoa & âm thanh reo hò.
 * 5. Bảng Kết quả Trao thưởng Bốc thăm (Lưu trữ localStorage & xóa/sửa linh hoạt).
 * 6. Chế độ quay ngẫu nhiên dự phòng trong danh sách người dự Gala chưa trúng giải.
 * 7. Đồng bộ tức thời 0ms sang Màn LED sân khấu qua BroadcastChannel.
 */

class LuckyDrawManager {
  constructor() {
    this.isSpinning = false;
    this.spinIntervals = [null, null, null];
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('tlqm_stage_channel') : null;

    // Load Master Employee Directory
    this.employees = window.TLQM_EMPLOYEES || [];
    this.galaAttendees = this.employees.filter(e => e.isGala);

    // Recorded Lucky Winners List
    this.recordedWinners = this.loadRecordedWinners();

    // Prize definition mapping
    this.prizeDefs = {
      nhat: {
        id: 'nhat',
        name: '01 Giải Nhất: Quạt Sưởi Gốm Kangaroo (1.250.000đ)',
        short: 'Giải Nhất',
        tagClass: 'tag-special',
        badge: '🏆 GIẢI NHẤT',
        total: 1
      },
      nhi: {
        id: 'nhi',
        name: '05 Giải Nhì: Bàn Là Hơi Nước Tefal Easy Steam',
        short: 'Giải Nhì',
        tagClass: 'tag-gold',
        badge: '🥈 GIẢI NHÌ',
        total: 5
      },
      ba: {
        id: 'ba',
        name: '08 Giải Ba: Ấm Đun Siêu Tốc Bear 1.5L',
        short: 'Giải Ba',
        tagClass: 'tag-silver',
        badge: '🥉 GIẢI BA',
        total: 8
      },
      mayman: {
        id: 'mayman',
        name: '12 Giải May Mắn: Pin Sạc Dự Phòng Delites',
        short: 'Giải May Mắn',
        tagClass: 'tag-bronze',
        badge: '🎁 GIẢI MAY MẮN',
        total: 12
      },
      dacbiet: {
        id: 'dacbiet',
        name: 'Giải Bổ Sung / Đặc Biệt Ban Lãnh Đạo',
        short: 'Giải Đặc Biệt',
        tagClass: 'tag-primary',
        badge: '⭐ GIẢI ĐẶC BIỆT',
        total: 99
      }
    };
  }

  loadRecordedWinners() {
    try {
      const saved = localStorage.getItem('tlqm_lucky_recorded_winners');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading recorded winners', e);
    }
    return [];
  }

  saveRecordedWinners() {
    try {
      localStorage.setItem('tlqm_lucky_recorded_winners', JSON.stringify(this.recordedWinners));
    } catch (e) {
      console.warn('Error saving recorded winners', e);
    }
  }

  init() {
    // DOM Elements
    this.slotD1 = document.getElementById('slot-digit-1');
    this.slotD2 = document.getElementById('slot-digit-2');
    this.slotD3 = document.getElementById('slot-digit-3');
    this.winnerCard = document.getElementById('lucky-winner-announcement');
    this.winnerNumEl = document.getElementById('lucky-winner-number');
    this.winnerNameEl = document.getElementById('lucky-winner-name');
    this.winnerDeptEl = document.getElementById('lucky-winner-dept');
    this.winnerPrizeEl = document.getElementById('lucky-winner-prize');

    this.inputCode = document.getElementById('input-lucky-emp-code');
    this.selectPrize = document.getElementById('select-lucky-prize');
    this.previewCard = document.getElementById('lucky-emp-preview');
    this.previewName = document.getElementById('preview-emp-name');
    this.previewSub = document.getElementById('preview-emp-sub');
    this.previewStatus = document.getElementById('preview-emp-status');

    this.btnSubmit = document.getElementById('btn-lucky-record-submit');
    this.btnRandom = document.getElementById('btn-lucky-random-pick');
    this.btnResetAll = document.getElementById('btn-lucky-reset-all');

    this.populateDatalist();
    this.renderWinnersTable();
    this.bindEvents();
    this.setupBroadcastReceiver();
  }

  populateDatalist() {
    const datalist = document.getElementById('lucky-emp-datalist');
    if (!datalist) return;
    datalist.innerHTML = '';

    // Prefer Gala attendees first, then others
    const sorted = [...this.employees].sort((a, b) => (b.isGala ? 1 : 0) - (a.isGala ? 1 : 0));
    sorted.forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.code;
      opt.textContent = `${emp.code} - ${emp.name} (${emp.dept} • ${emp.pos || 'NV'}) ${emp.isGala ? '★ Dự Gala' : ''}`;
      datalist.appendChild(opt);
    });

    const badge = document.getElementById('lucky-participants-badge');
    if (badge) {
      badge.innerHTML = `<i class="fas fa-users"></i> ${this.galaAttendees.length} Nhân sự dự tiệc / ${this.employees.length} CBCNV`;
    }
  }

  bindEvents() {
    if (this.inputCode) {
      this.inputCode.addEventListener('input', () => this.handleCodeInput());
      this.inputCode.addEventListener('change', () => this.handleCodeInput());
      this.inputCode.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.recordWinnerFromInput();
        }
      });
    }

    if (this.btnSubmit) {
      this.btnSubmit.addEventListener('click', () => this.recordWinnerFromInput());
    }

    if (this.btnRandom) {
      this.btnRandom.addEventListener('click', () => this.spinRandomFromGalaList());
    }

    if (this.btnResetAll) {
      this.btnResetAll.addEventListener('click', () => this.resetAllWinners());
    }
  }

  setupBroadcastReceiver() {
    if (!this.channel) return;
    this.channel.addEventListener('message', (e) => {
      const msg = e.data;
      if (!msg || !msg.type) return;

      if (msg.type === 'LUCKY_SHOW_WINNER') {
        this.celebrateAndRecordWinner(msg.emp, msg.prizeKey, false);
      } else if (msg.type === 'LUCKY_DELETE_WINNER') {
        this.deleteWinner(msg.id, false);
      } else if (msg.type === 'LUCKY_RESET_WINNERS') {
        this.recordedWinners = [];
        this.saveRecordedWinners();
        this.renderWinnersTable();
      }
    });
  }

  findEmployee(rawQuery) {
    if (!rawQuery) return null;
    const q = String(rawQuery).trim().toLowerCase();

    // 1. Try exact 3-digit padded code (e.g., "5" -> "005", "66" -> "066")
    const num = parseInt(q, 10);
    let codeStr = q;
    if (!isNaN(num)) {
      codeStr = String(num).padStart(3, '0');
      const byCode = this.employees.find(e => e.code === codeStr);
      if (byCode) return byCode;
    }

    // 2. Try raw code match
    const byRawCode = this.employees.find(e => e.code.toLowerCase() === q);
    if (byRawCode) return byRawCode;

    // 3. Try exact or partial name match
    const byName = this.employees.find(e => e.name.toLowerCase() === q);
    if (byName) return byName;

    const byPartialName = this.employees.find(e => e.name.toLowerCase().includes(q));
    if (byPartialName) return byPartialName;

    return null;
  }

  handleCodeInput() {
    if (!this.inputCode || !this.previewCard) return;
    const val = this.inputCode.value.trim();

    if (!val) {
      this.previewCard.classList.add('hidden');
      return;
    }

    const emp = this.findEmployee(val);
    if (emp) {
      this.previewCard.classList.remove('hidden');
      if (this.previewName) this.previewName.textContent = emp.name;
      if (this.previewSub) {
        this.previewSub.textContent = `${emp.pos || 'Nhân viên'} • Phòng ${emp.dept}`;
      }
      if (this.previewStatus) {
        const alreadyWon = this.recordedWinners.find(w => w.code === emp.code);
        if (alreadyWon) {
          this.previewStatus.className = 'preview-status preview-status-warn';
          this.previewStatus.textContent = `⚠️ Đã trúng ${alreadyWon.prizeShort}`;
        } else if (emp.isGala) {
          this.previewStatus.className = 'preview-status';
          this.previewStatus.textContent = '🟢 Có mặt dự Gala';
        } else {
          this.previewStatus.className = 'preview-status preview-status-neutral';
          this.previewStatus.textContent = '⚪ CBCNV (Chưa xác nhận Gala)';
        }
      }
    } else {
      this.previewCard.classList.add('hidden');
    }
  }

  recordWinnerFromInput() {
    if (this.isSpinning) return;

    const val = this.inputCode ? this.inputCode.value.trim() : '';
    if (!val) {
      if (window.app) window.app.showToast('⚠️ Vui lòng nhập Mã nhân viên (VD: 066, 005...)!');
      if (this.inputCode) this.inputCode.focus();
      return;
    }

    const emp = this.findEmployee(val);
    if (!emp) {
      if (window.app) window.app.showToast(`❌ Không tìm thấy nhân viên với mã "${val}"! Vui lòng kiểm tra lại.`);
      if (this.inputCode) this.inputCode.focus();
      return;
    }

    const prizeKey = this.selectPrize ? this.selectPrize.value : 'mayman';

    // Duplicate check warning
    const alreadyWon = this.recordedWinners.find(w => w.code === emp.code);
    if (alreadyWon) {
      const confirmContinue = confirm(
        `⚠️ CẢNH BÁO TRÙNG THƯỞNG:\n\nNhân viên ${emp.name} (Mã số ${emp.code}) đã được ghi nhận trúng "${alreadyWon.prizeShort}" trước đó!\n\nBạn có chắc chắn Ban Giám đốc muốn trao thêm giải "${this.prizeDefs[prizeKey]?.short || 'này'}" không?`
      );
      if (!confirmContinue) return;
    }

    this.celebrateAndRecordWinner(emp, prizeKey, true);
  }

  celebrateAndRecordWinner(emp, prizeKey = 'mayman', broadcast = true) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const prize = this.prizeDefs[prizeKey] || this.prizeDefs.mayman;
    const targetCode = String(emp.code).padStart(3, '0');

    // 1. Hide announcement card while rolling
    if (this.winnerCard) {
      this.winnerCard.classList.add('hidden');
    }

    if (this.btnSubmit) {
      this.btnSubmit.disabled = true;
      this.btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG VINH DANH...';
    }

    // 2. Broadcast immediately if operator
    if (broadcast && this.channel) {
      this.channel.postMessage({
        type: 'LUCKY_SHOW_WINNER',
        emp,
        prizeKey
      });
    }

    // 3. Fast rolling slot animation on the 3 boxes
    const digits = [this.slotD1, this.slotD2, this.slotD3];
    const targetDigits = [
      parseInt(targetCode[0], 10) || 0,
      parseInt(targetCode[1], 10) || 0,
      parseInt(targetCode[2], 10) || 0
    ];

    digits.forEach((el, idx) => {
      if (el) {
        el.classList.add('rolling');
        this.spinIntervals[idx] = setInterval(() => {
          const valEl = el.querySelector('.slot-digit-val') || el;
          valEl.textContent = Math.floor(Math.random() * 10);
          if (idx === 0 && Math.random() > 0.6 && window.soundEngine) {
            window.soundEngine.playSlotSpinTick();
          }
        }, 50);
      }
    });

    // Staggered stop for dramatic effect
    setTimeout(() => {
      this.stopDigit(0, targetDigits[0]);
      if (window.soundEngine) window.soundEngine.playSlotStop(0);
    }, 1200);

    setTimeout(() => {
      this.stopDigit(1, targetDigits[1]);
      if (window.soundEngine) window.soundEngine.playSlotStop(1);
    }, 2000);

    setTimeout(() => {
      this.stopDigit(2, targetDigits[2]);
      this.finishWinnerPresentation(emp, prize, targetCode, broadcast);
    }, 2900);
  }

  stopDigit(index, finalValue) {
    if (this.spinIntervals[index]) {
      clearInterval(this.spinIntervals[index]);
      this.spinIntervals[index] = null;
    }
    const digits = [this.slotD1, this.slotD2, this.slotD3];
    const el = digits[index];
    if (el) {
      el.classList.remove('rolling');
      el.classList.add('locked');
      const valEl = el.querySelector('.slot-digit-val') || el;
      valEl.textContent = finalValue;
      setTimeout(() => el.classList.remove('locked'), 500);
    }
  }

  finishWinnerPresentation(emp, prize, targetCode, broadcast) {
    this.isSpinning = false;

    if (this.btnSubmit) {
      this.btnSubmit.disabled = false;
      this.btnSubmit.innerHTML = '<i class="fas fa-bullhorn"></i> Vinh Danh Màn LED & Ghi Nhận';
    }

    // Populate Grand Winner Card
    if (this.winnerNumEl) this.winnerNumEl.textContent = `MÃ SỐ ${targetCode}`;
    if (this.winnerNameEl) this.winnerNameEl.textContent = emp.name;
    if (this.winnerDeptEl) {
      this.winnerDeptEl.textContent = `${emp.pos || 'Nhân viên'} • Phòng ${emp.dept}`;
    }
    if (this.winnerPrizeEl) {
      this.winnerPrizeEl.textContent = `${prize.badge}: ${prize.name}`;
      this.winnerPrizeEl.className = `winner-prize-badge ${prize.tagClass}`;
    }
    if (this.winnerCard) {
      this.winnerCard.classList.remove('hidden');
    }

    // Confetti & Audio
    if (window.soundEngine) {
      window.soundEngine.playJackpot();
      setTimeout(() => window.soundEngine.playCheer(), 500);
    }
    if (window.confettiEngine) {
      window.confettiEngine.celebrate();
      setTimeout(() => window.confettiEngine.celebrate(), 800);
    }

    // Save to Recorded Winners list
    const newRecord = {
      id: 'win-' + Date.now(),
      code: targetCode,
      name: emp.name,
      dept: emp.dept,
      pos: emp.pos || 'Nhân viên',
      company: emp.company || 'Tà Lùng Quang Minh',
      prizeId: prize.id,
      prizeName: prize.name,
      prizeShort: prize.short,
      prizeBadge: prize.badge,
      prizeTagClass: prize.tagClass,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isGala: !!emp.isGala
    };

    this.recordedWinners.unshift(newRecord);
    this.saveRecordedWinners();
    this.renderWinnersTable();

    // Reset input
    if (this.inputCode) {
      this.inputCode.value = '';
    }
    if (this.previewCard) {
      this.previewCard.classList.add('hidden');
    }

    if (window.app) {
      window.app.showToast(`🎉 Chúc mừng ${emp.name} (Mã ${targetCode}) trúng ${prize.short}!`, '🏆');
    }
  }

  spinRandomFromGalaList() {
    if (this.isSpinning) return;

    // Filter Gala participants who have not won yet
    const alreadyWonCodes = new Set(this.recordedWinners.map(w => w.code));
    let eligible = this.galaAttendees.filter(e => !alreadyWonCodes.has(e.code));

    if (eligible.length === 0) {
      // If all gala attendees won, fall back to all employees not yet won
      eligible = this.employees.filter(e => !alreadyWonCodes.has(e.code));
    }

    if (eligible.length === 0) {
      alert('⚠️ Toàn bộ danh sách nhân viên đều đã trúng giải! Bạn có thể xóa bớt lịch sử hoặc tiếp tục trao giải trùng.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * eligible.length);
    const chosenEmp = eligible[randomIndex];

    if (this.inputCode) {
      this.inputCode.value = chosenEmp.code;
      this.handleCodeInput();
    }

    const prizeKey = this.selectPrize ? this.selectPrize.value : 'mayman';
    this.celebrateAndRecordWinner(chosenEmp, prizeKey, true);
  }

  deleteWinner(id, broadcast = true) {
    this.recordedWinners = this.recordedWinners.filter(w => w.id !== id);
    this.saveRecordedWinners();
    this.renderWinnersTable();

    if (window.soundEngine) window.soundEngine.playClick();
    if (window.app) window.app.showToast('🗑️ Đã xóa 1 mục trúng thưởng');

    if (broadcast && this.channel) {
      this.channel.postMessage({ type: 'LUCKY_DELETE_WINNER', id });
    }
  }

  resetAllWinners(broadcast = true) {
    if (this.recordedWinners.length === 0) return;
    const confirmReset = confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách kết quả bốc thăm đã ghi nhận không?');
    if (!confirmReset) return;

    this.recordedWinners = [];
    this.saveRecordedWinners();
    this.renderWinnersTable();

    if (this.winnerCard) {
      this.winnerCard.classList.add('hidden');
    }

    if (window.app) window.app.showToast('🔄 Đã xóa toàn bộ lịch sử bốc thăm');

    if (broadcast && this.channel) {
      this.channel.postMessage({ type: 'LUCKY_RESET_WINNERS' });
    }
  }

  renderWinnersTable() {
    const container = document.getElementById('lucky-winners-table-container');
    const countEl = document.getElementById('lucky-winners-count');

    if (countEl) {
      countEl.textContent = this.recordedWinners.length;
    }

    if (!container) return;

    if (this.recordedWinners.length === 0) {
      container.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-secondary); font-size: 0.85rem; font-style: italic;">
          Chưa có kết quả bốc thăm nào được ghi nhận. Ban Tổng Giám đốc bốc phiếu bên ngoài, sau đó nhập Mã nhân viên vào ô phía trên để vinh danh lên màn hình LED.
        </div>
      `;
      return;
    }

    let rowsHtml = '';
    this.recordedWinners.forEach((w, index) => {
      rowsHtml += `
        <tr>
          <td style="font-weight: 700; width: 35px; text-align: center;">${index + 1}</td>
          <td><span class="badge-winner-code">${this.escapeHtml(w.code)}</span></td>
          <td>
            <strong style="color: var(--tlqm-navy); font-size: 0.88rem;">${this.escapeHtml(w.name)}</strong>
            ${w.isGala ? '<span style="font-size: 0.70rem; color: #16a34a; margin-left: 4px;">● Gala</span>' : ''}
          </td>
          <td>
            <div style="font-size: 0.82rem; color: var(--text-heading);">${this.escapeHtml(w.pos)}</div>
            <div style="font-size: 0.74rem; color: var(--text-secondary);">${this.escapeHtml(w.dept)}</div>
          </td>
          <td>
            <span class="card-pill-tag ${w.prizeTagClass}" style="font-size: 0.74rem;">${this.escapeHtml(w.prizeShort)}</span>
          </td>
          <td style="font-size: 0.74rem; color: var(--text-muted);">${w.time || ''}</td>
          <td style="text-align: center;">
            <button type="button" class="btn-delete-award" title="Xóa kết quả này (nếu bốc lại)" onclick="window.luckyDrawManager.deleteWinner('${w.id}')">
              <i class="fas fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <table class="lucky-winners-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">STT</th>
            <th style="width: 80px;">Mã NV</th>
            <th>Họ và Tên</th>
            <th>Phòng Ban - Vị Trí</th>
            <th>Giải Thưởng</th>
            <th style="width: 65px;">Giờ</th>
            <th style="width: 45px; text-align: center;">Xóa</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  handleSpaceKey() {
    if (this.inputCode && this.inputCode.value.trim()) {
      this.recordWinnerFromInput();
    } else {
      this.spinRandomFromGalaList();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.luckyDrawManager = new LuckyDrawManager();
  window.luckyDrawManager.init();
});
