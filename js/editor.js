/* Archats LLC — image editor (click to replace, crop, persist) */
(function () {
  const DB_NAME = 'archats-editor';
  const STORE = 'images';
  const MAX_EDGE = 4000;

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

  // ---------- Elements ----------
  const editToggle = document.getElementById('editToggle');
  const editorBar = document.getElementById('editorBar');
  const fileInput = document.getElementById('fileInput');
  const cropModal = document.getElementById('cropModal');
  const cropStage = document.getElementById('cropStage');
  const cropImg = document.getElementById('cropImg');
  const cropZoom = document.getElementById('cropZoom');
  const cropAspectBtn = document.getElementById('cropAspect');

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
    editorBar.setAttribute('aria-hidden', String(!on));
  }
  editToggle.addEventListener('click', () => setEditMode(!editing));
  document.getElementById('editorDone').addEventListener('click', () => setEditMode(false));
  document.getElementById('editorReset').addEventListener('click', async () => {
    if (!confirm('Reset all image edits back to the original stock photos?')) return;
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
  document.getElementById('cropClose').addEventListener('click', closeCrop);
  document.getElementById('cropCancel').addEventListener('click', closeCrop);
  document.getElementById('cropBackdrop').addEventListener('click', closeCrop);

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
  document.getElementById('cropReset').addEventListener('click', () => {
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

  // ---------- Render crop to blob ----------
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
    const scale = Math.min(1, MAX_EDGE / Math.max(srcW, srcH));
    const outW = Math.max(1, Math.round(srcW * scale));
    const outH = Math.max(1, Math.round(srcH * scale));
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    canvas.getContext('2d').drawImage(cropImg, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    canvas.toBlob(cb, 'image/jpeg', 0.92);
  }

  // ---------- Save & apply ----------
  document.getElementById('cropSave').addEventListener('click', () => {
    renderCrop(async (blob) => {
      if (!blob) return;
      const id = targetImg.dataset.editId;
      if (!targetImg.dataset.original) targetImg.dataset.original = targetImg.getAttribute('src');
      targetImg.src = URL.createObjectURL(blob);
      await idbPut({ id, blob });
      closeCrop();
    });
  });

  // ---------- Download ----------
  document.getElementById('cropDownload').addEventListener('click', () => {
    renderCrop((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (targetImg ? targetImg.dataset.editId : 'image') + '.jpg';
      a.click();
    });
  });

  applySaved();
})();
