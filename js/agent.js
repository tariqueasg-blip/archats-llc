/* Archats LLC — 24/7 chat agent
   Answers FAQs, qualifies visitors, and captures leads so no inquiry is lost.
   Self-contained (no backend required). Optional lead endpoint can be wired in below.
*/

(function () {
  'use strict';

  // ============================================================
  // CONFIG — edit these to change business details / lead routing
  // ============================================================
  const BIZ = {
    name: 'Archats LLC',
    phone: '(917) 780-9790',
    phoneHref: 'tel:+19177809790',
    email: 'archatsllc@gmail.com',
    hours: 'Mon to Sat, 7am to 6pm',
    areas: ['Queens', 'Long Island', 'Brooklyn', 'New Jersey'],
  };

  // Set this to a form endpoint (Netlify / Formspree / Getform) to have chat
  // leads delivered to your email automatically. Leave '' to store locally only.
  const LEAD_ENDPOINT = ''; // e.g. 'https://formspree.io/f/yourId'

  // ============================================================
  // Knowledge
  // ============================================================
  const SERVICES = [
    { key: 'kitchen', label: 'Kitchen Remodeling' },
    { key: 'bathroom', label: 'Bathroom Renovation' },
    { key: 'roofing', label: 'Roofing' },
    { key: 'siding', label: 'Siding & Exterior' },
    { key: 'additions', label: 'Additions' },
    { key: 'basement', label: 'Basement' },
    { key: 'painting', label: 'Painting' },
    { key: 'flooring', label: 'Flooring' },
    { key: 'windows', label: 'Windows & Doors' },
    { key: 'deck', label: 'Deck & Exterior' },
    { key: 'other', label: 'Other / Not sure' },
  ];

  const SERVICE_ANSWERS = {
    kitchen: 'We do full kitchen remodels: custom cabinets, islands, countertops, flooring, lighting, and complete gut renovations.',
    bathroom: 'We renovate bathrooms top to bottom: tiling, vanities, fixtures, showers, tubs, and full layout changes.<br><br>💡 <b>Current special:</b> get a FREE electric toilet with every full bathroom remodel. Just ask about it when you book!',
    roofing: 'We handle roof repairs and full replacements with quality materials, plus insurance paperwork when it applies.',
    siding: 'We install and repair siding, trim, and exterior finishes to boost curb appeal and protection.',
    additions: 'We build seamless home additions and extensions, handled from framing to finish in house.',
    basement: 'We finish basements, waterproof, and build out extra living space.',
    painting: 'We do interior and exterior painting with crisp, clean lines and quality prep.',
    flooring: 'We install and refinish hardwood, tile, and vinyl flooring to spec.',
    windows: 'We install and replace windows and doors, including framing and finishing.',
    deck: 'We build and repair decks, patios, and outdoor living spaces.',
    other: 'If it is a home improvement project, we likely handle it. Tell me a bit more and I will confirm.',
  };

  // ============================================================
  // DOM
  // ============================================================
  const chatBtn = document.getElementById('chatBtn');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatBody = chatPanel.querySelector('.chat__body');

  // ============================================================
  // Message rendering
  // ============================================================
  function addMsg(text, who) {
    const p = document.createElement('p');
    p.className = 'chat__msg chat__msg--' + who;
    p.innerHTML = text; // answers may contain links
    chatBody.appendChild(p);
    chatBody.scrollTop = chatBody.scrollHeight;
    return p;
  }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'chat__typing';
    d.id = 'typing';
    d.innerHTML = '<i></i><i></i><i></i>';
    chatBody.appendChild(d);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('typing');
    if (t) t.remove();
  }

  function clearQuick() {
    chatBody.querySelectorAll('.chat__quick').forEach((q) => q.remove());
  }

  function showQuick(options) {
    clearQuick();
    if (!options || !options.length) return;
    const div = document.createElement('div');
    div.className = 'chat__quick';
    options.forEach((opt) => {
      const label = typeof opt === 'string' ? opt : opt.label;
      const value = typeof opt === 'string' ? opt : (opt.value || opt.label);
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      if (value === 'live') b.className = 'chat__quick--live';
      b.addEventListener('click', () => handleQuick(label, value));
      div.appendChild(b);
    });
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function reply(text, quick) {
    hideTyping();
    addMsg(text, 'bot');
    if (quick) showQuick(quick);
  }

  function think(text, quick) {
    showTyping();
    setTimeout(() => reply(text, quick), 650 + Math.random() * 350);
  }

  // ============================================================
  // Lead capture — inline form (button-driven, no free typing)
  // ============================================================
  function startLeadCapture() {
    clearQuick();
    reply('Quick form below. We just need a few details and we will call you right back.', null);
    const div = document.createElement('div');
    div.className = 'chat__leadform';
    div.innerHTML =
      '<input type="text" class="lead-name" placeholder="Your name" />' +
      '<input type="tel" class="lead-phone" placeholder="Phone number" />' +
      '<select class="lead-service">' + SERVICES.map((s) => '<option>' + s.label + '</option>').join('') + '</select>' +
      '<select class="lead-time"><option>Best time to call</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Anytime</option></select>' +
      '<button type="button" class="lead-submit btn btn--solid">Request call back</button>' +
      '<p class="lead-err"></p>';
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;

    div.querySelector('.lead-submit').addEventListener('click', () => {
      const name = div.querySelector('.lead-name').value.trim();
      const phone = div.querySelector('.lead-phone').value.replace(/\D/g, '');
      const service = div.querySelector('.lead-service').value;
      const time = div.querySelector('.lead-time').value;
      const err = div.querySelector('.lead-err');
      if (phone.length < 10) {
        err.textContent = 'Please enter a valid 10-digit phone number.';
        return;
      }
      err.textContent = '';
      div.remove();
      finishLead({ name, phone, service, time });
    });
  }

  function finishLead(l) {
    saveLead({ ts: Date.now(), ...l });
    const name = l.name ? ' ' + l.name.split(' ')[0] : '';
    const open = businessStatus().open;
    const when = open
      ? 'We received your request and someone from the team will get back to you <b>shortly</b> (usually within the hour during business hours).'
      : 'We received your request. We are currently closed, so someone will reach out <b>first thing the next business day</b>.';
    reply(
      'You are all set' + name + '! ✅<br><br>' + when +
      (l.time && l.time !== 'Best time to call' ? '<br>Preferred call time: ' + l.time.toLowerCase() + '.' : '') +
      '<br><br>Need us sooner? Call or text <a href="' + BIZ.phoneHref + '">' + BIZ.phone + '</a>.',
      [
        { label: 'Ask another question', value: 'menu' },
        { label: 'Talk to a human', value: 'human' },
      ]
    );
  }

  function saveLead(l) {
    try {
      const all = JSON.parse(localStorage.getItem('archats_leads') || '[]');
      all.push(l);
      localStorage.setItem('archats_leads', JSON.stringify(all));
    } catch (e) { /* ignore */ }
    if (LEAD_ENDPOINT) {
      try {
        fetch(LEAD_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(l),
        });
      } catch (e) { /* ignore */ }
    }
  }

  // ============================================================
  // Intent handling
  // ============================================================
  const norm = (s) => s.toLowerCase().replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim();

  function has(t, words) {
    return words.some((w) => t.includes(w));
  }

  // ---------- Business hours (America/New_York) ----------
  function businessStatus() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', hour12: false,
      }).formatToParts(new Date());
      const wd = (parts.find((p) => p.type === 'weekday') || {}).value;
      const hr = parseInt((parts.find((p) => p.type === 'hour') || {}).value, 10);
      return { open: wd !== 'Sun' && hr >= 7 && hr < 18 };
    } catch (e) {
      return { open: true };
    }
  }

  function handleQuick(label, value) {
    addMsg(label, 'user');
    route(norm(value));
  }

  const MENU_QUICK = [
    { label: 'Get a free estimate', value: 'estimate' },
    { label: 'What services do you offer?', value: 'services' },
    { label: 'Do you serve my area?', value: 'areas' },
    { label: 'Hours & contact', value: 'hours' },
    { label: 'Speak to a live person', value: 'live' },
  ];

  // Lead endpoint — free FormSubmit relay. Change LEAD_EMAIL to deliver elsewhere.
  const LEAD_EMAIL = 'archatsllc@gmail.com';
  const LIVE_ENDPOINT = 'https://formsubmit.co/ajax/' + LEAD_EMAIL;
  const BIZ_PHONE = '917-780-9790'; // included in every lead so we’re always ready to call back

  // ============================================================
  // "Speak to a live person" — the special direct-line box.
  // Feels personal, but routes to the same lead flow as the quote form.
  // ============================================================
  function startLiveChat() {
    clearQuick();
    reply('Putting you through to the family — a real person answers every message.', null);
    const div = document.createElement('div');
    div.className = 'chat__live';
    div.innerHTML =
      '<div class="chat__live-head">' +
        '<span class="chat__live-avatar">A</span>' +
        '<div><strong>The Archats family</strong><span>Direct line — no call centers</span></div>' +
      '</div>' +
      '<div class="chat__live-form">' +
        '<input type="text" class="live-name" placeholder="Your name" />' +
        '<input type="tel" class="live-phone" placeholder="Phone number" />' +
        '<textarea class="live-msg" rows="2" placeholder="What are you working on?"></textarea>' +
        '<button type="button" class="live-submit btn btn--solid">Send my message</button>' +
        '<p class="lead-err"></p>' +
      '</div>' +
      '<p class="chat__live-note">This goes straight to the family — no bots, no call centers. You will get a text or call back shortly.</p>';
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;

    div.querySelector('.live-submit').addEventListener('click', () => {
      const name = div.querySelector('.live-name').value.trim();
      const phone = div.querySelector('.live-phone').value.trim();
      const msg = div.querySelector('.live-msg').value.trim();
      const err = div.querySelector('.lead-err');
      if (!name || !phone) {
        err.textContent = 'Please add your name and phone number so we can reach you.';
        return;
      }
      err.textContent = '';
      div.querySelector('.live-submit').disabled = true;
      fetch(LIVE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'Direct message — ' + name,
          name: name, phone: phone, message: msg || 'No message',
          callback: BIZ_PHONE,
          _template: 'table',
        }),
      })
        .then((r) => r.json())
        .then(() => {
          div.innerHTML = '<div class="chat__live-head"><span class="chat__live-avatar">A</span><div><strong>Got it!</strong><span>Sent to the family</span></div></div><p style="font-size:13px;color:var(--navy);margin:6px 0 0;">Thank you — someone from the family will get back to you shortly. Your message is in good hands.</p>';
          chatBody.scrollTop = chatBody.scrollHeight;
        })
        .catch(() => {
          err.textContent = 'Could not send. Please call (917) 780-9790 and ask for a callback.';
          div.querySelector('.live-submit').disabled = false;
        });
    });
  }

  function route(t) {
    // --- greeting ---
    if (has(t, ['hi', 'hello', 'hey', 'hiya', 'good morning', 'good afternoon', 'good evening']) && t.length < 22) {
      return think('Hi — I’m the Archats assistant. I can help with services, pricing, service areas, or get you a free estimate. What would you like to know?', MENU_QUICK);
    }

    // --- menu / back ---
    if (has(t, ['menu', 'ask another', 'ask something else', 'what else', 'other options'])) {
      return think('Sure, what would you like to do?', MENU_QUICK);
    }

    // --- special / promo ---
    if (has(t, ['special', 'promo', 'promotion', 'deal', 'discount', 'sale', 'coupon', 'free toilet', 'electric toilet', 'bidet', 'toilet'])) {
      return think('Yes — right now we’re running a <b>special</b>: a <b>FREE electric toilet</b> with every full bathroom remodel. It isn’t advertised everywhere, so be sure to mention it when you schedule your estimate. Want to book a free estimate?', [
        { label: 'Book bathroom estimate', value: 'estimate' },
        { label: 'What other services?', value: 'services' },
      ]);
    }

    // --- estimate / booking trigger ---
    if (has(t, ['estimate', 'quote', 'book', 'schedule', 'appointment', 'pricing', 'price', 'cost', 'how much', 'get started', 'start a project', 'interested', 'hire', 'free consult', 'free consultation'])) {
      startLeadCapture();
      return;
    }

    // --- live person (special direct line) ---
    if (has(t, ['live', 'live person', 'speak to a live', 'talk to a live', 'real human', 'human being'])) {
      startLiveChat();
      return;
    }

    // --- human / handoff ---
    if (has(t, ['human', 'person', 'talk to someone', 'talk to', 'speak to', 'call me', 'representative', 'real person'])) {
      return think('Absolutely, you can reach the team directly at <a href="' + BIZ.phoneHref + '">' + BIZ.phone + '</a> (Mon to Sat, 7am to 6pm), or <a href="mailto:' + BIZ.email + '">' + BIZ.email + '</a>. Want to leave your number here instead and we will call you back?', [
        { label: 'Yes, call me back', value: 'estimate' },
        { label: 'No thanks', value: 'menu' },
      ]);
    }

    // --- services overview ---
    if (has(t, ['what do you do', 'what services', 'services', 'what kind of work'])) {
      const list = SERVICES.map((s) => s.label).join(', ');
      return think('We are a full service general contractor. We handle:<br><br><b>' + list + '</b><br><br>Residential and light commercial, all done in house. Want a free estimate on something?', [
        { label: 'Get a free estimate', value: 'estimate' },
      ]);
    }

    // --- specific service ---
    for (const s of SERVICES) {
      const synonyms = {
        kitchen: ['kitchen', 'cabinets', 'countertop', 'island'],
        bathroom: ['bathroom', 'bath', 'shower', 'tub', 'vanity', 'tile'],
        roofing: ['roof', 'roofing', 'shingle', 'leak'],
        siding: ['siding', 'exterior wall', 'cladding'],
        additions: ['addition', 'extension', 'add a room', 'build out'],
        basement: ['basement', 'cellar', 'waterproof'],
        painting: ['paint', 'painting', 'repaint'],
        flooring: ['floor', 'flooring', 'hardwood', 'vinyl', 'laminate'],
        windows: ['window', 'door', 'windows', 'doors'],
        deck: ['deck', 'patio', 'porch', 'outdoor'],
      }[s.key] || [s.key.toLowerCase()];
      if (t.length <= 45 && has(t, synonyms)) {
        return think(SERVICE_ANSWERS[s.key] + '<br><br>Would you like a free estimate for your ' + s.key + ' project?', [
          { label: 'Yes, free estimate', value: 'estimate' },
          { label: 'Not right now', value: 'menu' },
        ]);
      }
    }

    // --- outside service area ---
    if (has(t, ['outside', 'out of area'])) {
      return think('If you are outside our usual service area, still <a href="' + BIZ.phoneHref + '">give us a call</a>. We can often make it work or point you to someone we trust.', MENU_QUICK);
    }

    // --- areas ---
    if (has(t, ['area', 'serve', 'location', 'queens', 'long island', 'brooklyn', 'jersey', 'new york', 'nyc', 'nassau', 'suffolk'])) {
      return think('We serve <b>' + BIZ.areas.join(', ') + '</b> (Hudson & Bergen counties in NJ). Where is your project located?', [
        { label: 'Get a free estimate', value: 'estimate' },
        { label: 'It is outside those areas', value: 'outside' },
      ]);
    }

    // --- hours ---
    if (has(t, ['hours', 'open', 'when are you', 'what time', 'close'])) {
      return think('We are open <b>' + BIZ.hours + '</b>. Outside those hours, leave your info and we will follow up the next business day.', [
        { label: 'Get a free estimate', value: 'estimate' },
      ]);
    }

    // --- contact ---
    if (has(t, ['phone', 'number', 'email', 'contact', 'address', 'reach'])) {
      return think('You can reach us at <a href="' + BIZ.phoneHref + '">' + BIZ.phone + '</a> or <a href="mailto:' + BIZ.email + '">' + BIZ.email + '</a>. Hours: ' + BIZ.hours + '.', [
        { label: 'Get a free estimate', value: 'estimate' },
      ]);
    }

    // --- licensing / insurance ---
    if (has(t, ['license', 'licensed', 'insur', 'permit', 'bond'])) {
      return think('Yes, we are fully <b>licensed and insured</b>, and we pull all required permits and handle the paperwork for you.', [
        { label: 'Get a free estimate', value: 'estimate' },
      ]);
    }

    // --- timeline ---
    if (has(t, ['how long', 'timeline', 'duration', 'finish', 'weeks', 'days'])) {
      return think('It depends on scope. Small jobs can be a few days; a full kitchen or addition is usually a few weeks. We give you a clear, realistic timeline before we start and keep you updated throughout.', [
        { label: 'Get a free estimate', value: 'estimate' },
      ]);
    }

    // --- payment / financing ---
    if (has(t, ['pay', 'payment', 'financ', 'deposit', 'money', 'afford', 'budget'])) {
      return think('We keep pricing transparent and itemized. No surprise charges. We typically take a deposit to book and the rest on milestones. Financing depends on the project; ask us and we will walk you through options.', [
        { label: 'Get a free estimate', value: 'estimate' },
      ]);
    }

    // --- warranty ---
    if (has(t, ['warranty', 'guarantee', 'back our work', 'stand behind'])) {
      return think('We stand behind our work with a workmanship warranty, plus manufacturer warranties on all materials.', [
        { label: 'Get a free estimate', value: 'estimate' },
      ]);
    }

    // --- emergency ---
    if (has(t, ['emergency', 'urgent', 'flood', 'leak', 'damage', 'asap', 'right now'])) {
      return think('If this is an emergency like a leak or water damage, <b>call us right now</b> at <a href="' + BIZ.phoneHref + '">' + BIZ.phone + '</a> and we will get someone out as soon as possible.', [
        { label: 'Get a free estimate', value: 'estimate' },
      ]);
    }

    // --- commercial ---
    if (has(t, ['commercial', 'business', 'store', 'office', 'restaurant', 'tenant'])) {
      return think('We handle residential and light commercial projects. Tell me a bit about the space and I can point you in the right direction. Or call us at <a href="' + BIZ.phoneHref + '">' + BIZ.phone + '</a>.', [
        { label: 'Get a free estimate', value: 'estimate' },
      ]);
    }

    // --- thanks / bye ---
    if (has(t, ['thanks', 'thank you', 'thx', 'appreciate'])) {
      return think('Anytime! If a project comes up, I am here 24/7.', MENU_QUICK);
    }
    if (has(t, ['bye', 'goodbye', 'see you', 'later'])) {
      return think('Thanks for stopping by. We are here whenever you need us. Take care!', null);
    }

    // --- fallback: didn’t understand → steer to a known topic or a human ---
    return think("I didn’t quite catch that, and I don’t want you to miss out. I can answer questions about our services, pricing, hours, and areas, or take your name and number so a real person can call you back. Which would you like?", [
      { label: 'Get a free estimate', value: 'estimate' },
      { label: 'What services do you offer?', value: 'What services do you offer?' },
      { label: 'Hours & areas', value: 'hours' },
      { label: 'Talk to a person', value: 'human' },
    ]);
  }

  // ============================================================
  // Wire up
  // ============================================================
  function openChat(open) {
    chatPanel.classList.toggle('open', open);
    chatPanel.setAttribute('aria-hidden', String(!open));
    if (open && !chatPanel.dataset.greeted) {
      chatPanel.dataset.greeted = '1';
      setTimeout(() => think('Welcome — I’m the Archats assistant. Pick an option below and we’ll take it from there.', MENU_QUICK), 500);
    }
  }
  chatBtn.addEventListener('click', () => openChat(!chatPanel.classList.contains('open')));
  chatClose.addEventListener('click', () => openChat(false));
})();
