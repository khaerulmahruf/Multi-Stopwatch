
App · JS
/* Multi Stopwatch untuk timing event lari
   Tanpa framework, tanpa build. Buka index.html atau pasang di GitHub Pages. */
(() => {
  'use strict';
 
  // ---------- Konfigurasi ----------
  const STORAGE_KEY = 'multi-stopwatch-v1';
 
  // dw = perkiraan lebar angka (em) agar digit tidak "bergoyang" saat berganti
  const FONTS = [
    { name: 'Orbitron',       css: "'Orbitron', monospace",       dw: 0.80 },
    { name: 'Share Tech Mono', css: "'Share Tech Mono', monospace", dw: 0.56 },
    { name: 'Roboto Mono',    css: "'Roboto Mono', monospace",    dw: 0.62 },
    { name: 'Space Mono',     css: "'Space Mono', monospace",     dw: 0.62 },
    { name: 'Audiowide',      css: "'Audiowide', sans-serif",     dw: 0.74 },
    { name: 'Chakra Petch',   css: "'Chakra Petch', sans-serif",  dw: 0.62 },
    { name: 'Rajdhani',       css: "'Rajdhani', sans-serif",      dw: 0.54 },
    { name: 'Oswald',         css: "'Oswald', sans-serif",        dw: 0.58 },
    { name: 'Teko',           css: "'Teko', sans-serif",          dw: 0.46 },
    { name: 'Bebas Neue',     css: "'Bebas Neue', sans-serif",    dw: 0.46 },
  ];
  const PRESETS = ['5K', '10K', '21K', '42K', 'HM', 'FM', 'START', 'FINISH'];
  const COLORS = ['#00e5ff', '#39ff14', '#ffea00', '#ff3d71', '#ff9100', '#b388ff', '#ffffff', '#2979ff'];
 
  // ---------- State ----------
  let state = load() || defaultState();
 
  function defaultState() {
    return {
      nextId: 5,
      cols: 2,
      showLast: false,
      watches: [
        newWatch(1, '5K',  COLORS[0]),
        newWatch(2, '10K', COLORS[1]),
        newWatch(3, '21K', COLORS[2]),
        newWatch(4, '42K', COLORS[3]),
      ],
    };
  }
 
  function newWatch(id, top, color) {
    return {
      id, top: top || '', bottom: '', font: 'Orbitron',
      color: color || COLORS[0], size: 100, show: true, open: false,
      base: 0, startEpoch: null, laps: [], note: '',
    };
  }
 
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.watches)) return null;
      const now = performance.now();
      const epoch = Date.now();
      s.watches.forEach(w => {
        // pulihkan stopwatch yang sedang berjalan saat halaman dimuat ulang
        w.startPerf = w.startEpoch ? now - (epoch - w.startEpoch) : null;
      });
      return s;
    } catch (e) { return null; }
  }
 
  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state, (k, v) => k === 'startPerf' ? undefined : v));
      } catch (e) { /* penyimpanan penuh / diblokir */ }
    }, 150);
  }
 
  // ---------- Waktu ----------
  const isRunning = w => w.startPerf != null;
  const elapsed = w => w.base + (isRunning(w) ? performance.now() - w.startPerf : 0);
 
  function start(w) {
    if (isRunning(w)) return;
    w.startPerf = performance.now();
    w.startEpoch = Date.now();
  }
  function pause(w) {
    if (!isRunning(w)) return;
    w.base = elapsed(w);
    w.startPerf = null;
    w.startEpoch = null;
  }
  function lap(w) {
    if (!isRunning(w)) return;
    const t = Math.floor(elapsed(w));
    const prev = w.laps.length ? w.laps[w.laps.length - 1].split : 0;
    w.laps.push({ n: w.laps.length + 1, split: t, lap: t - prev, note: '' });
  }
  function reset(w) {
    w.base = 0; w.startPerf = null; w.startEpoch = null; w.laps = [];
  }
 
  const pad = (n, l) => String(n).padStart(l, '0');
  function fmt(ms) {
    ms = Math.max(0, Math.floor(ms));
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms % 1000, 3)}`;
  }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fontOf = name => FONTS.find(f => f.name === name) || FONTS[0];
  const get = id => state.watches.find(w => w.id === Number(id));
 
  // ---------- Render ----------
  const grid = document.getElementById('grid');
  const refs = new Map(); // id -> { card, chars:[], last:'' }
 
  function timeHTML() {
    // HH:MM:SS.mmm -> 12 karakter; tiap karakter punya lebar tetap
    const tpl = '00:00:00.000';
    return [...tpl].map((ch, i) => {
      if (ch === ':') return '<span class="c">:</span>';
      if (ch === '.') return '<span class="c p ms">.</span>';
      return `<span class="d${i > 8 ? ' ms' : ''}">0</span>`;
    }).join('');
  }
 
  function cardHTML(w, index) {
    const fontOpts = FONTS.map(f => `<option value="${esc(f.name)}"${f.name === w.font ? ' selected' : ''}>${esc(f.name)}</option>`).join('');
    const chips = target => PRESETS.map(p => `<button class="chip" data-action="chip" data-target="${target}" data-val="${p}">${p}</button>`).join('');
    const sw = COLORS.map(c => `<button class="sw" data-action="swatch" data-val="${c}" style="background:${c}" title="${c}" aria-label="Warna ${c}"></button>`).join('');
    return `
      <span class="slot" title="Tombol cepat ${index + 1}">${index < 9 ? index + 1 : ''}</span>
      <div class="label top"></div>
      <div class="time" aria-label="Waktu stopwatch">${timeHTML()}</div>
      <div class="lastlap"></div>
      <div class="label bottom"></div>
 
      <div class="ctrl">
        <button class="btn go" data-action="toggle">Mulai</button>
        <button class="btn" data-action="lap">Lap</button>
        <button class="btn" data-action="reset">Reset</button>
        <button class="btn icon" data-action="settings" title="Pengaturan" aria-label="Pengaturan">⚙</button>
      </div>
 
      <div class="settings"${w.open ? '' : ' hidden'}>
        <div class="field">
          <span>Teks atas</span>
          <input type="text" data-field="top" value="${esc(w.top)}" placeholder="Contoh: 21K · Half Marathon">
          <div class="chips">${chips('top')}</div>
        </div>
        <div class="field">
          <span>Teks bawah</span>
          <input type="text" data-field="bottom" value="${esc(w.bottom)}" placeholder="Contoh: Putra · Elite">
          <div class="chips">${chips('bottom')}</div>
        </div>
        <div class="field">
          <span>Font jam</span>
          <select data-field="font">${fontOpts}</select>
        </div>
        <div class="field">
          <span>Warna border dan teks</span>
          <div class="row">
            <input type="color" data-field="color" value="${esc(w.color)}" aria-label="Pilih warna">
            <div class="swatches">${sw}</div>
          </div>
        </div>
        <div class="field">
          <span>Ukuran tampilan</span>
          <input type="range" data-field="size" min="50" max="120" step="5" value="${w.size}">
        </div>
        <label class="inline check"><input type="checkbox" data-field="show"${w.show ? ' checked' : ''}> Tampilkan di mode layar</label>
        <button class="btn danger" data-action="delete">Hapus stopwatch ini</button>
      </div>
 
      <div class="laps"></div>
      <div class="note">
        <textarea data-field="note" placeholder="Catatan untuk stopwatch ini (nomor bib, kendala, dll.)">${esc(w.note)}</textarea>
      </div>`;
  }
 
  function buildCard(w, index) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = w.id;
    card.innerHTML = cardHTML(w, index);
    const chars = [...card.querySelectorAll('.time span')];
    refs.set(w.id, { card, chars, last: '' });
    applyStyle(w);
    renderLaps(w);
    syncButtons(w);
    return card;
  }
 
  function renderAll() {
    refs.clear();
    grid.textContent = '';
    state.watches.forEach((w, i) => grid.appendChild(buildCard(w, i)));
    updateLayout();
    tickAll(true);
  }
 
  // Lebar angka, titik dua, dan titik diukur dari font yang benar-benar terpasang
  const metrics = new Map();   // nama font -> { dw, cw, pw } dalam em
  const measuring = new Set();
  const measureCtx = document.createElement('canvas').getContext('2d');
 
  function measure(f) {
    measureCtx.font = `700 100px ${f.css}`;
    let dw = 0;
    for (let i = 0; i < 10; i++) dw = Math.max(dw, measureCtx.measureText(String(i)).width / 100);
    return {
      dw,
      cw: measureCtx.measureText(':').width / 100,
      pw: measureCtx.measureText('.').width / 100,
    };
  }
  function metricsFor(f) {
    // perkiraan sementara sampai font selesai dimuat dan diukur
    return metrics.get(f.name) || { dw: f.dw, cw: f.dw, pw: f.dw * 0.5 };
  }
  function ensureMetrics(f) {
    if (metrics.has(f.name) || measuring.has(f.name) || !document.fonts) return;
    measuring.add(f.name);
    document.fonts.load(`700 100px ${f.css}`).catch(() => {}).then(() => {
      metrics.set(f.name, measure(f));
      measuring.delete(f.name);
      state.watches.filter(w => w.font === f.name).forEach(applyStyle);
    });
  }
 
  function applyStyle(w) {
    const r = refs.get(w.id); if (!r) return;
    const f = fontOf(w.font);
    const m = metricsFor(f);
    const c = r.card;
    c.style.setProperty('--c', w.color);
    c.style.setProperty('--font', f.css);
    c.style.setProperty('--dw', m.dw.toFixed(3) + 'em');
    c.style.setProperty('--cw', m.cw.toFixed(3) + 'em');
    c.style.setProperty('--pw', m.pw.toFixed(3) + 'em');
    // 9 angka + 2 titik dua + 1 titik -> total lebar dalam em
    c.style.setProperty('--em', (9 * m.dw + 2 * m.cw + m.pw).toFixed(3));
    ensureMetrics(f);
    c.style.setProperty('--scale', (w.size / 100).toFixed(2));
    c.querySelector('.label.top').textContent = w.top;
    c.querySelector('.label.bottom').textContent = w.bottom;
    c.classList.toggle('hide-display', !w.show);
    const sw = c.querySelector('input[type="color"]'); if (sw) sw.value = w.color;
  }
 
  function syncButtons(w) {
    const r = refs.get(w.id); if (!r) return;
    const running = isRunning(w);
    r.card.classList.toggle('running', running);
    const t = r.card.querySelector('[data-action="toggle"]');
    t.textContent = running ? 'Jeda' : (w.base > 0 ? 'Lanjut' : 'Mulai');
    t.classList.toggle('go', !running);
  }
 
  function renderLaps(w) {
    const r = refs.get(w.id); if (!r) return;
    const box = r.card.querySelector('.laps');
    const last = r.card.querySelector('.lastlap');
    if (!w.laps.length) {
      box.innerHTML = '<div class="empty">Belum ada lap. Tekan Lap saat stopwatch berjalan.</div>';
      last.textContent = '';
      return;
    }
    let best = -1, worst = -1;
    if (w.laps.length >= 3) {
      best = w.laps.reduce((a, b) => b.lap < a.lap ? b : a).n;
      worst = w.laps.reduce((a, b) => b.lap > a.lap ? b : a).n;
    }
    const rows = w.laps.slice().reverse().map(l => `
      <div class="lap${l.n === best ? ' best' : ''}${l.n === worst ? ' worst' : ''}">
        <span class="n">#${l.n}</span>
        <span class="lt">${fmt(l.lap)}</span>
        <span class="tt">${fmt(l.split)}</span>
        <input type="text" data-field="lapnote" data-n="${l.n}" value="${esc(l.note)}" placeholder="catatan" aria-label="Catatan lap ${l.n}">
      </div>`).join('');
    box.innerHTML = `
      <div class="laps-head"><span>Lap</span><span>Waktu lap</span><span>Total</span><span>Catatan</span></div>
      <div class="laps-body">${rows}</div>`;
    const l = w.laps[w.laps.length - 1];
    last.textContent = `Lap ${l.n} · ${fmt(l.lap)}`;
  }
 
  function updateTime(w, force) {
    const r = refs.get(w.id); if (!r) return;
    if (!force && !isRunning(w)) return;
    const str = fmt(elapsed(w));
    if (str === r.last) return;
    r.last = str;
    for (let i = 0; i < str.length; i++) {
      const el = r.chars[i];
      if (el.textContent !== str[i]) el.textContent = str[i];
    }
  }
  function tickAll(force) { state.watches.forEach(w => updateTime(w, force)); }
  function loop() { tickAll(false); requestAnimationFrame(loop); }
 
  // ---------- Layout mode layar ----------
  function updateLayout() {
    const visible = state.watches.filter(w => w.show).length || 1;
    const cols = Math.min(state.cols, visible);
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--rows', Math.ceil(visible / cols));
    document.body.classList.toggle('show-last', !!state.showLast);
    document.getElementById('selCols').value = String(state.cols);
    document.getElementById('chkLast').checked = !!state.showLast;
  }
 
  // ---------- Aksi kartu ----------
  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const card = btn.closest('.card');
    const w = get(card.dataset.id);
    const a = btn.dataset.action;
 
    if (a === 'toggle') { isRunning(w) ? pause(w) : start(w); syncButtons(w); updateTime(w, true); }
    else if (a === 'lap') { lap(w); renderLaps(w); }
    else if (a === 'reset') {
      if ((elapsed(w) > 0 || w.laps.length) && !confirm('Reset stopwatch ini? Waktu dan lap akan dihapus (catatan tetap).')) return;
      reset(w); syncButtons(w); renderLaps(w); updateTime(w, true);
    }
    else if (a === 'settings') {
      w.open = !w.open;
      card.querySelector('.settings').hidden = !w.open;
    }
    else if (a === 'delete') {
      if (!confirm('Hapus stopwatch ini beserta lap dan catatannya?')) return;
      state.watches = state.watches.filter(x => x.id !== w.id);
      renderAll();
    }
    else if (a === 'chip') {
      const f = btn.dataset.target;
      w[f] = btn.dataset.val;
      card.querySelector(`[data-field="${f}"]`).value = w[f];
      applyStyle(w);
    }
    else if (a === 'swatch') { w.color = btn.dataset.val; applyStyle(w); }
    save();
  });
 
  grid.addEventListener('input', e => {
    const el = e.target.closest('[data-field]'); if (!el) return;
    const w = get(el.closest('.card').dataset.id);
    const f = el.dataset.field;
    if (f === 'top' || f === 'bottom' || f === 'note') w[f] = el.value;
    else if (f === 'color') w.color = el.value;
    else if (f === 'size') w.size = Number(el.value);
    else if (f === 'font') w.font = el.value;
    else if (f === 'lapnote') {
      const l = w.laps.find(x => x.n === Number(el.dataset.n));
      if (l) l.note = el.value;
    } else return;
    applyStyle(w);
    save();
  });
 
  grid.addEventListener('change', e => {
    const el = e.target.closest('[data-field="show"]'); if (!el) return;
    const w = get(el.closest('.card').dataset.id);
    w.show = el.checked;
    applyStyle(w); updateLayout(); save();
  });
 
  // ---------- Kontrol global ----------
  const $ = id => document.getElementById(id);
 
  $('btnAdd').onclick = () => {
    const id = state.nextId++;
    const w = newWatch(id, `Stopwatch ${state.watches.length + 1}`, COLORS[state.watches.length % COLORS.length]);
    state.watches.push(w);
    renderAll(); save();
  };
  $('btnSet').onclick = () => {
    if (state.watches.length && !confirm('Tambahkan set 5K, 10K, 21K, 42K ke daftar yang sudah ada?')) return;
    ['5K', '10K', '21K', '42K'].forEach((t, i) => state.watches.push(newWatch(state.nextId++, t, COLORS[i])));
    renderAll(); save();
  };
  $('btnStartAll').onclick = () => {
    state.watches.forEach(start);
    state.watches.forEach(syncButtons); save();
  };
  $('btnPauseAll').onclick = () => {
    state.watches.forEach(pause);
    state.watches.forEach(w => { syncButtons(w); updateTime(w, true); }); save();
  };
  $('btnResetAll').onclick = () => {
    if (!confirm('Reset SEMUA stopwatch? Semua waktu dan lap akan dihapus. Ekspor CSV dulu jika perlu.')) return;
    state.watches.forEach(reset);
    state.watches.forEach(w => { syncButtons(w); renderLaps(w); updateTime(w, true); }); save();
  };
  $('selCols').onchange = e => { state.cols = Number(e.target.value); updateLayout(); save(); };
  $('chkLast').onchange = e => { state.showLast = e.target.checked; updateLayout(); save(); };
 
  // ---------- Ekspor CSV ----------
  $('btnCsv').onclick = () => {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['No', 'Teks atas', 'Teks bawah', 'Lap', 'Waktu lap', 'Waktu total', 'Catatan lap', 'Catatan stopwatch']];
    state.watches.forEach((w, i) => {
      w.laps.forEach(l => rows.push([i + 1, w.top, w.bottom, l.n, fmt(l.lap), fmt(l.split), l.note, w.note]));
      rows.push([i + 1, w.top, w.bottom, 'FINAL', '', fmt(elapsed(w)), '', w.note]);
    });
    const csv = '\ufeff' + rows.map(r => r.map(q).join(',')).join('\r\n');
    const a = document.createElement('a');
    const d = new Date();
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}-${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}`;
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `stopwatch-${stamp}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
 
  // ---------- Mode layar & layar penuh ----------
  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
      else if (wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { /* tidak didukung */ }
  }
  function setDisplay(on) {
    document.body.classList.toggle('display', on);
    updateLayout();
    keepAwake(on);
  }
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }
  $('btnDisplay').onclick = () => setDisplay(true);
  $('btnExit').onclick = () => setDisplay(false);
  $('btnFull').onclick = $('btnFull2').onclick = toggleFullscreen;
 
  // tampilkan kursor dan tombol sebentar saat mouse digerakkan di mode layar
  let cursorTimer = null;
  document.addEventListener('mousemove', () => {
    if (!document.body.classList.contains('display')) return;
    document.body.classList.add('show-cursor');
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => document.body.classList.remove('show-cursor'), 2500);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.body.classList.contains('display')) keepAwake(true);
  });
 
  // ---------- Tombol cepat ----------
  document.addEventListener('keydown', e => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
 
    if (e.key === 'Escape') { if (document.body.classList.contains('display')) setDisplay(false); return; }
    if (e.code === 'KeyD') { setDisplay(!document.body.classList.contains('display')); return; }
 
    const m = /^Digit([1-9])$/.exec(e.code);
    if (!m) return;
    const w = state.watches[Number(m[1]) - 1];
    if (!w) return;
    e.preventDefault();
    if (e.shiftKey) { lap(w); renderLaps(w); }
    else { isRunning(w) ? pause(w) : start(w); syncButtons(w); updateTime(w, true); }
    save();
  });
 
  // Peringatan sebelum menutup tab saat ada stopwatch berjalan
  window.addEventListener('beforeunload', e => {
    if (state.watches.some(isRunning)) { e.preventDefault(); e.returnValue = ''; }
  });
 
  // ---------- Mulai ----------
  renderAll();
  requestAnimationFrame(loop);
})();
 
