/**
 * Digital Lucky Draw Manager for Gala Dinner Tà Lùng Quang Minh
 *
 * Thiết kế chuẩn hóa theo quy trình thực tế của Gala:
 * 1. Ban Tổng Giám đốc bốc thăm phiếu may mắn bên ngoài sân khấu.
 * 2. MC / Kỹ thuật viên ghi nhận Mã nhân viên vào hệ thống:
 *    - Hỗ trợ quay số từng người (hồi hộp với hiệu ứng 3 số dial).
 *    - Hỗ trợ nhập hàng loạt cả đợt (VD: 12 Giải May Mắn, 08 Giải Ba bốc 1 lượt).
 * 3. Hỗ trợ đầy đủ Giải Phát Sinh / Bổ Sung Ban Lãnh Đạo (thưởng nóng, quà thêm).
 * 4. Hệ thống Quota Tracker theo dõi tiến độ từng đợt giải thưởng (12/8/5/1/Phát sinh).
 * 5. Bảng Vinh Danh Sân Khấu Grand Ceremonial Stage Board (Màn LED):
 *    - Vinh danh cả đợt (12 giải May mắn cùng lúc) hoặc toàn bộ bảng vàng.
 *    - Hiển thị logo Tà Lùng Quang Minh & CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH nổi bật trang trọng.
 * 6. Tự động đồng bộ thời gian thực 0ms sang Màn LED sân khấu qua BroadcastChannel.
 */

class LuckyDrawManager {
  constructor() {
    this.isSpinning = false;
    this.spinIntervals = [null, null, null];
    this.channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("tlqm_stage_channel")
        : null;

    // Load Master Employee Directory
    this.employees = window.TLQM_EMPLOYEES || [];
    this.galaAttendees = this.employees.filter((e) => e.isGala);

    // Recorded Lucky Winners List
    this.recordedWinners = this.loadRecordedWinners();

    // Active state
    this.entryMode = "single"; // 'single' | 'batch'
    this.activeFilter = "all"; // 'all' | 'donghanh' | 'mayman' | 'ba' | 'nhi' | 'nhat' | 'dacbiet'
    this.activeTier = "donghanh";
    this.parsedBatchEmployees = [];

    // Official Prize definition mapping (29 Prizes Total)
    this.prizeDefs = {
      donghanh: {
        id: "donghanh",
        name: "12 Giải Đồng Hành: Pin Sạc Dự Phòng AVA+ 10.000 mAh",
        short: "Giải Đồng Hành",
        tagClass: "tag-bronze",
        badge: "🎁 GIẢI ĐỒNG HÀNH",
        total: 12,
        gift: "Pin sạc dự phòng AVA+ 10.000 mAh",
        round: "ĐỢT 1",
        image: "assets/prizes/pin_sac_ava.jpg",
      },
      mayman: {
        id: "mayman",
        name: "08 Giải May Mắn: Bình Đun Siêu Tốc Bear 1.5L KE-5H15V35",
        short: "Giải May Mắn",
        tagClass: "tag-bronze",
        badge: "☕ GIẢI MAY MẮN",
        total: 8,
        gift: "Bình đun siêu tốc Bear 1.5L",
        round: "ĐỢT 2",
        image: "assets/prizes/am_sieu_toc_bear.jpg",
      },
      ba: {
        id: "ba",
        name: "05 Giải Ba: Bàn Là Hơi Nước Tefal Easy Steam FV1955E0",
        short: "Giải Ba",
        tagClass: "tag-silver",
        badge: "🥉 GIẢI BA",
        total: 5,
        gift: "Bàn là hơi nước Tefal Easy Steam",
        round: "ĐỢT 3",
        image: "assets/prizes/ban_la_tefal.jpg",
      },
      nhi: {
        id: "nhi",
        name: "03 Giải Nhì: Máy Sấy Tóc Ion Âm Cao Cấp",
        short: "Giải Nhì",
        tagClass: "tag-gold",
        badge: "🥈 GIẢI NHÌ",
        total: 3,
        gift: "Máy sấy tóc ion âm cao cấp",
        round: "ĐỢT 4",
        image: "assets/prizes/may_say_toc.jpg",
      },
      nhat: {
        id: "nhat",
        name: "01 Giải Nhất: Quạt Sưởi Gốm Kangaroo Cao Cấp KGAH06G",
        short: "Giải Nhất",
        tagClass: "tag-special",
        badge: "🏆 GIẢI NHẤT",
        total: 1,
        gift: "Quạt sưởi gốm Kangaroo cao cấp",
        round: "ĐỢT 5",
        image: "assets/prizes/quat_suoi_kangaroo.png",
      },
      dacbiet: {
        id: "dacbiet",
        name: "Giải Thưởng Nóng / Bổ Sung Ban Lãnh Đạo",
        short: "Giải Phát Sinh",
        tagClass: "tag-primary",
        badge: "⭐ PHÁT SINH",
        total: 99,
        gift: "Thưởng nóng & quà tặng bất ngờ",
        round: "PHÁT SINH",
        image: "assets/images/logo-official-full.png",
      },
    };
  }

  loadRecordedWinners() {
    try {
      const saved = localStorage.getItem("tlqm_lucky_recorded_winners");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Error loading recorded winners", e);
    }
    return [];
  }

  saveRecordedWinners() {
    // The LED presents results; only the operator persists the official list.
    if (window.stageSync?.isStageScreen) return;
    try {
      localStorage.setItem(
        "tlqm_lucky_recorded_winners",
        JSON.stringify(this.recordedWinners),
      );
    } catch (e) {
      console.warn("Error saving recorded winners", e);
    }
    if (this.channel && this.winnerCard) {
      this.channel.postMessage({
        type: "LUCKY_RECORDS_UPDATE",
        winners: this.recordedWinners,
        winnerHtml: this.winnerCard.innerHTML,
        winnerClass: this.winnerCard.className,
        digits: [this.slotD1, this.slotD2, this.slotD3].map(el => el.querySelector('.slot-digit-val').textContent),
      });
    }
  }

  init() {
    // DOM Elements
    this.slotD1 = document.getElementById("slot-digit-1");
    this.slotD2 = document.getElementById("slot-digit-2");
    this.slotD3 = document.getElementById("slot-digit-3");
    this.winnerCard = document.getElementById("lucky-winner-announcement");
    this.cacheWinnerElements();

    this.inputCode = document.getElementById("input-lucky-emp-code");
    this.inputBatchCodes = document.getElementById("input-lucky-batch-codes");
    this.selectPrize = document.getElementById("select-lucky-prize");

    this.previewCard = document.getElementById("lucky-emp-preview");
    this.previewName = document.getElementById("preview-emp-name");
    this.previewSub = document.getElementById("preview-emp-sub");
    this.previewStatus = document.getElementById("preview-emp-status");

    this.batchPreviewCard = document.getElementById("lucky-batch-preview");
    this.batchChipsContainer = document.getElementById("batch-chips-container");
    this.batchPreviewCount = document.getElementById("batch-preview-count");

    this.customPrizeWrap = document.getElementById("lucky-custom-prize-wrap");
    this.inputCustomName = document.getElementById("input-custom-prize-name");
    this.inputCustomValue = document.getElementById("input-custom-prize-value");

    this.btnSubmit = document.getElementById("btn-lucky-record-submit");
    this.btnBatchSubmit = document.getElementById("btn-lucky-batch-submit");
    this.btnRandom = document.getElementById("btn-lucky-random-pick");
    this.btnResetAll = document.getElementById("btn-lucky-reset-all");

    this.batchModal = document.getElementById("lucky-batch-modal");

    this.populateDatalist();
    this.bindEvents();
    this.bindTierEvents();
    this.bindFilterEvents();
    this.updateQuotaTrackers();
    this.updateActivePrizeLabel();
    this.renderWinnersTable();
    this.setupBroadcastReceiver();
  }

  cacheWinnerElements() {
    this.winnerNumEl = document.getElementById("lucky-winner-number");
    this.winnerNameEl = document.getElementById("lucky-winner-name");
    this.winnerDeptEl = document.getElementById("lucky-winner-dept");
    this.winnerPrizeEl = document.getElementById("lucky-winner-prize");
  }

  populateDatalist() {
    const datalist = document.getElementById("lucky-emp-datalist");
    if (!datalist) return;
    datalist.innerHTML = "";

    // Prefer Gala attendees first, then others
    const sorted = [...this.employees].sort(
      (a, b) => (b.isGala ? 1 : 0) - (a.isGala ? 1 : 0),
    );
    sorted.forEach((emp) => {
      const opt = document.createElement("option");
      opt.value = emp.code;
      opt.textContent = `${emp.code} - ${emp.name} (${emp.dept} • ${emp.pos || "NV"}) ${emp.isGala ? "★ Dự Gala" : ""}`;
      datalist.appendChild(opt);
    });

    const badge = document.getElementById("lucky-participants-badge");
    if (badge) {
      badge.innerHTML = `<i class="fas fa-users"></i> ${this.galaAttendees.length} Nhân sự dự tiệc / ${this.employees.length} CBCNV`;
    }
  }

  bindEvents() {
    if (this.inputCode) {
      this.inputCode.addEventListener("input", () => this.handleCodeInput());
      this.inputCode.addEventListener("change", () => this.handleCodeInput());
      this.inputCode.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.recordWinnerFromInput();
        }
      });
    }

    if (this.inputBatchCodes) {
      this.inputBatchCodes.addEventListener("input", () =>
        this.handleBatchInput(),
      );
      this.inputBatchCodes.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.recordBatchFromInput();
        }
      });
    }

    if (this.selectPrize) {
      this.selectPrize.addEventListener("change", (e) => {
        const val = e.target.value;
        this.selectTier(val, false);
      });
    }

    if (this.btnSubmit) {
      this.btnSubmit.addEventListener("click", () =>
        this.recordWinnerFromInput(),
      );
    }

    if (this.btnBatchSubmit) {
      this.btnBatchSubmit.addEventListener("click", () =>
        this.recordBatchFromInput(),
      );
    }

    if (this.btnRandom) {
      this.btnRandom.addEventListener("click", () =>
        this.spinRandomFromGalaList(),
      );
    }

    if (this.btnResetAll) {
      this.btnResetAll.addEventListener("click", () => this.resetAllWinners());
    }

    // Keyboard ESC to close batch modal
    window.addEventListener("keydown", (e) => {
      if (window.stageSync?.isStageScreen) return;
      if (
        e.key === "Escape" &&
        this.batchModal &&
        !this.batchModal.classList.contains("hidden")
      ) {
        this.closeBatchModal();
      }
    });
  }

  bindTierEvents() {
    const tierCards = document.querySelectorAll(".tier-card");
    tierCards.forEach((card) => {
      card.addEventListener("click", () => {
        const tier = card.getAttribute("data-tier");
        if (tier) this.selectTier(tier, true);
      });
    });
  }

  bindFilterEvents() {
    const filterPills = document.querySelectorAll(
      "#lucky-table-filter-pills .filter-pill",
    );
    filterPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const f = pill.getAttribute("data-filter") || "all";
        this.filterTable(f);
      });
    });
  }

  selectTier(tierKey, updateSelect = true, shouldBroadcast = true) {
    if (this.activeTier !== tierKey && this.winnerCard) this.winnerCard.classList.add("hidden");
    this.activeTier = tierKey;

    // Update active class on tier cards
    const tierCards = document.querySelectorAll(".tier-card");
    tierCards.forEach((c) => {
      c.classList.toggle("active", c.getAttribute("data-tier") === tierKey);
    });

    // Update dropdown if needed
    if (updateSelect && this.selectPrize) {
      this.selectPrize.value = tierKey;
    }

    // Toggle custom prize wrap for spontaneous prizes
    if (this.customPrizeWrap) {
      this.customPrizeWrap.classList.toggle("hidden", tierKey !== "dacbiet");
    }

    // Filter table to current tier for convenience
    this.filterTable(tierKey);

    // Update Grand Active Prize Label on Stage
    this.updateActivePrizeLabel();

    // Broadcast tier change to stage LED window
    if (shouldBroadcast && this.channel) {
      this.channel.postMessage({
        type: "LUCKY_SELECT_TIER",
        tierKey,
      });
    }

    if (window.soundEngine) window.soundEngine.playClick();
  }

  updateActivePrizeLabel() {
    const def = this.prizeDefs[this.activeTier] || this.prizeDefs["donghanh"];
    const imgEl = document.getElementById("active-prize-img");
    const badgeOverlayEl = document.getElementById(
      "active-prize-badge-overlay",
    );
    const tierBadgeEl = document.getElementById("active-prize-tier-badge");
    const roundPillEl = document.getElementById("active-prize-round-pill");
    const nameEl = document.getElementById("active-prize-name");
    const fillEl = document.getElementById("active-prize-progress-fill");
    const quotaEl = document.getElementById("active-prize-progress-quota");

    const awarded = this.recordedWinners.filter(
      (w) =>
        w.prizeId === this.activeTier ||
        (this.activeTier === "dacbiet" &&
          !["donghanh", "mayman", "ba", "nhi", "nhat"].includes(w.prizeId)),
    ).length;
    const total = def.total;
    const pct =
      total === 99 ? 100 : Math.min(100, Math.round((awarded / total) * 100));

    if (imgEl) {
      imgEl.src = def.image || "assets/images/logo-official-full.png";
      imgEl.alt = def.gift;
    }
    if (badgeOverlayEl) badgeOverlayEl.textContent = def.round;
    if (tierBadgeEl) {
      tierBadgeEl.textContent = def.badge;
      tierBadgeEl.className = `active-prize-tier-badge ${def.tagClass || "tag-gold"}`;
    }
    if (roundPillEl) {
      roundPillEl.innerHTML = `<i class="fas fa-gift"></i> ${def.total === 99 ? "TÙY CHỌN" : def.total + " SUẤT QUÀ"}`;
    }
    if (nameEl) nameEl.textContent = def.gift || def.name;
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (quotaEl) {
      quotaEl.innerHTML =
        def.total === 99
          ? `Đã trao: <strong>${awarded}</strong> giải phát sinh`
          : `Đã trao: <strong>${awarded} / ${total}</strong> giải (${pct}%)`;
    }
  }

  setEntryMode(mode) {
    this.entryMode = mode;
    const tabSingle = document.getElementById("mode-tab-single");
    const tabBatch = document.getElementById("mode-tab-batch");
    const colSingle = document.getElementById("col-entry-single");
    const colBatch = document.getElementById("col-entry-batch");

    if (tabSingle) tabSingle.classList.toggle("active", mode === "single");
    if (tabBatch) tabBatch.classList.toggle("active", mode === "batch");

    if (colSingle) colSingle.classList.toggle("hidden", mode !== "single");
    if (colBatch) colBatch.classList.toggle("hidden", mode !== "batch");

    if (this.btnSubmit)
      this.btnSubmit.classList.toggle("hidden", mode !== "single");
    if (this.btnBatchSubmit)
      this.btnBatchSubmit.classList.toggle("hidden", mode !== "batch");

    if (mode === "single") {
      if (this.inputCode) this.inputCode.focus();
    } else {
      if (this.inputBatchCodes) this.inputBatchCodes.focus();
    }

    if (window.soundEngine) window.soundEngine.playClick();
  }

  setQuickCustomPrize(name, value) {
    if (this.inputCustomName) this.inputCustomName.value = name;
    if (this.inputCustomValue) this.inputCustomValue.value = value;
    if (window.soundEngine) window.soundEngine.playClick();
  }

  setupBroadcastReceiver() {
    if (!this.channel) return;
    this.channel.addEventListener("message", (e) => {
      if (!window.stageSync?.isStageScreen) return;
      const msg = e.data;
      if (!msg || !msg.type) return;

      if (msg.type === "LUCKY_RECORDS_UPDATE") {
        this.recordedWinners = msg.winners;
        this.winnerCard.innerHTML = msg.winnerHtml;
        this.winnerCard.className = msg.winnerClass;
        // Restored markup also needs fresh references for the next presentation.
        this.cacheWinnerElements();
        [this.slotD1, this.slotD2, this.slotD3].forEach((el, i) => {
          el.querySelector('.slot-digit-val').textContent = msg.digits[i];
        });
        this.updateQuotaTrackers();
        this.updateActivePrizeLabel();
      } else if (msg.type === "LUCKY_BATCH_PAGE") {
        this.batchPage = msg.page;
        this.renderBatchPage();
      } else if (msg.type === "LUCKY_SHOW_WINNER") {
        this.celebrateAndRecordWinner(
          msg.emp,
          msg.prizeKey,
          msg.customInfo,
          false,
        );
      } else if (msg.type === "LUCKY_SHOW_BATCH_MODAL") {
        this.displayBatchModal(
          msg.winners,
          msg.batchTitle,
          msg.batchBadge,
          false,
        );
      } else if (msg.type === "LUCKY_HIDE_BATCH_MODAL") {
        this.closeBatchModal(false);
      } else if (msg.type === "LUCKY_SELECT_TIER") {
        if (msg.tierKey) {
          this.selectTier(msg.tierKey, true, false);
        }
      } else if (msg.type === "LUCKY_DELETE_WINNER") {
        this.deleteWinner(msg.id, false);
      } else if (msg.type === "LUCKY_RESET_WINNERS") {
        this.recordedWinners = [];
        this.saveRecordedWinners();
        this.updateQuotaTrackers();
        this.renderWinnersTable();
        this.winnerCard.classList.add("hidden");
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
      codeStr = String(num).padStart(3, "0");
      const byCode = this.employees.find((e) => e.code === codeStr);
      if (byCode) return byCode;
    }

    // 2. Try raw code match
    const byRawCode = this.employees.find((e) => e.code.toLowerCase() === q);
    if (byRawCode) return byRawCode;

    // 3. Try exact or partial name match
    const byName = this.employees.find((e) => e.name.toLowerCase() === q);
    if (byName) return byName;

    const byPartialName = this.employees.find((e) =>
      e.name.toLowerCase().includes(q),
    );
    if (byPartialName) return byPartialName;

    return null;
  }

  handleCodeInput() {
    if (!this.inputCode || !this.previewCard) return;
    const val = this.inputCode.value.trim();

    if (!val) {
      this.previewCard.classList.add("hidden");
      return;
    }

    const emp = this.findEmployee(val);
    if (emp) {
      this.previewCard.classList.remove("hidden");
      if (this.previewName) this.previewName.textContent = emp.name;
      if (this.previewSub) {
        this.previewSub.textContent = `${emp.pos || "Nhân viên"} • Phòng ${emp.dept}`;
      }
      if (this.previewStatus) {
        const alreadyWon = this.recordedWinners.find(
          (w) => w.code === emp.code,
        );
        if (alreadyWon) {
          this.previewStatus.className = "preview-status preview-status-warn";
          this.previewStatus.textContent = `⚠️ Đã trúng ${alreadyWon.prizeShort}`;
        } else if (emp.isGala) {
          this.previewStatus.className = "preview-status";
          this.previewStatus.textContent = "🟢 Có mặt dự Gala";
        } else {
          this.previewStatus.className =
            "preview-status preview-status-neutral";
          this.previewStatus.textContent = "⚪ CBCNV (Chưa xác nhận Gala)";
        }
      }
    } else {
      this.previewCard.classList.add("hidden");
    }
  }

  handleBatchInput() {
    if (
      !this.inputBatchCodes ||
      !this.batchPreviewCard ||
      !this.batchChipsContainer
    )
      return;
    const rawVal = this.inputBatchCodes.value.trim();

    if (!rawVal) {
      this.batchPreviewCard.classList.add("hidden");
      this.parsedBatchEmployees = [];
      return;
    }

    // Split by comma, whitespace, semicolon, newline
    const tokens = rawVal
      .split(/[\s,;\n\t]+/)
      .filter((t) => t.trim().length > 0);
    const resolved = [];
    let validCount = 0;

    let chipsHtml = "";
    tokens.forEach((tok) => {
      const emp = this.findEmployee(tok);
      if (emp) {
        const alreadyWon = this.recordedWinners.find(
          (w) => w.code === emp.code,
        );
        validCount++;
        resolved.push({ emp, token: tok, alreadyWon });

        chipsHtml += `
          <div class="batch-emp-chip ${alreadyWon ? "chip-warn" : "chip-valid"}">
            <span class="chip-code">${emp.code}</span>
            <span class="chip-name">${emp.name}</span>
            <span class="chip-sub">(${emp.dept})</span>
            ${alreadyWon ? `<span class="chip-tag-warn">⚠️ Đã trúng ${alreadyWon.prizeShort}</span>` : ""}
          </div>
        `;
      } else {
        chipsHtml += `
          <div class="batch-emp-chip chip-invalid">
            <span class="chip-code">${this.escapeHtml(tok)}</span>
            <span class="chip-name">❌ Không tìm thấy</span>
          </div>
        `;
      }
    });

    this.parsedBatchEmployees = resolved;
    this.batchChipsContainer.innerHTML = chipsHtml;
    if (this.batchPreviewCount) {
      this.batchPreviewCount.innerHTML = `<i class="fas fa-users"></i> ${validCount} nhân sự hợp lệ / ${tokens.length} mã đã nhập`;
    }
    this.batchPreviewCard.classList.remove("hidden");
  }

  getCustomPrizeInfo() {
    const customName = this.inputCustomName
      ? this.inputCustomName.value.trim()
      : "Giải Thưởng Nóng Ban Lãnh Đạo";
    const customVal = this.inputCustomValue
      ? this.inputCustomValue.value.trim()
      : "Phần Quà Vinh Danh Sân Khấu";
    return {
      name: customName || "Giải Thưởng Nóng Ban Lãnh Đạo",
      value: customVal || "Phần Quà Vinh Danh Sân Khấu",
    };
  }

  recordWinnerFromInput() {
    if (this.isSpinning) return;

    const val = this.inputCode ? this.inputCode.value.trim() : "";
    if (!val) {
      if (window.app)
        window.app.showToast(
          "⚠️ Vui lòng nhập Mã nhân viên (VD: 066, 005...)!",
        );
      if (this.inputCode) this.inputCode.focus();
      return;
    }

    const emp = this.findEmployee(val);
    if (!emp) {
      if (window.app)
        window.app.showToast(
          `❌ Không tìm thấy nhân viên với mã "${val}"! Vui lòng kiểm tra lại.`,
        );
      if (this.inputCode) this.inputCode.focus();
      return;
    }

    const prizeKey = this.selectPrize
      ? this.selectPrize.value
      : this.activeTier;
    const customInfo =
      prizeKey === "dacbiet" ? this.getCustomPrizeInfo() : null;

    // Duplicate check warning
    const alreadyWon = this.recordedWinners.find((w) => w.code === emp.code);
    if (alreadyWon) {
      const confirmContinue = confirm(
        `⚠️ CẢNH BÁO TRÙNG THƯỞNG:\n\nNhân viên ${emp.name} (Mã số ${emp.code}) đã được ghi nhận trúng "${alreadyWon.prizeShort}" trước đó!\n\nBạn có chắc chắn Ban Giám đốc muốn trao thêm giải "${this.prizeDefs[prizeKey]?.short || "này"}" không?`,
      );
      if (!confirmContinue) return;
    }

    this.celebrateAndRecordWinner(emp, prizeKey, customInfo, true);
  }

  celebrateAndRecordWinner(
    emp,
    prizeKey = "donghanh",
    customInfo = null,
    broadcast = true,
  ) {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.selectTier(prizeKey, true, false);

    const prize = this.prizeDefs[prizeKey] || this.prizeDefs.donghanh;
    const targetCode = String(emp.code).padStart(3, "0");

    // 1. Hide announcement card while rolling
    if (this.winnerCard) {
      this.winnerCard.classList.add("hidden");
    }

    if (this.btnSubmit) {
      this.btnSubmit.disabled = true;
      this.btnSubmit.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> ĐANG VINH DANH...';
    }

    // 2. Broadcast immediately if operator
    if (broadcast && this.channel) {
      this.channel.postMessage({
        type: "LUCKY_SHOW_WINNER",
        emp,
        prizeKey,
        customInfo,
      });
    }

    // 3. Fast rolling slot animation on the 3 boxes
    const digits = [this.slotD1, this.slotD2, this.slotD3];
    const targetDigits = [
      parseInt(targetCode[0], 10) || 0,
      parseInt(targetCode[1], 10) || 0,
      parseInt(targetCode[2], 10) || 0,
    ];

    digits.forEach((el, idx) => {
      if (el) {
        el.classList.add("rolling");
        this.spinIntervals[idx] = setInterval(() => {
          const valEl = el.querySelector(".slot-digit-val") || el;
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
      this.finishWinnerPresentation(
        emp,
        prize,
        targetCode,
        customInfo,
        broadcast,
      );
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
      el.classList.remove("rolling");
      el.classList.add("locked");
      const valEl = el.querySelector(".slot-digit-val") || el;
      valEl.textContent = finalValue;
      setTimeout(() => el.classList.remove("locked"), 500);
    }
  }

  finishWinnerPresentation(emp, prize, targetCode, customInfo, broadcast) {
    this.isSpinning = false;

    if (this.btnSubmit) {
      this.btnSubmit.disabled = false;
      this.btnSubmit.innerHTML =
        '<i class="fas fa-bullhorn"></i> Vinh Danh Màn LED & Ghi Nhận';
    }

    const prizeDisplayName = customInfo
      ? `${customInfo.name} (${customInfo.value})`
      : prize.name;
    const prizeShort = customInfo ? customInfo.name : prize.short;
    const prizeBadge = customInfo ? `⭐ ${customInfo.name}` : prize.badge;

    // Populate Grand Winner Card
    if (this.winnerNumEl) this.winnerNumEl.textContent = `MÃ SỐ ${targetCode}`;
    if (this.winnerNameEl) this.winnerNameEl.textContent = emp.name;
    if (this.winnerDeptEl) {
      this.winnerDeptEl.textContent = `${emp.pos || "Nhân viên"} • Phòng ${emp.dept}`;
    }
    if (this.winnerPrizeEl) {
      this.winnerPrizeEl.textContent = `${prizeBadge}: ${prizeDisplayName}`;
      this.winnerPrizeEl.className = `winner-prize-badge ${prize.tagClass}`;
    }
    if (this.winnerCard) {
      this.winnerCard.classList.remove("hidden");
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
    if (window.stageSync?.isStageScreen) return;
    const newRecord = {
      id: "win-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      code: targetCode,
      name: emp.name,
      dept: emp.dept,
      pos: emp.pos || "Nhân viên",
      company: emp.company || "Tà Lùng Quang Minh",
      prizeId: prize.id,
      prizeName: prizeDisplayName,
      prizeShort: prizeShort,
      prizeBadge: prizeBadge,
      prizeTagClass: prize.tagClass,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isGala: !!emp.isGala,
    };

    this.recordedWinners.unshift(newRecord);
    this.saveRecordedWinners();
    this.updateQuotaTrackers();
    this.renderWinnersTable();

    // Reset input
    if (this.inputCode) {
      this.inputCode.value = "";
    }
    if (this.previewCard) {
      this.previewCard.classList.add("hidden");
    }

    if (window.app) {
      window.app.showToast(
        `🎉 Chúc mừng ${emp.name} (Mã ${targetCode}) trúng ${prizeShort}!`,
        "🏆",
      );
    }
  }

  recordBatchFromInput() {
    if (!this.parsedBatchEmployees || this.parsedBatchEmployees.length === 0) {
      alert(
        "⚠️ Vui lòng nhập ít nhất 1 mã nhân viên hợp lệ vào ô danh sách đợt!",
      );
      if (this.inputBatchCodes) this.inputBatchCodes.focus();
      return;
    }

    const prizeKey = this.selectPrize
      ? this.selectPrize.value
      : this.activeTier;
    const prize = this.prizeDefs[prizeKey] || this.prizeDefs.donghanh;
    const customInfo =
      prizeKey === "dacbiet" ? this.getCustomPrizeInfo() : null;

    const prizeDisplayName = customInfo
      ? `${customInfo.name} (${customInfo.value})`
      : prize.name;
    const prizeShort = customInfo ? customInfo.name : prize.short;
    const prizeBadge = customInfo ? `⭐ ${customInfo.name}` : prize.badge;

    // Check if any in the batch already won
    const duplicates = this.parsedBatchEmployees.filter(
      (item) => item.alreadyWon,
    );
    if (duplicates.length > 0) {
      const names = duplicates
        .map((d) => `${d.emp.name} (${d.emp.code})`)
        .join(", ");
      const confirmBatch = confirm(
        `⚠️ CÓ ${duplicates.length} NHÂN VIÊN ĐÃ TRÚNG THƯỞNG TRƯỚC ĐÓ:\n\n${names}\n\nBan Giám đốc có chắc chắn muốn trao thêm đợt "${prizeShort}" cho những người này không?`,
      );
      if (!confirmBatch) return;
    }

    const nowStr = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newlyAdded = [];

    // Add each employee to recordedWinners
    this.parsedBatchEmployees.forEach((item) => {
      const emp = item.emp;
      const targetCode = String(emp.code).padStart(3, "0");
      const rec = {
        id: "win-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
        code: targetCode,
        name: emp.name,
        dept: emp.dept,
        pos: emp.pos || "Nhân viên",
        company: emp.company || "Tà Lùng Quang Minh",
        prizeId: prize.id,
        prizeName: prizeDisplayName,
        prizeShort: prizeShort,
        prizeBadge: prizeBadge,
        prizeTagClass: prize.tagClass,
        time: nowStr,
        isGala: !!emp.isGala,
      };
      this.recordedWinners.unshift(rec);
      newlyAdded.push(rec);
    });

    this.saveRecordedWinners();
    this.updateQuotaTrackers();
    this.renderWinnersTable();

    // Clear batch input
    if (this.inputBatchCodes) this.inputBatchCodes.value = "";
    if (this.batchPreviewCard) this.batchPreviewCard.classList.add("hidden");
    this.parsedBatchEmployees = [];

    // Sound & Confetti
    if (window.soundEngine) {
      window.soundEngine.playJackpot();
      setTimeout(() => window.soundEngine.playCheer(), 500);
    }
    if (window.confettiEngine) {
      window.confettiEngine.celebrate();
      setTimeout(() => window.confettiEngine.celebrate(), 800);
    }

    if (window.app) {
      window.app.showToast(
        `🎉 Đã ghi nhận đợt ${newlyAdded.length} nhân viên trúng ${prizeShort}!`,
        "🏆",
      );
    }

    // Immediately open the Grand Batch Stage Board to honor all newly added winners
    const batchTitle = `VINH DANH ${newlyAdded.length} CÁN BỘ NHÂN VIÊN TRÚNG GIẢI`;
    const batchBadge = prizeBadge;
    this.displayBatchModal(newlyAdded, batchTitle, batchBadge, true);
  }

  openBatchModalForCurrentFilter() {
    let list = [];
    let title = "VINH DANH CÁN BỘ NHÂN VIÊN TRÚNG GIẢI";
    let badge = "🏆 BẢNG VÀNG GALA DINNER";

    if (this.activeFilter === "all") {
      list = [...this.recordedWinners];
      title = `BẢNG VÀNG TOÀN BỘ KẾT QUẢ BỐC THĂM (${list.length} GIẢI)`;
      badge = "🌟 TẤT CẢ GIẢI THƯỞNG GALA TÀ LÙNG QUANG MINH";
    } else {
      list = this.recordedWinners.filter(
        (w) => w.prizeId === this.activeFilter,
      );
      const pDef = this.prizeDefs[this.activeFilter];
      title = `DANH SÁCH TRÚNG THƯỞNG: ${pDef?.short || "ĐỢT TRAO GIẢI"}`;
      badge = pDef?.badge || "🏆 GIẢI THƯỞNG";
    }

    if (list.length === 0) {
      alert(
        "⚠️ Chưa có cán bộ nhân viên nào trong danh mục này để vinh danh lên màn hình LED!",
      );
      return;
    }

    this.displayBatchModal(list, title, badge, true);
  }

  openBatchModalForAll() {
    if (this.recordedWinners.length === 0) {
      alert("⚠️ Chưa có kết quả bốc thăm nào được ghi nhận!");
      return;
    }
    const title = `BẢNG VÀNG KẾT QUẢ BỐC THĂM MAY MẮN GALA TÀ LÙNG QUANG MINH`;
    const badge = `🌟 TOÀN BỘ ${this.recordedWinners.length} GIẢI THƯỞNG`;
    this.displayBatchModal(this.recordedWinners, title, badge, true);
  }

  displayBatchModal(winnersList, title, badge, broadcast = true) {
    if (!this.batchModal) return;
    this.batchWinners = winnersList;
    this.batchPage = 0;

    const titleEl = document.getElementById("batch-stage-title");
    const badgeEl = document.getElementById("batch-stage-badge");

    if (titleEl) titleEl.textContent = title;
    if (badgeEl) badgeEl.textContent = badge;

    this.renderBatchPage();

    this.batchModal.classList.remove("hidden");

    if (broadcast && this.channel) {
      this.channel.postMessage({
        type: "LUCKY_SHOW_BATCH_MODAL",
        winners: winnersList,
        batchTitle: title,
        batchBadge: badge,
      });
    }

    if (window.soundEngine) window.soundEngine.playCheer();
    if (window.confettiEngine) window.confettiEngine.celebrate();
  }

  changeBatchPage(offset) {
    const pages = Math.ceil((this.batchWinners?.length || 0) / 6);
    this.batchPage = Math.max(0, Math.min(pages - 1, this.batchPage + offset));
    this.renderBatchPage();
    if (this.channel) this.channel.postMessage({ type: "LUCKY_BATCH_PAGE", page: this.batchPage });
  }

  renderBatchPage() {
    const gridEl = document.getElementById("batch-winners-grid");
    const winnersList = (this.batchWinners || []).slice(this.batchPage * 6, (this.batchPage + 1) * 6);
    const pages = Math.max(1, Math.ceil((this.batchWinners?.length || 0) / 6));
    document.getElementById("batch-page-indicator").textContent = `Trang ${this.batchPage + 1} / ${pages}`;
    document.getElementById("batch-page-prev").disabled = this.batchPage === 0;
    document.getElementById("batch-page-next").disabled = this.batchPage >= pages - 1;
    if (gridEl) {
      let cardsHtml = "";
      winnersList.forEach((w) => {
        cardsHtml += `
          <div class="batch-winner-card ${w.prizeTagClass}">
            <div class="bcard-top">
              <span class="bcard-code-badge"><i class="fas fa-ticket"></i> VÉ #${this.escapeHtml(w.code)}</span>
              <span class="bcard-prize-tag ${w.prizeTagClass}">${this.escapeHtml(w.prizeShort)}</span>
            </div>
            <div class="bcard-content">
              <h3 class="bcard-name">${this.escapeHtml(w.name)}</h3>
              <div class="bcard-pos">${this.escapeHtml(w.pos)}</div>
              <div class="bcard-dept"><i class="fas fa-building"></i> Phòng ${this.escapeHtml(w.dept)}</div>
            </div>
            <div class="bcard-gift-footer">
              <i class="fas fa-gift"></i> ${this.escapeHtml(w.prizeName)}
            </div>
          </div>
        `;
      });
      gridEl.innerHTML = cardsHtml;
    }
  }

  closeBatchModal(broadcast = true) {
    if (this.batchModal) {
      this.batchModal.classList.add("hidden");
    }

    if (broadcast && this.channel) {
      this.channel.postMessage({
        type: "LUCKY_HIDE_BATCH_MODAL",
      });
    }
  }

  updateQuotaTrackers() {
    const counts = {
      donghanh: 0,
      mayman: 0,
      ba: 0,
      nhi: 0,
      nhat: 0,
      dacbiet: 0,
    };

    this.recordedWinners.forEach((w) => {
      if (counts[w.prizeId] !== undefined) {
        counts[w.prizeId]++;
      } else {
        counts.dacbiet++;
      }
    });

    const elDonghanh = document.getElementById("quota-donghanh");
    const elMayman = document.getElementById("quota-mayman");
    const elBa = document.getElementById("quota-ba");
    const elNhi = document.getElementById("quota-nhi");
    const elNhat = document.getElementById("quota-nhat");
    const elDacbiet = document.getElementById("quota-dacbiet");

    if (elDonghanh) elDonghanh.textContent = `${counts.donghanh}/12`;
    if (elMayman) elMayman.textContent = `${counts.mayman}/8`;
    if (elBa) elBa.textContent = `${counts.ba}/5`;
    if (elNhi) elNhi.textContent = `${counts.nhi}/3`;
    if (elNhat) elNhat.textContent = `${counts.nhat}/1`;
    if (elDacbiet) elDacbiet.textContent = `${counts.dacbiet}`;

    // Update filter pill counts
    const pAll = document.getElementById("pill-count-all");
    const pDonghanh = document.getElementById("pill-count-donghanh");
    const pMayman = document.getElementById("pill-count-mayman");
    const pBa = document.getElementById("pill-count-ba");
    const pNhi = document.getElementById("pill-count-nhi");
    const pNhat = document.getElementById("pill-count-nhat");
    const pDacbiet = document.getElementById("pill-count-dacbiet");

    if (pAll) pAll.textContent = this.recordedWinners.length;
    if (pDonghanh) pDonghanh.textContent = `${counts.donghanh}/12`;
    if (pMayman) pMayman.textContent = `${counts.mayman}/8`;
    if (pBa) pBa.textContent = `${counts.ba}/5`;
    if (pNhi) pNhi.textContent = `${counts.nhi}/3`;
    if (pNhat) pNhat.textContent = `${counts.nhat}/1`;
    if (pDacbiet) pDacbiet.textContent = counts.dacbiet;

    // Check completion indicators on tier buttons
    const btnDonghanh = document.getElementById("tier-btn-donghanh");
    const btnMayman = document.getElementById("tier-btn-mayman");
    const btnBa = document.getElementById("tier-btn-ba");
    const btnNhi = document.getElementById("tier-btn-nhi");
    const btnNhat = document.getElementById("tier-btn-nhat");

    if (btnDonghanh)
      btnDonghanh.classList.toggle("tier-complete", counts.donghanh >= 12);
    if (btnMayman)
      btnMayman.classList.toggle("tier-complete", counts.mayman >= 8);
    if (btnBa) btnBa.classList.toggle("tier-complete", counts.ba >= 5);
    if (btnNhi) btnNhi.classList.toggle("tier-complete", counts.nhi >= 3);
    if (btnNhat) btnNhat.classList.toggle("tier-complete", counts.nhat >= 1);

    // Also sync the Grand Active Prize Label
    this.updateActivePrizeLabel();
  }

  filterTable(filterKey) {
    this.activeFilter = filterKey;

    const pills = document.querySelectorAll(
      "#lucky-table-filter-pills .filter-pill",
    );
    pills.forEach((p) => {
      p.classList.toggle("active", p.getAttribute("data-filter") === filterKey);
    });

    this.renderWinnersTable();
  }

  spinRandomFromGalaList() {
    if (this.isSpinning) return;

    // Filter Gala participants who have not won yet
    const alreadyWonCodes = new Set(this.recordedWinners.map((w) => w.code));
    let eligible = this.galaAttendees.filter(
      (e) => !alreadyWonCodes.has(e.code),
    );

    if (eligible.length === 0) {
      eligible = this.employees.filter((e) => !alreadyWonCodes.has(e.code));
    }

    if (eligible.length === 0) {
      alert(
        "⚠️ Toàn bộ danh sách nhân viên đều đã trúng giải! Bạn có thể xóa bớt lịch sử hoặc tiếp tục trao giải trùng.",
      );
      return;
    }

    const randomIndex = Math.floor(Math.random() * eligible.length);
    const chosenEmp = eligible[randomIndex];

    if (this.inputCode) {
      this.inputCode.value = chosenEmp.code;
      this.handleCodeInput();
    }

    const prizeKey = this.selectPrize
      ? this.selectPrize.value
      : this.activeTier;
    const customInfo =
      prizeKey === "dacbiet" ? this.getCustomPrizeInfo() : null;
    this.celebrateAndRecordWinner(chosenEmp, prizeKey, customInfo, true);
  }

  deleteWinner(id, broadcast = true) {
    this.recordedWinners = this.recordedWinners.filter((w) => w.id !== id);
    this.saveRecordedWinners();
    this.updateQuotaTrackers();
    this.renderWinnersTable();

    if (window.soundEngine) window.soundEngine.playClick();
    if (window.app) window.app.showToast("🗑️ Đã xóa 1 mục trúng thưởng");

    if (broadcast && this.channel) {
      this.channel.postMessage({ type: "LUCKY_DELETE_WINNER", id });
    }
  }

  resetAllWinners(broadcast = true) {
    if (this.recordedWinners.length === 0) return;
    const confirmReset = confirm(
      "Bạn có chắc chắn muốn xóa toàn bộ danh sách kết quả bốc thăm đã ghi nhận không?",
    );
    if (!confirmReset) return;

    this.recordedWinners = [];
    if (this.winnerCard) this.winnerCard.classList.add("hidden");
    this.saveRecordedWinners();
    this.updateQuotaTrackers();
    this.renderWinnersTable();

    if (this.winnerCard) {
      this.winnerCard.classList.add("hidden");
    }

    if (window.app) window.app.showToast("🔄 Đã xóa toàn bộ lịch sử bốc thăm");

    if (broadcast && this.channel) {
      this.channel.postMessage({ type: "LUCKY_RESET_WINNERS" });
    }
  }

  copyWinnersSummary() {
    if (this.recordedWinners.length === 0) {
      alert("Chưa có danh sách trúng thưởng để sao chép!");
      return;
    }

    let summary = `🏆 BẢNG VÀNG BỐC THĂM MAY MẮN GALA DINNER TÀ LÙNG QUANG MINH\nCÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH\n--------------------------------------------\n`;
    this.recordedWinners.forEach((w, idx) => {
      summary += `${idx + 1}. [Mã ${w.code}] ${w.name} - ${w.dept} (${w.pos}) -> ${w.prizeShort} (${w.prizeName}) [${w.time}]\n`;
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(summary)
        .then(() => {
          if (window.app)
            window.app.showToast("📋 Đã sao chép danh sách vào bộ nhớ tạm!");
        })
        .catch(() => {
          alert(summary);
        });
    } else {
      alert(summary);
    }
  }

  renderWinnersTable() {
    const container = document.getElementById("lucky-winners-table-container");
    const countEl = document.getElementById("lucky-winners-count");

    if (countEl) {
      countEl.textContent = this.recordedWinners.length;
    }

    if (!container) return;

    let displayList = this.recordedWinners;
    if (this.activeFilter && this.activeFilter !== "all") {
      displayList = this.recordedWinners.filter(
        (w) => w.prizeId === this.activeFilter,
      );
    }

    if (displayList.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-secondary); font-size: 0.90rem; font-style: italic;">
          ${
            this.activeFilter === "all"
              ? "Chưa có kết quả bốc thăm nào được ghi nhận. Ban Lãnh đạo bốc phiếu may mắn bên ngoài, sau đó nhập mã vào hệ thống để vinh danh lên màn hình LED."
              : `Chưa có người trúng giải trong mục "${this.prizeDefs[this.activeFilter]?.short || this.activeFilter}".`
          }
        </div>
      `;
      return;
    }

    let rowsHtml = "";
    displayList.forEach((w, index) => {
      rowsHtml += `
        <tr>
          <td style="font-weight: 700; width: 35px; text-align: center;">${index + 1}</td>
          <td><span class="badge-winner-code">${this.escapeHtml(w.code)}</span></td>
          <td>
            <strong style="color: var(--tlqm-navy); font-size: 0.90rem;">${this.escapeHtml(w.name)}</strong>
            ${w.isGala ? '<span style="font-size: 0.70rem; color: #16a34a; margin-left: 4px;">● Gala</span>' : ""}
          </td>
          <td>
            <div style="font-size: 0.84rem; color: var(--text-heading); font-weight: 600;">${this.escapeHtml(w.pos)}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${this.escapeHtml(w.dept)}</div>
          </td>
          <td>
            <span class="card-pill-tag ${w.prizeTagClass}" style="font-size: 0.76rem;">${this.escapeHtml(w.prizeBadge)}</span>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">${this.escapeHtml(w.prizeName)}</div>
          </td>
          <td style="font-size: 0.74rem; color: var(--text-muted);">${w.time || ""}</td>
          <td style="text-align: center;">
            <button type="button" class="btn-delete-award" title="Xóa kết quả này" onclick="window.luckyDrawManager.deleteWinner('${w.id}')">
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
            <th>Hạng Giải Thưởng & Chi Tiết</th>
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
    if (!text) return "";
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }

  handleSpaceKey() {
    if (this.entryMode === "single") {
      if (this.inputCode && this.inputCode.value.trim()) {
        this.recordWinnerFromInput();
      } else {
        this.spinRandomFromGalaList();
      }
    } else {
      this.recordBatchFromInput();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.luckyDrawManager = new LuckyDrawManager();
  window.luckyDrawManager.init();
});
