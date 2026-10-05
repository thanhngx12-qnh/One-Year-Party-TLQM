/**
 * Digital Lucky Draw Manager for Gala Dinner Tà Lùng Quang Minh
 *
 * Thiết kế chuẩn hóa theo quy trình thực tế của Gala:
 * 1. Ban Tổng Giám đốc bốc thăm phiếu may mắn bên ngoài sân khấu.
 * 2. MC / Kỹ thuật viên ghi nhận Mã nhân viên vào hệ thống:
 *    - Hỗ trợ quay số từng người (hồi hộp với hiệu ứng 3 số dial).
 *    - Hỗ trợ nhập hàng loạt cả đợt (VD: 12 Giải Đồng Hành, 08 Giải May Mắn).
 * 3. Hỗ trợ đầy đủ Giải Phát Sinh / Bổ Sung Ban Lãnh Đạo (thưởng nóng, quà thêm).
 * 4. Hệ thống Quota Tracker theo dõi tiến độ từng đợt giải thưởng (12/8/5/3/1/Phát sinh).
 * 5. Bảng Vinh Danh Sân Khấu Grand Ceremonial Stage Board (Màn LED):
 *    - Vinh danh cả đợt (12 giải Đồng Hành) hoặc toàn bộ bảng vàng.
 *    - Hiển thị logo Tà Lùng Quang Minh & CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH nổi bật trang trọng.
 * 6. Tự động đồng bộ giữa hai cửa sổ cùng trình duyệt sang Màn LED sân khấu qua BroadcastChannel.
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
    this.storageKey = "tlqm_lucky_recorded_winners";
    const stored = this.readState();
    this.recordedWinners = stored.winners;
    this.auditHistory = stored.history;
    this.presentation = stored.presentation;
    this.isBusy = false;
    this.spinTimeouts = [];

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
        total: null,
        gift: "Thưởng nóng & quà tặng bất ngờ",
        round: "PHÁT SINH",
        image: "assets/images/logo-official-full.png",
      },
    };
  }

  readState() {
    const empty = { version: 1, winners: [], history: [], presentation: null };
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        this.storageError = false;
        return empty;
      }
      const value = JSON.parse(raw);
      // Existing array results remain readable; migrate on the first successful write.
      const state = Array.isArray(value) ? { ...empty, winners: value } : value;
      if (state.version !== 1 || !Array.isArray(state.winners) || !Array.isArray(state.history) ||
          state.winners.some(w => !w || typeof w.id !== "string" || typeof w.code !== "string" || typeof w.prizeId !== "string")) {
        throw new Error("Invalid result storage");
      }
      this.storageError = false;
      return state;
    } catch (error) {
      this.storageError = true;
      console.warn("Cannot read lucky draw results", error);
      return empty;
    }
  }

  showFeedback(message, error = true) {
    const el = document.getElementById("lucky-entry-feedback");
    if (el) {
      el.textContent = message;
      el.classList.toggle("is-error", error);
    }
    return false;
  }

  broadcastResults(settled = true) {
    if (window.stageSync?.isStageScreen || !this.channel) return;
    this.channel.postMessage({ type: "LUCKY_RECORDS_UPDATE", winners: this.recordedWinners, presentation: this.presentation, settled });
  }

  async changeResults(change, settled = true) {
    if (window.stageSync?.isStageScreen || this.isBusy || this.isSpinning) return null;
    if (!navigator.locks) {
      this.showFeedback("Hãy mở ứng dụng bằng Chrome/Edge qua localhost hoặc HTTPS để ghi nhận kết quả an toàn.");
      return null;
    }
    this.isBusy = true;
    this.refreshEntryFeedback();
    try {
      return await navigator.locks.request("tlqm-lucky-results", () => {
        const state = this.readState();
        if (this.storageError) {
          this.showFeedback("Không đọc được kết quả đã lưu. Dừng ghi nhận và kiểm tra dữ liệu trình duyệt; không xóa lịch sử.");
          return null;
        }
        const result = change(state);
        if (!result) return null;
        // One storage write contains results, presentation and correction history.
        localStorage.setItem(this.storageKey, JSON.stringify(state));
        this.recordedWinners = state.winners;
        this.auditHistory = state.history;
        this.presentation = state.presentation;
        this.updateQuotaTrackers();
        this.renderWinnersTable();
        this.broadcastResults(settled);
        return result;
      });
    } catch (error) {
      console.warn("Cannot save lucky draw results", error);
      this.showFeedback("Không lưu được kết quả. Chưa công bố lên LED; kiểm tra dung lượng và quyền lưu của trình duyệt.");
      return null;
    } finally {
      this.isBusy = false;
      this.refreshEntryFeedback(true);
    }
  }

  remainingQuota(prizeKey, winners = this.recordedWinners) {
    const def = this.prizeDefs[prizeKey];
    if (!def) return 0;
    return def.total === null ? Infinity : def.total - winners.filter(w => w.prizeId === prizeKey).length;
  }

  validateRecipients(employees, prizeKey, customInfo, winners = this.recordedWinners) {
    employees = employees.map(e => this.employees.find(x => x.code === e?.code));
    if (!this.prizeDefs[prizeKey]) return "Hãy chọn một hạng giải hợp lệ.";
    if (!employees.length || employees.some(e => !e || !this.employees.some(x => x.code === e.code))) return "Mã nhân viên không hợp lệ hoặc tên chưa xác định duy nhất.";
    const codes = employees.map(e => e.code);
    if (new Set(codes).size !== codes.length) return "Danh sách có mã nhân viên lặp lại. Mỗi mã chỉ nhập một lần trong đợt.";
    if (employees.length > this.remainingQuota(prizeKey, winners)) return `Đợt này chỉ còn ${Math.max(0, this.remainingQuota(prizeKey, winners))} suất. Không thể trao vượt số lượng.`;
    if (prizeKey === "dacbiet") {
      if (!customInfo?.name?.trim() || !customInfo?.value?.trim()) return "Nhập tên giải phát sinh và phần quà cụ thể trước khi công bố.";
      if (customInfo.name.length > 100 || customInfo.value.length > 160) return "Tên giải tối đa 100 ký tự; phần quà tối đa 160 ký tự để chiếu rõ trên LED.";
    } else {
      if (employees.some(e => !e.isGala)) return "Có người chưa xác nhận dự Gala. Chưa thể nhận giải chính; hãy kiểm tra danh sách hoặc chọn giải phát sinh theo quyết định Ban Lãnh đạo.";
      if (employees.some(e => winners.some(w => w.code === e.code))) return "Có người đã trúng thưởng. Không trao lặp trong 29 giải chính; giải phát sinh cần xác nhận riêng.";
    }
    return null;
  }

  createRecord(emp, prizeKey, customInfo, operationId, source) {
    const prize = this.prizeDefs[prizeKey];
    return {
      id: crypto.randomUUID(), operationId, source,
      code: emp.code, name: emp.name, dept: emp.dept, pos: emp.pos || "Nhân viên",
      company: emp.company || "Tà Lùng Quang Minh", prizeId: prizeKey,
      prizeName: customInfo ? `${customInfo.name} (${customInfo.value})` : prize.name,
      prizeShort: customInfo ? customInfo.name : prize.short,
      prizeBadge: customInfo ? `⭐ ${customInfo.name}` : prize.badge,
      prizeTagClass: prize.tagClass, customInfo,
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isGala: !!emp.isGala,
    };
  }

  confirmationText(employees, prizeKey, customInfo, winners, source = "manual") {
    const prize = this.prizeDefs[prizeKey];
    const warnings = [];
    if (prizeKey === "dacbiet") {
      warnings.push("GIẢI PHÁT SINH: xác nhận theo quyết định Ban Lãnh đạo.");
      if (employees.some(e => !e.isGala)) warnings.push("Có người chưa xác nhận dự Gala.");
      if (employees.some(e => winners.some(w => w.code === e.code))) warnings.push("Có người đã nhận giải trước đó.");
    }
    return [source === "random" ? "QUAY NGẪU NHIÊN BẰNG MÁY" : "CÔNG BỐ KẾT QUẢ PHIẾU BỐC",
      `${prize.round} • ${customInfo ? customInfo.name + " — " + customInfo.value : prize.gift}`,
      ...employees.map(e => `${e.code} — ${e.name} — ${e.dept}`), ...warnings,
      "Kiểm tra đúng người, đúng giải. Xác nhận để lưu kết quả và công bố lên LED?"].join("\n\n");
  }

  async commitWinners(employees, prizeKey, customInfo, source = "manual") {
    // Re-resolve canonical directory entries at the shared recording boundary.
    employees = employees.map(e => this.employees.find(x => x.code === e?.code));
    return this.changeResults(state => {
      const error = this.validateRecipients(employees, prizeKey, customInfo, state.winners);
      if (error) return this.showFeedback(error);
      if (source === "random" && employees.some(e => !e.isGala || state.winners.some(w => w.code === e.code))) {
        return this.showFeedback("Người được máy chọn đã nhận giải hoặc chưa xác nhận dự Gala. Hãy chọn lại từ danh sách mới nhất.");
      }
      if (!confirm(this.confirmationText(employees, prizeKey, customInfo, state.winners, source))) {
        this.showFeedback("Chưa công bố: đã hủy xác nhận.", false);
        return null;
      }
      const operationId = crypto.randomUUID();
      const added = employees.map(e => this.createRecord(e, prizeKey, customInfo, operationId, source));
      state.winners.unshift(...added);
      state.history.push({ action: "RECORD", at: new Date().toISOString(), operationId, records: added });
      state.presentation = added.length === 1 ? { type: "single", id: added[0].id } : {
        type: "batch", ids: added.map(w => w.id), title: `VINH DANH ${added.length} NGƯỜI TRÚNG GIẢI`, badge: added[0].prizeBadge,
      };
      return added;
    }, false);
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
    this.setupResultEditor();
    this.restorePresentation();
    this.refreshEntryFeedback();
    window.addEventListener("storage", event => {
      if (event.key !== this.storageKey || this.isBusy || window.stageSync?.isStageScreen) return;
      const state = this.readState();
      this.recordedWinners = state.winners;
      this.auditHistory = state.history;
      this.presentation = state.presentation;
      this.updateQuotaTrackers();
      this.renderWinnersTable();
      this.refreshEntryFeedback();
    });
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
        if (e.key === "Enter" && !e.repeat) {
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
        if (e.key === "Enter" && !e.repeat) {
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
      if (document.querySelector("dialog[open]")) return;
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

    this.refreshEntryFeedback();
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
      total === null ? 100 : Math.min(100, Math.round((awarded / total) * 100));

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
      roundPillEl.innerHTML = `<i class="fas fa-gift"></i> ${def.total === null ? "TÙY CHỌN" : def.total + " SUẤT QUÀ"}`;
    }
    if (nameEl) {
      nameEl.textContent = def.gift || def.name;
      nameEl.classList.remove("long-prize-label");
    }
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (quotaEl) {
      quotaEl.innerHTML =
        def.total === null
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

    this.refreshEntryFeedback();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  setQuickCustomPrize(name, value) {
    if (this.inputCustomName) this.inputCustomName.value = name;
    if (this.inputCustomValue) this.inputCustomValue.value = value;
    this.refreshEntryFeedback();
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
        this.presentation = msg.presentation;
        this.updateQuotaTrackers();
        if (msg.settled) this.restorePresentation();
      } else if (msg.type === "LUCKY_BATCH_PAGE") {
        this.batchPage = msg.page;
        this.renderBatchPage();
      } else if (msg.type === "LUCKY_SHOW_WINNER") {
        this.startWinnerPresentation(msg.record);
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
      }

    });
  }

  findEmployee(rawQuery) {
    const query = String(rawQuery || "").trim();
    if (/^\d{1,3}$/.test(query)) {
      return this.employees.find(e => e.code === query.padStart(3, "0")) || null;
    }
    const exact = this.employees.filter(e => e.name.toLocaleLowerCase("vi") === query.toLocaleLowerCase("vi"));
    return exact.length === 1 ? exact[0] : null;
  }

  batchEmployees() {
    const tokens = (this.inputBatchCodes?.value || "").trim().split(/[\s,;]+/).filter(Boolean);
    return tokens.map(token => this.findEmployee(token));
  }

  refreshEntryFeedback(preserveMessage = false) {
    if (!this.btnSubmit) return;
    const employees = this.entryMode === "batch" ? this.batchEmployees() : [this.findEmployee(this.inputCode?.value)];
    const error = this.validateRecipients(employees, this.activeTier, this.getCustomPrizeInfo());
    const disabled = this.isBusy || this.isSpinning || this.storageError;
    this.btnSubmit.disabled = disabled || !!error;
    this.btnBatchSubmit.disabled = disabled || !!error;
    this.btnRandom.disabled = disabled || this.remainingQuota(this.activeTier) <= 0;
    this.selectPrize.disabled = disabled;
    this.inputCode.disabled = disabled;
    this.inputBatchCodes.disabled = disabled;
    this.inputCustomName.disabled = disabled;
    this.inputCustomValue.disabled = disabled;
    document.querySelectorAll(".tier-card").forEach(button => { button.disabled = disabled; });
    document.querySelectorAll(".lucky-mode-tab, .quick-chip-btn, .board-action-buttons button, [data-result-action]").forEach(button => { button.disabled = disabled; });
    if (preserveMessage) return;
    if (disabled) {
      this.showFeedback(this.storageError ? "Không đọc được kết quả đã lưu. Dừng ghi nhận và kiểm tra dữ liệu trình duyệt." : "Đang lưu hoặc công bố kết quả. Vui lòng đợi.", !!this.storageError);
    } else if (error) {
      const blank = !(this.entryMode === "batch" ? this.inputBatchCodes.value : this.inputCode.value).trim();
      this.showFeedback(blank ? "Nhập mã phiếu đã bốc để kiểm tra người nhận và suất giải." : error, !blank);
    } else {
      const remaining = this.remainingQuota(this.activeTier);
      this.showFeedback(`${employees.length} người đã kiểm tra • ${Number.isFinite(remaining) ? "Còn " + remaining + " suất" : "Giải phát sinh"}. Xác nhận thông tin trước khi công bố.`, false);
    }
  }

  handleCodeInput() {
    this.refreshEntryFeedback();
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
    this.refreshEntryFeedback();
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
          <div class="batch-emp-chip ${alreadyWon || !emp.isGala ? "chip-warn" : "chip-valid"}">
            <span class="chip-code">${emp.code}</span>
            <span class="chip-name">${this.escapeHtml(emp.name)}</span>
            <span class="chip-sub">(${this.escapeHtml(emp.dept)})</span>
            ${alreadyWon ? `<span class="chip-tag-warn">⚠️ Đã trúng ${this.escapeHtml(alreadyWon.prizeShort)}</span>` : ""}
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
      this.batchPreviewCount.innerHTML = `<i class="fas fa-users"></i> ${validCount} mã đã nhận diện / ${tokens.length} mã đã nhập`;
    }
    this.batchPreviewCard.classList.remove("hidden");
  }

  getCustomPrizeInfo() {
    if (this.activeTier !== "dacbiet") return null;
    return { name: this.inputCustomName?.value.trim() || "", value: this.inputCustomValue?.value.trim() || "" };
  }

  async recordWinnerFromInput() {
    const employee = this.findEmployee(this.inputCode?.value);
    return this.celebrateAndRecordWinner(employee, this.activeTier, this.getCustomPrizeInfo());
  }

  async celebrateAndRecordWinner(emp, prizeKey = "donghanh", customInfo = null, broadcast = true, source = "manual") {
    if (window.stageSync?.isStageScreen) return null;
    const added = await this.commitWinners([emp], prizeKey, customInfo, source);
    if (!added) return null;
    this.inputCode.value = "";
    this.handleCodeInput();
    this.startWinnerPresentation(added[0]);
    if (this.channel) this.channel.postMessage({ type: "LUCKY_SHOW_WINNER", record: added[0] });
    return added[0];
  }

  stopPresentation() {
    this.spinTimeouts.forEach(clearTimeout);
    this.spinTimeouts = [];
    this.spinIntervals.forEach(clearInterval);
    this.spinIntervals = [null, null, null];
    this.isSpinning = false;
    [this.slotD1, this.slotD2, this.slotD3].forEach(el => el.classList.remove("rolling", "locked"));
  }

  startWinnerPresentation(record) {
    this.stopPresentation();
    this.closeBatchModal(false);
    this.isSpinning = true;
    this.selectTier(record.prizeId, true, false);
    if (record.customInfo) this.showCustomPrizeLabel(record.customInfo);
    this.winnerCard.classList.add("hidden");
    this.refreshEntryFeedback();
    const digits = [this.slotD1, this.slotD2, this.slotD3];
    digits.forEach((el, index) => {
      el.classList.add("rolling");
      this.spinIntervals[index] = setInterval(() => {
        el.querySelector(".slot-digit-val").textContent = Math.floor(Math.random() * 10);
        if (index === 0 && window.soundEngine) window.soundEngine.playSlotSpinTick();
      }, 50);
      this.spinTimeouts.push(setTimeout(() => {
        this.stopDigit(index, Number(record.code[index]));
        if (window.soundEngine) window.soundEngine.playSlotStop(index);
        if (index === 2) {
          this.isSpinning = false;
          if (this.presentation?.type !== "single" || this.presentation.id !== record.id) {
            this.restorePresentation();
            this.refreshEntryFeedback();
            return;
          }
          this.showWinnerRecord(record);
          this.refreshEntryFeedback();
          if (window.soundEngine) { window.soundEngine.playJackpot(); window.soundEngine.playCheer(); }
          if (window.confettiEngine) window.confettiEngine.celebrate();
          this.broadcastResults();
        }
      }, [1200, 2000, 2900][index]));
    });
  }

  showWinnerRecord(record) {
    this.cacheWinnerElements();
    this.winnerNumEl.textContent = `MÃ SỐ ${record.code}`;
    this.winnerNameEl.textContent = record.name;
    this.winnerDeptEl.textContent = `${record.pos} • Phòng ${record.dept}`;
    this.winnerPrizeEl.textContent = record.prizeName;
    this.winnerPrizeEl.className = `winner-prize-badge ${record.prizeTagClass}`;
    this.winnerPrizeEl.classList.toggle("long-prize-label", record.prizeName.length > 140);
    this.winnerCard.classList.remove("hidden");
    this.selectTier(record.prizeId, true, false);
    // Selecting another tier can hide the old winner; the record is now current.
    this.winnerCard.classList.remove("hidden");
    [this.slotD1, this.slotD2, this.slotD3].forEach((el, i) => { el.querySelector(".slot-digit-val").textContent = record.code[i]; });
    if (record.customInfo) {
      this.showCustomPrizeLabel(record.customInfo);
      this.inputCustomName.value = record.customInfo.name;
      this.inputCustomValue.value = record.customInfo.value;
    }
  }

  showCustomPrizeLabel(customInfo) {
    const label = document.getElementById("active-prize-name");
    label.textContent = `${customInfo.name} — ${customInfo.value}`;
    label.classList.toggle("long-prize-label", label.textContent.length > 90);
  }

  restorePresentation() {
    this.stopPresentation();
    this.winnerCard.classList.add("hidden");
    this.closeBatchModal(false);
    [this.slotD1, this.slotD2, this.slotD3].forEach(el => { el.querySelector(".slot-digit-val").textContent = "0"; });
    if (this.presentation?.type === "single") {
      const record = this.recordedWinners.find(w => w.id === this.presentation.id);
      if (record) this.showWinnerRecord(record);
    } else if (this.presentation?.type === "batch") {
      const winners = this.presentation.ids.map(id => this.recordedWinners.find(w => w.id === id)).filter(Boolean);
      if (winners.length) this.displayBatchModal(winners, this.presentation.title, this.presentation.badge, false);
    }
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

  async recordBatchFromInput() {
    const employees = this.batchEmployees();
    const added = await this.commitWinners(employees, this.activeTier, this.getCustomPrizeInfo());
    if (!added) return null;
    this.inputBatchCodes.value = "";
    this.handleBatchInput();
    this.restorePresentation();
    if (this.presentation.type === "single") {
      this.broadcastResults();
    } else {
      this.displayBatchModal(added, this.presentation.title, this.presentation.badge, true);
    }
    return added;
  }

  openBatchModalForCurrentFilter() {
    const prizeKey = this.activeFilter === "all" ? this.activeTier : this.activeFilter;
    const prize = this.prizeDefs[prizeKey];
    const winners = this.recordedWinners.filter(w => w.prizeId === prizeKey);
    if (!winners.length) {
      alert(`Chưa có người nhận ${prize.short} để vinh danh. Hãy chọn một giải đã có kết quả.`);
      return;
    }
    this.displayBatchModal(winners, `BẢNG VÀNG: ${prize.short.toLocaleUpperCase("vi-VN")}`, `${prize.badge} • ${winners.length} NGƯỜI NHẬN GIẢI`, true);
  }

  openBatchModalForAll() {
    this.openBatchModalForCurrentFilter();
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

  async spinRandomFromGalaList() {
    if (this.isBusy || this.isSpinning || window.stageSync?.isStageScreen) return null;
    const latest = this.readState();
    if (this.storageError) return this.showFeedback("Không đọc được kết quả đã lưu. Chưa thể quay ngẫu nhiên.");
    const eligible = this.galaAttendees.filter(e => !latest.winners.some(w => w.code === e.code));
    if (!eligible.length) return this.showFeedback("Không còn người dự Gala chưa trúng giải. Không tự chuyển sang người vắng mặt.");
    // Native secure randomness with rejection sampling, avoiding modulo bias.
    const buffer = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / eligible.length) * eligible.length;
    do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
    const chosen = eligible[buffer[0] % eligible.length];
    this.inputCode.value = chosen.code;
    this.handleCodeInput();
    return this.celebrateAndRecordWinner(chosen, this.activeTier, this.getCustomPrizeInfo(), true, "random");
  }

  async deleteWinner(id) {
    return this.changeResults(state => {
      const record = state.winners.find(w => w.id === id);
      if (!record) return null;
      if (!confirm(`HỦY KẾT QUẢ\n\n${record.code} — ${record.name}\n${record.prizeName}\n\nHủy kết quả này và trả lại suất giải?`)) return null;
      const reason = prompt("Lý do hủy kết quả (bắt buộc):")?.trim();
      if (!reason) return this.showFeedback("Chưa hủy: cần ghi rõ lý do.");
      state.history.push({ action: "CANCEL", at: new Date().toISOString(), reason, before: record });
      state.winners = state.winners.filter(w => w.id !== id);
      state.presentation = null;
      return true;
    }).then(result => { if (result) this.restorePresentation(); return result; });
  }

  async resetAllWinners() {
    return this.changeResults(state => {
      if (!state.winners.length) return null;
      if (!confirm(`HỦY TOÀN BỘ ${state.winners.length} KẾT QUẢ ĐANG CÓ?\n\nCác suất giải sẽ được trả lại; lịch sử hủy vẫn được giữ.`)) return null;
      const reason = prompt("Lý do hủy toàn bộ kết quả (bắt buộc):")?.trim();
      if (!reason) return this.showFeedback("Chưa hủy: cần ghi rõ lý do.");
      state.history.push({ action: "RESET", at: new Date().toISOString(), reason, before: state.winners });
      state.winners = [];
      state.presentation = null;
      return true;
    }).then(result => { if (result) this.restorePresentation(); return result; });
  }

  setupResultEditor() {
    this.editDialog = document.getElementById("lucky-edit-dialog");
    const select = document.getElementById("edit-lucky-prize");
    Object.values(this.prizeDefs).forEach(prize => {
      const option = document.createElement("option");
      option.value = prize.id;
      option.textContent = `${prize.round} • ${prize.short}`;
      select.appendChild(option);
    });
    document.getElementById("lucky-winners-table-container").addEventListener("click", event => {
      const button = event.target.closest("button[data-result-action]");
      if (!button) return;
      if (button.dataset.resultAction === "edit") this.openResultEditor(button.dataset.resultId);
      else this.deleteWinner(button.dataset.resultId);
    });
    select.addEventListener("change", () => { document.getElementById("edit-custom-fields").hidden = select.value !== "dacbiet"; });
    document.getElementById("lucky-edit-cancel").addEventListener("click", () => this.editDialog.close());
    document.getElementById("lucky-edit-form").addEventListener("submit", async event => {
      event.preventDefault();
      const result = await this.editWinner(this.editingId, {
        employee: this.findEmployee(document.getElementById("edit-lucky-code").value),
        prizeKey: select.value,
        customInfo: select.value === "dacbiet" ? { name: document.getElementById("edit-custom-name").value.trim(), value: document.getElementById("edit-custom-value").value.trim() } : null,
        reason: document.getElementById("edit-lucky-reason").value.trim(),
      });
      if (result) this.editDialog.close();
    });
    document.getElementById("btn-export-lucky-results").addEventListener("click", () => this.exportResults());
    [this.inputCustomName, this.inputCustomValue].forEach(el => el.addEventListener("input", () => this.refreshEntryFeedback()));
  }

  openResultEditor(id) {
    if (this.isBusy || this.isSpinning) return this.showFeedback("Đợi công bố xong trước khi sửa kết quả.");
    const record = this.recordedWinners.find(w => w.id === id);
    if (!record) return;
    this.editingId = id;
    document.getElementById("edit-lucky-code").value = record.code;
    document.getElementById("edit-lucky-prize").value = record.prizeId;
    document.getElementById("edit-custom-fields").hidden = record.prizeId !== "dacbiet";
    document.getElementById("edit-custom-name").value = record.customInfo?.name || "";
    document.getElementById("edit-custom-value").value = record.customInfo?.value || "";
    document.getElementById("edit-lucky-reason").value = "";
    document.getElementById("edit-lucky-feedback").textContent = "";
    this.editDialog.showModal();
  }

  async editWinner(id, { employee, prizeKey, customInfo, reason }) {
    reason = String(reason || "").trim();
    const result = await this.changeResults(state => {
      const before = state.winners.find(w => w.id === id);
      if (!before) return null;
      employee = this.employees.find(e => e.code === employee?.code);
      const others = state.winners.filter(w => w.id !== id);
      const error = !reason ? "Ghi rõ lý do sửa kết quả." : this.validateRecipients([employee], prizeKey, customInfo, others);
      if (error) {
        document.getElementById("edit-lucky-feedback").textContent = error;
        return this.showFeedback(error);
      }
      const canonical = this.employees.find(e => e.code === employee.code);
      if (!confirm(`SỬA KẾT QUẢ\n\nTừ: ${before.code} — ${before.name} — ${before.prizeName}\n\nSang:\n${this.confirmationText([canonical], prizeKey, customInfo, others)}\n\nLý do: ${reason}`)) return null;
      const after = { ...this.createRecord(canonical, prizeKey, customInfo, before.operationId, before.source), id: before.id, createdAt: before.createdAt, updatedAt: new Date().toISOString() };
      state.winners = state.winners.map(w => w.id === id ? after : w);
      state.history.push({ action: "EDIT", at: after.updatedAt, reason, before, after });
      state.presentation = { type: "single", id };
      return true;
    });
    if (result) this.restorePresentation();
    return result;
  }

  exportResults() {
    const state = this.readState();
    if (this.storageError) return this.showFeedback("Không đọc được dữ liệu để xuất báo cáo.");
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `tlqm-ket-qua-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
            <strong style="color: var(--text-heading); font-size: 0.90rem;">${this.escapeHtml(w.name)}</strong>
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
            <button type="button" class="btn-delete-award" title="Sửa kết quả" data-result-action="edit" data-result-id="${this.escapeHtml(w.id)}"><i class="fas fa-pen"></i></button>
            <button type="button" class="btn-delete-award" title="Hủy kết quả" data-result-action="cancel" data-result-id="${this.escapeHtml(w.id)}"><i class="fas fa-trash-can"></i></button>
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
            <th style="width: 45px; text-align: center;">Sửa / Hủy</th>
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
    if (this.isBusy || this.isSpinning) return;
    if (this.entryMode === "single") {
      if (this.inputCode && this.inputCode.value.trim()) {
        this.recordWinnerFromInput();
      } else {
        this.showFeedback("Nhập mã phiếu đã bốc trước khi công bố. Quay bằng máy dùng nút riêng.");
        this.inputCode.focus();
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
