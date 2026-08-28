/* ============================================================
   Archats LLC — DEV unlock gate (loaded only via ?dev=1)
   Prompts for a PIN; on success loads the editor and unlocks
   dev mode for this tab session (sessionStorage).

   Honest security note: this is a gate, not a vault — the PIN
   is readable by anyone who inspects the file. The REAL safety
   is that editor overrides live in IndexedDB (per-browser) and
   can never change the live site. Customers never load this
   file at all.
   ============================================================ */
(function () {
  const PIN = 'archats2026'; // change by editing this line

  if (sessionStorage.getItem('archats_dev') === '1') {
    loadEditor();
    return;
  }

  // Build the PIN prompt (clean modal, no window.prompt)
  const STYLE = document.createElement('style');
  STYLE.textContent = `
    #devPin {
      position: fixed; inset: 0; z-index: 20000; display: flex;
      align-items: center; justify-content: center; padding: 24px;
      background: rgba(9, 9, 11, 0.65); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
    }
    #devPin .devpin__card {
      width: min(360px, 100%); background: #fff; border-radius: 18px; padding: 26px 24px 22px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.45); text-align: center;
      font-family: var(--font-body, inherit);
    }
    #devPin .devpin__kicker { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--orange, #e8540a); margin: 0 0 6px; }
    #devPin h3 { margin: 0 0 6px; font-size: 18px; color: #111; }
    #devPin p { margin: 0 0 16px; font-size: 13px; color: #6b7280; }
    #devPin input {
      width: 100%; box-sizing: border-box; text-align: center; letter-spacing: .25em;
      border: 1px solid #d4d4d8; border-radius: 12px; padding: 12px;
      font-size: 16px; font-family: inherit; outline: none;
    }
    #devPin input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(232,84,10,0.15); }
    #devPin .devpin__err { color: #dc2626; font-size: 12.5px; min-height: 18px; margin: 8px 0 0; }
    #devPin .devpin__actions { display: flex; gap: 10px; margin-top: 14px; }
    #devPin button {
      flex: 1; border-radius: 999px; padding: 11px; font-size: 13.5px; font-weight: 600;
      font-family: inherit; cursor: pointer; border: 1px solid #d4d4d8; background: #fff; color: #111; transition: .2s;
    }
    #devPin button.devpin__go { background: var(--orange); color: #fff; border-color: transparent; }
    #devPin button.devpin__go:hover { background: #ff6a1a; }
  `;
  document.head.appendChild(STYLE);

  const modal = document.createElement('div');
  modal.id = 'devPin';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML =
    '<div class="devpin__card">' +
      '<p class="devpin__kicker">Developer mode</p>' +
      '<h3>Archats editor</h3>' +
      '<p>Enter the developer PIN to enable image editing.</p>' +
      '<input id="devPinInput" type="password" autocomplete="off" placeholder="••••••" />' +
      '<p class="devpin__err" id="devPinErr"></p>' +
      '<div class="devpin__actions">' +
        '<button id="devPinCancel" type="button">Cancel</button>' +
        '<button id="devPinGo" class="devpin__go" type="button">Unlock</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  const input = $id('devPinInput');
  const err = $id('devPinErr');
  const close = () => modal.remove();
  $id('devPinCancel').addEventListener('click', close);
  $id('devPinGo').addEventListener('click', tryUnlock);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
  setTimeout(() => input.focus(), 100);

  function $id(id) { return document.getElementById(id); }
  let tries = 0;
  function tryUnlock() {
    if (input.value === PIN) {
      sessionStorage.setItem('archats_dev', '1');
      modal.remove();
      loadEditor();
      return;
    }
    tries++;
    err.textContent = tries >= 3 ? 'Too many tries — refresh the page to try again.' : 'Incorrect PIN. Try again.';
    input.value = '';
    input.focus();
    if (tries >= 3) { $id('devPinGo').disabled = true; }
  }

  function loadEditor() {
    const s = document.createElement('script');
    s.src = 'js/editor.js';
    document.head.appendChild(s);
  }
})();
