// Browser check only; Playwright is a development tool, not an app dependency.
// PLAYWRIGHT_MODULE=/path/to/playwright node scripts/check-led.cjs
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg' };
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const output = await fs.mkdtemp(path.join(os.tmpdir(), 'tlqm-led-check-'));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    const context = await browser.newContext();
    context.setDefaultTimeout(15000);
    const operator = await context.newPage();
    await operator.setViewportSize({ width: 1366, height: 768 });
    const errors = [];
    operator.on('pageerror', e => errors.push(e.message));
    operator.on('dialog', dialog => dialog.accept(dialog.type() === 'prompt' ? 'Kiểm tra tự động bằng dữ liệu thử nghiệm' : undefined));
    await operator.goto(url);
    await operator.evaluate(() => {
      window.app.switchSection('awards');
      window.luckyDrawManager.selectTier('nhat');
    });
    const led = await context.newPage();
    await led.setViewportSize({ width: 1920, height: 1080 });
    led.on('pageerror', e => errors.push(e.message));
    await led.goto(url + '/?screen=stage');
    const settle = () => led.waitForTimeout(400);
    const check = async (expression, expected) => {
      await led.waitForFunction(expression, expected);
    };
    const frame = async (...selectors) => {
      const dimensions = await led.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
      assert.deepEqual(dimensions, { w: 1920, h: 1080 });
      for (const selector of selectors) {
        const box = await led.locator(selector).boundingBox();
        assert(box && box.width && box.height, `${selector} must be visible`);
        assert(box.x >= -1 && box.y >= -1 && box.x + box.width <= 1921 && box.y + box.height <= 1081, `${selector} clipped: ${JSON.stringify(box)}`);
      }
      const visibleButtons = await led.locator('button').evaluateAll(els => els.filter(el => el.getBoundingClientRect().width && el.getBoundingClientRect().height).length);
      assert.equal(visibleButtons, 0, 'LED must have no operator buttons');
    };
    const shot = name => led.screenshot({ path: path.join(output, name + '.png') });
    await check(() => window.app.currentSection === 'awards');
    assert.equal(await led.evaluate(() => window.luckyDrawManager.activeTier), 'nhat');
    await frame('#lucky-active-prize-card', '.lucky-slot-display');
    await shot('lucky-ready');
    console.log('PASS late-open LED receives current section and prize');

    await operator.evaluate(() => window.app.switchSection('home'));
    await settle();
    await frame('.hero-title', '.hero-desc');
    await shot('home');
    await operator.evaluate(() => window.app.switchSection('showcase'));
    const count = await operator.evaluate(() => window.showcaseManager.totalSlides);
    for (let i = 0; i < count; i++) {
      await operator.evaluate(i => window.showcaseManager.goToSlide(i), i);
      await check(i => window.showcaseManager.currentSlide === i, i);
      await settle();
      await frame('.prize-slide.active .prize-slide-inner');
    }
    await shot('showcase');
    console.log(`PASS navigation and ${count} showcase slides`);

    await operator.evaluate(() => window.app.switchSection('king'));
    await operator.click('#king-start-timer');
    await operator.waitForTimeout(1200);
    await operator.click('#king-start-timer');
    await check(() => !window.kingGame.isRunning && window.kingGame.remainingSeconds < 15);
    assert.equal(await led.evaluate(() => window.kingGame.remainingSeconds), await operator.evaluate(() => window.kingGame.remainingSeconds));
    await operator.click('#king-show-hint');
    await check(() => window.kingGame.isHintShown);
    await operator.click('#king-reveal-answer');
    await check(() => window.kingGame.isRevealed);
    await frame('.stage-instruction', '#king-tiles-container', '#king-hint-box', '#king-answer-box');
    await led.reload();
    await check(() => window.app.currentSection === 'king' && window.kingGame.isRevealed && window.kingGame.isHintShown);
    await shot('king-answer');
    console.log('PASS king timer pause, hint, answer and reload');

    await operator.evaluate(() => {
      window.app.switchSection('pose');
      window.poseGame.setTeamCount(4);
      window.poseGame.addScore(3, 2);
      window.poseGame.revealPose(true);
    });
    await operator.waitForTimeout(1200);
    await operator.click('#pose-start-timer');
    await check(() => !window.poseGame.isRunning && window.poseGame.teamCount === 4 && window.poseGame.scores[2] === 2);
    await led.reload();
    await check(() => window.app.currentSection === 'pose' && window.poseGame.teamCount === 4 && !window.poseGame.isRunning && window.poseGame.isRevealed);
    await frame('.pose-camera-frame', '#scoreboard-teams-wrapper');
    await shot('pose-four-teams');
    await operator.click('#pose-reveal-toggle-btn');
    await check(() => !window.poseGame.isRevealed);
    await operator.evaluate(() => window.poseGame.resetTimer());
    await operator.click('#pose-start-timer');
    await check(() => window.poseGame.phase === 'pose');
    await frame('#pose-cover-overlay', '#pose-timer-overlay');
    await operator.click('#pose-start-timer');
    await led.reload();
    await check(() => window.poseGame.phase === 'pose' && !window.poseGame.isRunning);
    await frame('#pose-cover-overlay', '#pose-timer-overlay');
    await operator.evaluate(() => window.poseGame.celebrateWinner());
    await check(() => document.getElementById('winner-modal').classList.contains('show'));
    await frame('#winner-modal .modal-content-card');
    await frame('#winner-modal-title', '#award-rankings-container', '#custom-awards-list');
    await shot('pose-ceremony');
    await operator.evaluate(() => window.poseGame.closeAwardModal());
    await check(() => !document.getElementById('winner-modal').classList.contains('show'));
    console.log('PASS pose phases, pause, hide, four scores, reload and ceremony');

    await operator.evaluate(() => {
      window.app.switchSection('awards');
      window.luckyDrawManager.employees.push({ code: '999', name: 'NGƯỜI THỬ GIAO DIỆN SÂN KHẤU', dept: 'Bộ phận thử nghiệm', isGala: true }, { code: '998', name: 'NGƯỜI THỬ GIAO DIỆN THỨ HAI', dept: 'Bộ phận thử nghiệm', isGala: true });
      window.luckyDrawManager.celebrateAndRecordWinner({ code: '999', name: 'NGƯỜI THỬ GIAO DIỆN SÂN KHẤU', dept: 'Bộ phận thử nghiệm', pos: 'Nhân viên thử nghiệm', isGala: true }, 'nhat');
    });
    await check(() => window.luckyDrawManager.recordedWinners.length === 1 && !document.getElementById('lucky-winner-announcement').classList.contains('hidden'));
    await frame('#lucky-active-prize-card', '#lucky-winner-announcement');
    await shot('single-winner');
    await led.reload();
    await check(() => window.luckyDrawManager.recordedWinners.length === 1 && window.app.currentSection === 'awards');
    await operator.evaluate(() => window.luckyDrawManager.celebrateAndRecordWinner({ code: '998', name: 'NGƯỜI THỬ GIAO DIỆN THỨ HAI', dept: 'Bộ phận thử nghiệm', pos: 'Nhân viên thử nghiệm', isGala: true }, 'mayman'));
    await check(() => window.luckyDrawManager.recordedWinners.length === 2 && document.getElementById('lucky-winner-name').textContent.includes('THỨ HAI'));
    assert.deepEqual(await led.evaluate(() => window.luckyDrawManager.recordedWinners.map(w => w.id)), await operator.evaluate(() => window.luckyDrawManager.recordedWinners.map(w => w.id)));
    assert.equal(await operator.evaluate(() => JSON.parse(localStorage.getItem('tlqm_lucky_recorded_winners')).winners.length), 2);
    console.log('PASS two winner presentations, reload, shared record IDs and no duplicate storage');

    await operator.evaluate(() => {
      const sample = window.luckyDrawManager.recordedWinners[0];
      const winners = Array.from({ length: 12 }, (_, i) => ({ ...sample, code: String(900 + i), name: `NHÂN VIÊN THỬ NGHIỆM SỐ ${i + 1}` }));
      window.luckyDrawManager.displayBatchModal(winners, 'VINH DANH 12 NHÂN VIÊN THỬ NGHIỆM', 'GIẢI THỬ NGHIỆM');
    });
    await check(() => document.querySelectorAll('#batch-winners-grid .batch-winner-card').length === 6);
    await frame('.lucky-batch-modal-content', '#batch-winners-grid', '#batch-winners-grid .batch-winner-card:last-child');
    await shot('batch-page-one');
    await operator.click('#batch-page-next');
    await check(() => window.luckyDrawManager.batchPage === 1);
    await led.reload();
    await check(() => document.getElementById('batch-page-indicator').textContent === 'Trang 2 / 2');
    await operator.click('#batch-page-prev');
    await check(() => window.luckyDrawManager.batchPage === 0);
    await operator.evaluate(() => {
      const sample = window.luckyDrawManager.recordedWinners[0];
      window.luckyDrawManager.displayBatchModal(Array.from({ length: 29 }, (_, i) => ({ ...sample, code: String(900 + i), name: `NHÂN VIÊN THỬ NGHIỆM SỐ ${i + 1}` })), 'BẢNG VÀNG 29 GIẢI THỬ NGHIỆM', 'BẢNG VÀNG');
      for (let i = 0; i < 4; i++) window.luckyDrawManager.changeBatchPage(1);
    });
    await check(() => document.getElementById('batch-page-indicator').textContent === 'Trang 5 / 5');
    assert.equal(await led.locator('#batch-winners-grid .batch-winner-card').count(), 5);
    await frame('#batch-winners-grid .batch-winner-card:last-child');
    await operator.evaluate(() => window.luckyDrawManager.closeBatchModal());
    await check(() => document.getElementById('lucky-batch-modal').classList.contains('hidden'));
    assert.equal(await operator.locator('.nav-btn:visible').count(), 5);
    await operator.waitForFunction(() => document.getElementById('stage-connection-status').classList.contains('connected'));
    await operator.evaluate(() => window.app.applyTheme('light'));
    await settle();
    assert.equal(await led.evaluate(() => document.body.classList.contains('theme-light')), false, 'LED keeps its dark theme');
    await led.keyboard.press('f');
    await led.waitForFunction(() => !!document.fullscreenElement);
    await led.keyboard.press('f');
    await led.waitForFunction(() => !document.fullscreenElement);
    await frame('#lucky-active-prize-card', '#lucky-winner-announcement');
    await led.keyboard.press('F1');
    assert.equal(await led.evaluate(() => window.app.currentSection), 'awards', 'LED cannot accidentally navigate with operator shortcuts');
    await operator.evaluate(() => window.luckyDrawManager.resetAllWinners());
    await check(() => window.luckyDrawManager.recordedWinners.length === 0 && document.getElementById('lucky-winner-announcement').classList.contains('hidden'));
    await led.close();
    await operator.waitForFunction(() => !document.getElementById('stage-connection-status').classList.contains('connected'), { timeout: 10000 });
    assert.deepEqual(errors, []);
    console.log('PASS 12/29-person pages, reload, controls, dark theme, fullscreen, reset and disconnect status');
    await require('./lucky-scenarios.cjs')(browser, url, output);
    console.log('Screenshots:', output);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
