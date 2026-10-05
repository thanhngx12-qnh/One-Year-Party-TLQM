// Business checks run in disposable browser profiles with fictional people only.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = async function checkLucky(browser, url, output) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const fixtures = Array.from({ length: 36 }, (_, i) => ({ code: String(900 + i), name: `NHÂN SỰ THỬ NGHIỆM ${i}`, dept: 'Bộ phận kiểm thử', pos: 'Nhân viên thử nghiệm', isGala: i !== 2 }));
  await context.addInitScript(people => Object.defineProperty(window, 'TLQM_EMPLOYEES', { get: () => people, set: () => {} }), fixtures);
  const operator = await context.newPage();
  const errors = [];
  const dialogs = [];
  let accept = true;
  let reason = 'Đối chiếu phiếu thử nghiệm';
  operator.on('pageerror', e => errors.push(e.message));
  operator.on('dialog', dialog => {
    dialogs.push(dialog.message());
    return accept ? dialog.accept(dialog.type() === 'prompt' ? reason : undefined) : dialog.dismiss();
  });
  const state = () => operator.evaluate(() => JSON.parse(localStorage.getItem('tlqm_lucky_recorded_winners')));
  const call = (method, ...args) => operator.evaluate(({ method, args }) => window.luckyDrawManager[method](...args), { method, args });
  const employee = n => fixtures[n];
  const publish = (n, prize, custom) => call('celebrateAndRecordWinner', employee(n), prize, custom);
  const settle = () => operator.waitForFunction(() => !window.luckyDrawManager.isSpinning);
  let led;
  try {
    await operator.goto(url);
    await operator.evaluate(() => window.app.switchSection('awards'));
    led = await context.newPage();
    await led.setViewportSize({ width: 1920, height: 1080 });
    led.on('pageerror', e => errors.push(e.message));
    await led.goto(url + '/?screen=stage');
    const original = await state();
    assert.equal(await call('findEmployee', '900xyz'), null);
    assert.equal(await call('findEmployee', 'NHÂN SỰ THỬ'), null);
    assert.equal(await publish(2, 'donghanh'), null);
    assert.equal(await publish(2, 'donghanh'), null);
    assert.deepEqual(await state(), original);
    const double = await operator.evaluate(person => Promise.all([
      window.luckyDrawManager.celebrateAndRecordWinner(person, 'nhat'),
      window.luckyDrawManager.celebrateAndRecordWinner(person, 'nhat'),
    ]), employee(0));
    assert.equal(double.filter(Boolean).length, 1, 'Repeated clicks must commit once');
    const firstId = double.find(Boolean).id;
    assert.equal((await state()).winners.length, 1, 'Save before animation finishes');
    await led.reload();
    await led.waitForFunction(() => document.getElementById('lucky-winner-number').textContent.includes('900') && !document.getElementById('lucky-winner-announcement').classList.contains('hidden'));
    await settle();
    assert.equal((await state()).winners.length, 1);
    assert.equal(await publish(1, 'nhat'), null, 'Quota one is closed');
    assert.equal(await publish(0, 'mayman'), null, 'No second official prize');
    assert.equal(await call('celebrateAndRecordWinner', { ...employee(2), isGala: true }, 'donghanh'), null, 'Canonical attendance must win over supplied flags');
    console.log('PASS invalid identifiers, attendance, double clicks, persisted animation/reload, duplicates and quota');

    await call('setEntryMode', 'batch');
    await call('selectTier', 'mayman');
    await operator.fill('#input-lucky-batch-codes', '903, 999');
    assert.equal(await call('recordBatchFromInput'), null, 'Reject the whole invalid batch');
    await operator.fill('#input-lucky-batch-codes', '903, 903');
    assert.equal(await call('recordBatchFromInput'), null, 'Reject repeated batch codes');
    await operator.fill('#input-lucky-batch-codes', '903,904,905,906,907,908,909,910,911');
    assert.equal(await call('recordBatchFromInput'), null, 'Reject batch over quota');
    await operator.fill('#input-lucky-batch-codes', '903,904');
    const batch = await call('recordBatchFromInput');
    assert.equal(batch.length, 2);
    assert.equal(new Set(batch.map(w => w.operationId)).size, 1);
    await led.waitForFunction(() => document.querySelectorAll('#batch-winners-grid .batch-winner-card').length === 2 && !document.getElementById('lucky-batch-modal').classList.contains('hidden'));
    await call('closeBatchModal');
    await call('setEntryMode', 'single');
    console.log('PASS batch all-or-nothing, duplicate detection, quota and one shared operation');
    await call('filterTable', 'all');
    await operator.click('#btn-stage-show-all');
    await led.waitForFunction(() => window.luckyDrawManager.batchWinners.length === 2 && window.luckyDrawManager.batchWinners.every(w => w.prizeId === 'mayman'));
    assert.equal(await operator.evaluate(() => getComputedStyle(document.querySelector('.lucky-batch-modal-content')).backgroundColor), 'rgb(248, 250, 252)');
    assert.equal(await led.evaluate(() => getComputedStyle(document.querySelector('.lucky-batch-modal-content')).backgroundColor), 'rgb(248, 250, 252)');
    await led.reload();
    await led.waitForFunction(() => window.luckyDrawManager.batchWinners.length === 2 && window.luckyDrawManager.batchWinners.every(w => w.prizeId === 'mayman'));
    await led.screenshot({ path: path.join(output, 'selected-prize-board-light.png') });
    await call('closeBatchModal');
    await call('filterTable', 'nhat');
    await operator.click('#btn-stage-show-batch');
    await led.waitForFunction(() => window.luckyDrawManager.batchWinners.length === 1 && window.luckyDrawManager.batchWinners[0].prizeId === 'nhat');
    await call('closeBatchModal');
    const notices = dialogs.length;
    await call('selectTier', 'ba');
    await operator.click('#btn-stage-show-all');
    assert.equal(dialogs.length, notices + 1);
    assert.equal(await operator.locator('#lucky-batch-modal').isVisible(), false);
    await call('selectTier', 'mayman');
    console.log('PASS both board actions show only the selected prize, light appearance, reload and empty-tier notice');


    await call('filterTable', 'all');
    await operator.click(`[data-result-action="edit"][data-result-id="${firstId}"]`);
    await operator.fill('#edit-lucky-code', '902');
    await operator.fill('#edit-lucky-reason', reason);
    await operator.click('#lucky-edit-form button[type="submit"]');
    await operator.waitForFunction(() => document.getElementById('edit-lucky-feedback').textContent.includes('Gala'));
    assert.equal((await state()).winners.find(w => w.id === firstId).code, '900');
    await operator.fill('#edit-lucky-code', '905');
    await operator.click('#lucky-edit-form button[type="submit"]');
    await operator.waitForFunction(() => !document.getElementById('lucky-edit-dialog').open);
    assert.equal((await state()).winners.find(w => w.id === firstId).code, '905');
    assert.equal((await state()).history.filter(h => h.action === 'EDIT').length, 1);
    await led.waitForFunction(() => document.getElementById('lucky-winner-number').textContent.includes('905'));
    assert.equal(await call('editWinner', batch[0].id, { employee: employee(6), prizeKey: 'nhat', customInfo: null, reason }), null, 'Edit cannot overflow another tier');
    assert.equal(await call('editWinner', firstId, { employee: employee(0), prizeKey: 'nhat', customInfo: null, reason: '' }), null, 'Edit needs a reason');
    console.log('PASS edit UI, stable result ID, canonical attendance, quota, reason and LED correction');

    assert.equal(await publish(2, 'dacbiet', { name: 'Thưởng thêm', value: '' }), null);
    const special = { name: 'Thưởng Ban Lãnh đạo', value: '1.000.000 đồng' };
    const extra = await publish(2, 'dacbiet', special);
    assert(extra);
    assert(dialogs.at(-1).includes('chưa xác nhận dự Gala'));
    await settle();
    assert(await publish(5, 'dacbiet', special));
    assert(dialogs.at(-1).includes('đã nhận giải trước đó'));
    await settle();
    assert.equal(await call('commitWinners', [employee(5)], 'dacbiet', special, 'random'), null, 'Machine draw cannot repeat a winner even for special prizes');
    await led.waitForFunction(() => document.getElementById('active-prize-name').textContent.includes('1.000.000 đồng'));
    await led.reload();
    await led.waitForFunction(() => document.getElementById('active-prize-name').textContent.includes('1.000.000 đồng'));
    await led.screenshot({ path: path.join(output, 'spontaneous-winner.png') });
    await operator.evaluate(() => {
      const record = { ...window.luckyDrawManager.recordedWinners[0], customInfo: { name: 'Thưởng bổ sung '.repeat(8).slice(0, 100), value: 'Phần quà dành cho người nhận '.repeat(8).slice(0, 160) } };
      record.prizeName = `${record.customInfo.name} (${record.customInfo.value})`;
      window.luckyDrawManager.showWinnerRecord(record);
    });
    await led.reload();
    await led.waitForFunction(() => document.getElementById('active-prize-name').classList.contains('long-prize-label'));
    await led.waitForTimeout(400);
    const longBounds = await led.evaluate(() => ['lucky-active-prize-card', 'lucky-winner-announcement', 'lucky-winner-prize', 'active-prize-name'].map(id => {
      const el = document.getElementById(id), r = el.getBoundingClientRect();
      return { id, x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: el.clientWidth, scrollWidth: el.scrollWidth };
    }));
    for (const r of longBounds) assert(r.x >= 0 && r.y >= 0 && r.right <= 1920 && r.bottom <= 1080 && r.scrollWidth <= r.width, `Long prize clipped: ${JSON.stringify(r)}`);
    await led.screenshot({ path: path.join(output, 'long-spontaneous-winner.png') });
    await call('restorePresentation');
    await operator.evaluate(() => window.stageSync.sendSnapshot());

    await call('filterTable', 'all');
    await operator.screenshot({ path: path.join(output, 'operator-results.png'), fullPage: true });
    await call('openResultEditor', firstId);
    await operator.screenshot({ path: path.join(output, 'operator-edit.png') });
    await operator.click('#lucky-edit-cancel');
    console.log('PASS special prize details and explicit repeat/non-attendee confirmation');

    accept = false;
    const beforeCancel = await state();
    assert.equal(await publish(6, 'donghanh'), null);
    assert.equal(await call('deleteWinner', firstId), null);
    assert.deepEqual(await state(), beforeCancel);
    accept = true;
    reason = '';
    assert.equal(await call('deleteWinner', firstId), null);
    assert.deepEqual(await state(), beforeCancel);
    reason = 'Hủy phiếu nhập nhầm trong kiểm thử';
    assert(await call('deleteWinner', firstId));
    assert.equal(await call('remainingQuota', 'nhat'), 1);
    assert.equal((await state()).history.filter(h => h.action === 'CANCEL').length, 1);
    await led.waitForFunction(() => document.getElementById('lucky-winner-announcement').classList.contains('hidden'));
    console.log('PASS confirmation dismissal, mandatory cancellation reason, retained history and restored quota');

    const storageBefore = await state();
    await operator.evaluate(() => {
      window.originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) { if (key === 'tlqm_lucky_recorded_winners') throw new Error('Simulated disk full'); return window.originalSetItem.call(this, key, value); };
    });
    assert.equal(await publish(6, 'nhat'), null);
    await operator.waitForFunction(() => document.getElementById('lucky-entry-feedback').textContent.includes('Không lưu được'));
    assert.deepEqual(await state(), storageBefore);
    assert.equal(await led.evaluate(() => document.getElementById('lucky-winner-announcement').classList.contains('hidden')), true);
    await operator.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
    await operator.evaluate(() => { window.luckyDrawManager.inputCode.value = ''; window.luckyDrawManager.handleSpaceKey(); });
    assert.deepEqual(await state(), storageBefore, 'Space with no paper code must not draw randomly');
    await call('selectTier', 'donghanh');
    accept = false;
    await call('spinRandomFromGalaList');
    assert(dialogs.at(-1).includes('QUAY NGẪU NHIÊN BẰNG MÁY'));
    assert.deepEqual(await state(), storageBefore);
    accept = true;
    console.log('PASS failed storage prevents LED publication; blank Space and cancelled random draw do not record');

    const second = await context.newPage();
    second.on('pageerror', e => errors.push(e.message));
    second.on('dialog', dialog => dialog.accept());
    await second.goto(url);
    const recordOn = (page, person) => page.evaluate(e => window.luckyDrawManager.celebrateAndRecordWinner(e, 'nhat'), person);
    const concurrent = await Promise.all([recordOn(operator, employee(6)), recordOn(second, employee(7))]);
    assert.equal(concurrent.filter(Boolean).length, 1, 'Two operator windows share quota lock');
    assert.equal((await state()).winners.filter(w => w.prizeId === 'nhat').length, 1);
    await operator.waitForTimeout(3200);
    await second.close();
    await operator.reload();
    assert.equal((await state()).winners.filter(w => w.prizeId === 'nhat').length, 1);
    await operator.evaluate(() => window.app.switchSection('awards'));
    await operator.waitForFunction(() => !document.getElementById('lucky-winner-announcement').classList.contains('hidden'));
    console.log('PASS two simultaneous operators, fresh quota validation and operator reload');

    const downloadEvent = operator.waitForEvent('download');
    await operator.click('#btn-export-lucky-results');
    const download = await downloadEvent;
    const exported = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
    assert.deepEqual(exported, await state());
    assert(exported.history.some(h => h.action === 'EDIT') && exported.history.some(h => h.action === 'CANCEL'));
    const lastFrame = await led.evaluate(() => [document.getElementById('lucky-active-prize-card'), document.getElementById('lucky-winner-announcement')].map(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }; }));
    for (const r of lastFrame) assert(r.x >= 0 && r.y >= 0 && r.right <= 1920 && r.bottom <= 1080, 'Winner content must fit Full HD');
    await call('resetAllWinners');
    assert.equal((await state()).winners.length, 0);
    assert((await state()).history.some(h => h.action === 'RESET'));
    assert.deepEqual(errors, []);
    console.log('PASS export contains active results and history; reset retains original records');
  } finally { await context.close(); }

  // Preserve existing browser data when migrating or encountering corruption.
  for (const legacy of [true, false]) {
    const profile = await browser.newContext();
    await profile.addInitScript(people => Object.defineProperty(window, 'TLQM_EMPLOYEES', { get: () => people, set: () => {} }), fixtures);
    const page = await profile.newPage();
    page.on('dialog', dialog => dialog.accept());
    try {
      await page.goto(url);
      const seed = legacy ? JSON.stringify([{ id: 'legacy-result', code: '900', name: fixtures[0].name, prizeId: 'donghanh', prizeName: 'Giải đã lưu', prizeShort: 'Đồng Hành', isGala: true }]) : '{damaged-json';
      await page.evaluate(seed => localStorage.setItem('tlqm_lucky_recorded_winners', seed), seed);
      await page.reload();
      const result = await page.evaluate(e => window.luckyDrawManager.celebrateAndRecordWinner(e, 'mayman'), fixtures[1]);
      const raw = await page.evaluate(() => localStorage.getItem('tlqm_lucky_recorded_winners'));
      if (legacy) {
        assert(result);
        assert.equal(JSON.parse(raw).winners.length, 2);
        assert(JSON.parse(raw).winners.some(w => w.id === 'legacy-result'));
      } else { assert.equal(result, null); assert.equal(raw, seed); }
    } finally { await profile.close(); }
  }
  console.log('PASS legacy array migration and corrupt storage fail closed without erasing data');
};
