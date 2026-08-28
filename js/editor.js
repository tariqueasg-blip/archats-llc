/* ============================================================
   Archats LLC — DEV image editor (self-contained, dev-only)
   Loaded dynamically ONLY after dev unlock (?dev=1 + PIN).
   Never referenced by the customer page.
   - Click any photo to replace it (crop / zoom / pan)
   - On save: auto-ENHANCE (2x upscale, sharpen, gentle color)
   - Overrides persist in IndexedDB (local to THIS browser only)
   - "Download" exports the enhanced file so changes can be shipped
   ============================================================ */
(function () {
  const DB_NAME = 'archats-editor';
  const STORE = 'images';
  const MAX_EDGE = 4000;
  const ENHANCE_BOOST = 2; // upscale factor on save

  // ---------- Inject editor UI + styles ----------
  const STYLE = document.createElement('style');
  STYLE.textContent = `
    #devEditPill {
      position: fixed; top: 14px; right: 14px; z-index: 9999;
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #f2590b, #e8540a); color: #fff;
      border: 1px solid rgba(255,255,255,0.25); border-radius: 999px;
      padding: 10px 18px; font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
      cursor: pointer; box-shadow: 0 8px 24px rgba(232,84,10,0.4);
      transition: transform .15s ease; -webkit-tap-highlight-color: transparent;
    }
    #devEditPill:hover { transform: translateY(-1px); }
    #devEditPill.active { outline: 2px solid #fff; outline-offset: 2px; }
    #devEditBar {
      position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%);
      z-index: 9998; display: flex; align-items: center; gap: 12px;
      background: rgba(28,28,30,0.72); -webkit-backdrop-filter: blur(18px) saturate(180%);
      backdrop-filter: blur(18px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.2); border-radius: 999px;
      padding: 10px 16px; color: #fff; font-family: var(--font-body); font-size: 13px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      transition: opacity .25s ease, transform .25s ease;
    }
    #devEditBar[hidden] { opacity: 0; pointer-events: none; transform: translateX(-50%) translateY(10px); }
    #devEditBar .dev-bar__hint { color: rgba(255,255,255,0.85); white-space: nowrap; }
    #devEditBar button {
      background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.22);
      color: #fff; border-radius: 999px; padding: 7px 14px;
      font-family: var(--font-body); font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background .2s;
    }
    #devEditBar button:hover { background: rgba(255,255,255,0.24); }
    #devEditBar button.dev-bar__solid { background: var(--orange); border-color: transparent; }
    #devEditBar button.dev-bar__solid:hover { background: #ff6a1a; }
    body.edit-mode img[data-edit-id] { outline: 2px dashed var(--orange); outline-offset: 3px; cursor: crosshair; }
    .crop { position: fixed; inset: 0; z-index: 10000; display: none; align-items: center; justify-content: center; padding: 24px; }
    .crop.open { display: flex; }
    .crop__backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.72); backdrop-filter: blur(4px); }
    .crop__dialog {
      position: relative; z-index: 2; width: min(720px, 100%);
      background: #fff; border-radius: var(--radius-lg, 16px); overflow: hidden;
      box-shadow: 0 30px 80px rgba(0,0,0,0.45);
    }
    .crop__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--line, #e5e5e5); }
    .crop__head strong { font-family: var(--font-display, inherit); font-size: 16px; }
    .crop__tools { display: flex; align-items: center; gap: 8px; }
    .crop__tools button {
      background: #f4f4f5; border: 1px solid var(--line, #e5e5e5); border-radius: 999px;
      padding: 7px 14px; font-family: var(--font-body); font-size: 13px; font-weight: 600; cursor: pointer; transition: .2s;
    }
    .crop__tools button:hover { border-color: var(--orange); color: var(--orange-deep, #b34000); }
    .crop__tools button:last-child { padding: 7px 13px; font-size: 20px; line-height: 1; }
    .crop__stage { position: relative; width: 100%; aspect-ratio: 4 / 3; max-height: 58vh; background: #111; overflow: hidden; cursor: grab; touch-action: none; }
    .crop__stage.dragging { cursor: grabbing; }
    .crop__stage img { position: absolute; max-width: none; user-select: none; -webkit-user-drag: none; }
    .crop__controls { display: flex; align-items: center; gap: 20px; padding: 14px 20px; border-top: 1px solid var(--line, #e5e5e5); }
    .crop__zoom { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: #6b7280; }
    .crop__zoom input[type=range] { width: 160px; accent-color: var(--orange); }
    .crop__hint { margin-left: auto; font-size: 12.5px; color: #9ca3af; }
    .crop__actions { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid var(--line, #e5e5e5); background: #fafafa; flex-wrap: wrap; }
    .crop__actions .btn { padding: 10px 18px; border-radius: 999px; font-weight: 600; font-size: 13.5px; border: 1px solid var(--line, #e5e5e5); cursor: pointer; transition: .2s; font-family: var(--font-body); }
    .crop__actions .btn--ghost { background: #fff; color: #111; }
    .crop__actions .btn--ghost:hover { border-color: var(--orange); color: var(--orange-deep, #b34000); }
    .crop__actions .btn--solid { background: var(--orange); color: #fff; border-color: transparent; }
    .crop__actions .btn--solid:hover { background: #ff6a1a; }
    .crop__enhance-note { padding: 8px 20px 0; font-size: 11.5px; color: #9ca3af; }
    @media (max-width: 620px) {
      .crop__hint { display: none; }
      .crop__zoom input[type=range] { width: 110px; }
      #devEditBar { bottom: 10px; }
      #devEditBar .dev-bar__hint { display: none; }
    }
  `;
  document.head.appendChild(STYLE);

  const pill = document.createElement('button');
  pill.id = 'devEditPill';
  pill.type = 'button';
  pill.innerHTML = '✏️ Edit images';
  document.body.appendChild(pill);

  const bar = document.createElement('div');
  bar.id = 'devEditBar';
  bar.hidden = true;
  bar.innerHTML =
    '<span class="dev-bar__hint">Click any photo to replace it</span>' +
    '<button id="devReset">Reset all edits</button>' +
    '<button id="devDone" class="dev-bar__solid">Done</button>';
  document.body.appendChild(bar);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  const cropModal = document.createElement('div');
  cropModal.className = 'crop';
  cropModal.id = 'devCropModal';
  cropModal.setAttribute('aria-hidden', 'true');
  cropModal.innerHTML =
    '<div class="crop__backdrop" id="devCropBackdrop"></div>' +
    '<div class="crop__dialog" role="dialog" aria-modal="true" aria-label="Crop image">' +
      '<div class="crop__head">' +
        '<strong>Crop &amp; replace photo</strong>' +
        '<div class="crop__tools">' +
          '<button id="devCropAspect">Aspect: <span>Match slot</span></button>' +
          '<button id="devCropReset">Reset</button>' +
          '<button id="devCropClose" aria-label="Close">×</button>' +
        '</div>' +
      '</div>' +
      '<p class="crop__enhance-note">Auto-enhance on save: 2× upscale + sharpen + gentle color.</p>' +
      '<div class="crop__stage" id="devCropStage"><img id="devCropImg" alt="" draggable="false" /></div>' +
      '<div class="crop__controls">' +
        '<label class="crop__zoom">Zoom <input type="range" id="devCropZoom" min="1" max="4" step="0.01" value="1" /></label>' +
        '<span class="crop__hint">Drag to position · Zoom to scale</span>' +
      '</div>' +
      '<div class="crop__actions">' +
        '<button class="btn btn--ghost" id="devCropCancel">Cancel</button>' +
        '<button class="btn btn--ghost" id="devCropDownload">Download enhanced</button>' +
        '<button class="btn btn--solid" id="devCropSave">Save &amp; apply</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(cropModal);

  const $ = (id) => document.getElementById(id);
  const editToggle = pill;
  const editorBar = bar;
  const cropStage = $('devCropStage');
  const cropImg = $('devCropImg');
  const cropZoom = $('devCropZoom');
  const cropAspectBtn = $('devCropAspect');

  // ---------- IndexedDB helpers ----------
  const dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const idbGet = (id) => dbPromise.then((db) => new Promise((res) => {
    const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
    r.onsuccess = () => res(r.result); r.onerror = () => res(undefined);
  }));
  const idbPut = (rec) => dbPromise.then((db) => new Promise((res) => {
    const tx = db.transaction(STORE, 'readwrite').objectStore(STORE).put(rec);
    tx.oncomplete = () => res();
  }));
  const idbAll = () => dbPromise.then((db) => new Promise((res) => {
    const r = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    r.onsuccess = () => res(r.result);
  }));
  const idbClear = () => dbPromise.then((db) => new Promise((res) => {
    const tx = db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
    tx.oncomplete = () => res();
  }));

  let editing = false;
  let targetImg = null;
  let aspectLocked = true;
  let slotAspect = 4 / 3;
  let nat = { w: 0, h: 0 };
  let pan = { x: 0, y: 0 };
  let zoom = 1;
  let drag = null;

  // ---------- Apply saved overrides on load ----------
  async function applySaved() {
    try {
      const records = await idbAll();
      for (const rec of records) {
        const img = document.querySelector(`img[data-edit-id="${rec.id}"]`);
        if (img) {
          if (!img.dataset.original) img.dataset.original = img.getAttribute('src');
          img.src = URL.createObjectURL(rec.blob);
        }
      }
    } catch (e) { /* ignore */ }
  }

  // ---------- Edit mode ----------
  function setEditMode(on) {
    editing = on;
    document.body.classList.toggle('edit-mode', on);
    editToggle.classList.toggle('active', on);
    editorBar.hidden = !on;
  }
  editToggle.addEventListener('click', () => setEditMode(!editing));
  $('devDone').addEventListener('click', () => setEditMode(false));
  $('devReset').addEventListener('click', async () => {
    if (!confirm('Reset all image edits back to the originals?')) return;
    await idbClear();
    document.querySelectorAll('img[data-edit-id]').forEach((img) => {
      if (img.dataset.original) img.src = img.dataset.original;
    });
    setEditMode(false);
  });

  // ---------- Click interception ----------
  document.addEventListener('click', (e) => {
    if (!editing) return;
    const img = e.target.closest('img[data-edit-id]');
    if (!img) return;
    e.preventDefault();
    e.stopPropagation();
    targetImg = img;
    fileInput.value = '';
    fileInput.click();
  });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    openCrop(URL.createObjectURL(file));
  });

  // ---------- Crop modal ----------
  function openCrop(src) {
    cropImg.onload = () => {
      nat = { w: cropImg.naturalWidth, h: cropImg.naturalHeight };
      slotAspect = targetAspect();
      pan = { x: 0, y: 0 };
      zoom = 1;
      cropZoom.value = 1;
      setAspectLocked(true);
    };
    cropImg.src = src;
    cropModal.classList.add('open');
    cropModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeCrop() {
    cropModal.classList.remove('open');
    cropModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  $('devCropClose').addEventListener('click', closeCrop);
  $('devCropCancel').addEventListener('click', closeCrop);
  $('devCropBackdrop').addEventListener('click', closeCrop);

  function targetAspect() {
    const r = targetImg && (targetImg.offsetWidth / targetImg.offsetHeight);
    return (r && isFinite(r) && r > 0) ? r : 4 / 3;
  }
  function stageAspect() {
    return aspectLocked ? slotAspect : (nat.w / nat.h || 4 / 3);
  }
  function setStageAspect() { cropStage.style.aspectRatio = String(stageAspect()); }
  function setAspectLocked(locked) {
    aspectLocked = locked;
    cropAspectBtn.querySelector('span').textContent = locked ? 'Match slot' : 'Free';
    setStageAspect();
    layout();
  }
  cropAspectBtn.addEventListener('click', () => setAspectLocked(!aspectLocked));

  function layout() {
    const sw = cropStage.clientWidth;
    const sh = cropStage.clientHeight;
    if (!sw || !sh || !nat.w) return;
    const cover = Math.max(sw / nat.w, sh / nat.h);
    const s = cover * zoom;
    const w = nat.w * s;
    const h = nat.h * s;
    const maxX = Math.max(0, (w - sw) / 2);
    const maxY = Math.max(0, (h - sh) / 2);
    pan.x = Math.max(-maxX, Math.min(maxX, pan.x));
    pan.y = Math.max(-maxY, Math.min(maxY, pan.y));
    cropImg.style.width = w + 'px';
    cropImg.style.height = h + 'px';
    cropImg.style.left = ((sw - w) / 2 + pan.x) + 'px';
    cropImg.style.top = ((sh - h) / 2 + pan.y) + 'px';
  }

  cropZoom.addEventListener('input', () => { zoom = parseFloat(cropZoom.value); layout(); });
  $('devCropReset').addEventListener('click', () => {
    zoom = 1; pan = { x: 0, y: 0 }; cropZoom.value = 1; layout();
  });

  cropStage.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    cropStage.classList.add('dragging');
    cropStage.setPointerCapture(e.pointerId);
  });
  cropStage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    pan.x = drag.px + (e.clientX - drag.x);
    pan.y = drag.py + (e.clientY - drag.y);
    layout();
  });
  const endDrag = () => { drag = null; cropStage.classList.remove('dragging'); };
  cropStage.addEventListener('pointerup', endDrag);
  cropStage.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', () => { if (cropModal.classList.contains('open')) layout(); });

  // ---------- Render crop -> ENHANCE (2x upscale + sharpen + color) ----------
  function renderCrop(cb) {
    const sw = cropStage.clientWidth;
    const sh = cropStage.clientHeight;
    const cover = Math.max(sw / nat.w, sh / nat.h);
    const s = cover * zoom;
    const left = (sw - nat.w * s) / 2 + pan.x;
    const top = (sh - nat.h * s) / 2 + pan.y;
    const srcW = sw / s;
    const srcH = sh / s;
    const srcX = (0 - left) / s;
    const srcY = (0 - top) / s;
    const outW = Math.round(srcW * ENHANCE_BOOST);
    const outH = Math.round(srcH * ENHANCE_BOOST);
    const scale = Math.min(1, MAX_EDGE / Math.max(outW, outH));
    const w2 = Math.max(1, Math.round(outW * scale));
    const h2 = Math.max(1, Math.round(outH * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w2;
    canvas.height = h2;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = 'saturate(1.07) contrast(1.04)';
    ctx.drawImage(cropImg, srcX, srcY, srcW, srcH, 0, 0, w2, h2);
    ctx.filter = 'none';
    // gentle 3x3 sharpen (center-weighted, sum=1)
    const d = ctx.getImageData(0, 0, w2, h2);
    const px = d.data;
    const copy = new Uint8ClampedArray(px);
    const K = [0, -0.15, 0, -0.15, 1.6, -0.15, 0, -0.15, 0];
    for (let y = 1; y < h2 - 1; y++) {
      for (let x = 1; x < w2 - 1; x++) {
        const i = (y * w2 + x) * 4;
        for (let c = 0; c < 3; c++) {
          let v = 0;
          for (let ky = -1; ky <= 1; ky++)
            for (let kx = -1; kx <= 1; kx++)
              v += copy[((y + ky) * w2 + (x + kx)) * 4 + c] * K[(ky + 1) * 3 + (kx + 1)];
          px[i + c] = v;
        }
      }
    }
    ctx.putImageData(d, 0, 0);
    canvas.toBlob(cb, 'image/jpeg', 0.92);
  }

  // ---------- Save & apply ----------
  $('devCropSave').addEventListener('click', () => {
    renderCrop(async (blob) => {
      if (!blob) return;
      const id = targetImg.dataset.editId;
      if (!targetImg.dataset.original) targetImg.dataset.original = targetImg.getAttribute('src');
      targetImg.src = URL.createObjectURL(blob);
      await idbPut({ id, blob });
      closeCrop();
    });
  });

  // ---------- Download enhanced ----------
  $('devCropDownload').addEventListener('click', () => {
    renderCrop((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (targetImg ? targetImg.dataset.editId : 'image') + '-enhanced.jpg';
      a.click();
    });
  });

  applySaved();
})();
