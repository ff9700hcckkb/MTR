// quiz.js — loads at end of <body>, DOM is ready
// ── LESSON TABS ───────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.dataset.target;
      document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
      document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
      tab.classList.add('active');
      var el = document.getElementById(target);
      if (el) {
        el.classList.add('active');
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 55, behavior: 'smooth' });
      }
    });
  });
}

// ── APPENDIX TABS ─────────────────────────────────────────────
document.querySelectorAll('.app-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    var t = tab.dataset.app;
    document.querySelectorAll('.app-tab').forEach(function(x){ x.classList.remove('active'); });
    document.querySelectorAll('.app-panel').forEach(function(x){ x.classList.remove('active'); });
    tab.classList.add('active');
    var panel = document.getElementById('app-' + t);
    if (panel) panel.classList.add('active');
  });
});
(function() {
  var hash = location.hash.replace('#', '');
  var map = { vocab: 'a', conj: 'b', check: 'c' };
  if (map[hash]) {
    var tab = document.querySelector('[data-app="' + map[hash] + '"]');
    if (tab) tab.click();
  }
})();

// ── MCQ QUIZ ──────────────────────────────────────────────────
function initQuiz(cid, answers) {
  var c = document.getElementById(cid);
  if (!c) { console.warn('initQuiz: #' + cid + ' not found'); return; }
  // Clone buttons to remove old listeners before re-init
  c.querySelectorAll('.obtn').forEach(function(btn) {
    var clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });
  var score = 0, done = 0, total = answers.length;
  c.querySelectorAll('.qcard').forEach(function(card, qi) {
    var opts = card.querySelectorAll('.obtn');
    var fb   = card.querySelector('.fb');
    opts.forEach(function(btn, i) {
      btn.addEventListener('click', function() {
        if (btn.disabled) return;
        opts.forEach(function(b){ b.disabled = true; });
        var cor = answers[qi];
        if (i === cor) {
          btn.classList.add('ok');
          if (fb) { fb.textContent = '✓ 正確！'; fb.className = 'fb show ok'; }
          score++;
        } else {
          btn.classList.add('ng');
          opts[cor].classList.add('ok');
          var otxt = opts[cor].querySelector('.otext');
          if (fb) { fb.textContent = '✗ 正確答案：' + (otxt ? otxt.textContent : ''); fb.className = 'fb show ng'; }
        }
        done++;
        var pf = c.querySelector('.pfill'), pl = c.querySelector('.plabel');
        if (pf) pf.style.width = (done / total * 100) + '%';
        if (pl) pl.textContent = done + '/' + total;
        if (done === total) {
          var sb = c.querySelector('.scorebar');
          if (sb) { sb.querySelector('.sn').textContent = score + '/' + total; sb.classList.add('show'); }
        }
      });
    });
  });
}


function resetFill(cid) {
  var c = document.getElementById(cid); if (!c) return;
  c.querySelectorAll('.chip').forEach(function(ch) {
    ch.disabled = false;
    ch.classList.remove('ck','cn');
  });
  c.querySelectorAll('.fanswer').forEach(function(fa) {
    fa.className = 'fanswer';
    fa.textContent = '';
  });
}

function resetQuiz(cid) {
  var c = document.getElementById(cid); if (!c) return;
  c.querySelectorAll('.obtn').forEach(function(b){ b.disabled = false; b.classList.remove('ok','ng'); });
  c.querySelectorAll('.fb').forEach(function(f){ f.className = 'fb'; });
  var sb = c.querySelector('.scorebar'); if (sb) sb.classList.remove('show');
  var pf = c.querySelector('.pfill');   if (pf) pf.style.width = '0%';
  var pl = c.querySelector('.plabel');  if (pl) pl.textContent = '0/' + c.querySelectorAll('.qcard').length;
}

// ── FILL IN BLANK ─────────────────────────────────────────────
function initFill(cid, answers) {
  var c = document.getElementById(cid); if (!c) { console.warn('initFill: #' + cid + ' not found'); return; }
  // Clone chips to remove old listeners
  c.querySelectorAll('.chip').forEach(function(chip) {
    var clone = chip.cloneNode(true);
    chip.parentNode.replaceChild(clone, chip);
  });
  c.querySelectorAll('.fq').forEach(function(q, qi) {
    var chips = q.querySelectorAll('.chip');
    var fa    = q.querySelector('.fanswer');
    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        if (chip.disabled) return;
        chips.forEach(function(ch){ ch.disabled = true; });
        var v = chip.dataset.value;
        if (v === answers[qi]) {
          chip.classList.add('ck');
          if (fa) { fa.textContent = '✓ 答對了！'; fa.className = 'fanswer show'; }
        } else {
          chip.classList.add('cn');
          chips.forEach(function(ch){ if (ch.dataset.value === answers[qi]) ch.classList.add('ck'); });
          if (fa) { fa.textContent = '正確答案：' + answers[qi]; fa.className = 'fanswer show'; }
        }
      });
    });
  });
}

// ── SPEAK ─────────────────────────────────────────────────────
function speak(word) {
  if (!window.speechSynthesis || !word) return;
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(word);
  u.lang = 'th-TH'; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}


// ── TOOLTIP & SPEAK HANDLERS ─────────────────────────────────
// Single global click listener handles:
// 1. .conj / .vword  → toggle tip-on (mobile tooltip)
// 2. .vthai / .cc-thai / .thai-cell → speak the Thai word
document.addEventListener('click', function(e) {
  // Tooltip toggle for .conj and .vword
  var tip = e.target.closest('.conj, .vword');
  if (tip) {
    var isOn = tip.classList.contains('tip-on');
    // Close all open tips
    document.querySelectorAll('.tip-on').forEach(function(x) {
      x.classList.remove('tip-on');
    });
    if (!isOn) {
      tip.classList.add('tip-on');
      // Auto-close after 2.5s
      setTimeout(function() { tip.classList.remove('tip-on'); }, 2500);
    }
    // Also speak the word (from title attribute)
    var word = tip.getAttribute('title');
    if (word && word !== '點擊看意思') {
      // title is the Chinese meaning for conj/vword, not the Thai word
      // Thai word is the text content (strip child elements)
      var thai = tip.childNodes[0] && tip.childNodes[0].nodeType === 3
        ? tip.childNodes[0].textContent.trim()
        : tip.textContent.trim();
      if (thai) speak(thai);
    }
    e.stopPropagation();
    return;
  }

  // Click-to-speak for vocab words
  var vocab = e.target.closest('.vthai, .cc-thai, .thai-cell');
  if (vocab) {
    // Get text content, strip any child elements text except the Thai word
    var word = (vocab.childNodes[0] && vocab.childNodes[0].nodeType === 3)
      ? vocab.childNodes[0].textContent.trim()
      : vocab.textContent.trim();
    if (word) speak(word);
    return;
  }

  // Click elsewhere: close all tips
  document.querySelectorAll('.tip-on').forEach(function(x) {
    x.classList.remove('tip-on');
  });
});

// ── CHECKLIST ─────────────────────────────────────────────────
function updateTotal() {
  var all  = document.querySelectorAll('.cl-item input');
  var done = Array.from(all).filter(function(cb){ return cb.checked; }).length;
  var el   = document.getElementById('total-count');
  if (el) el.textContent = done + ' / ' + all.length;
}
document.querySelectorAll('.cl-item input').forEach(function(cb) {
  cb.addEventListener('change', function() {
    cb.closest('.cl-item').classList.toggle('done', cb.checked);
    updateTotal();
  });
});

// ── ARTICLE READER ────────────────────────────────────────────
var rd = { speed: 0.85, lid: null, u: null, paraIdx: {}, loop: {}, playing: false };

function rdGetParas(lid) {
  var bar = document.getElementById('reader-' + lid); if (!bar) return [];
  var abody = bar.closest('.acard').querySelector('.abody'); if (!abody) return [];
  return Array.from(abody.querySelectorAll('p[data-para]'));
}
function rdStatus(lid, msg) {
  ['rd-status-', 'rd-para-status-'].forEach(function(p) {
    var el = document.getElementById(p + lid); if (el) el.textContent = msg;
  });
}
function rdFullBtns(lid, playing) {
  var ctrl = document.getElementById('rd-full-' + lid); if (!ctrl) return;
  ctrl.querySelector('.rd-play').disabled  =  playing;
  ctrl.querySelector('.rd-pause').disabled = !playing;
  ctrl.querySelector('.rd-stop').disabled  = !playing;
}
function rdHighlight(lid, idx) {
  rdGetParas(lid).forEach(function(p, i){ p.classList.toggle('para-active', i === idx); });
}
function rdSwitchMode(lid, mode) {
  window.speechSynthesis && window.speechSynthesis.cancel();
  rd.playing = false;
  rdGetParas(lid).forEach(function(p){ p.classList.remove('para-active'); });
  var full = document.getElementById('rd-full-' + lid);
  var para = document.getElementById('rd-para-' + lid);
  var bF   = document.getElementById('rd-mode-full-' + lid);
  var bP   = document.getElementById('rd-mode-para-' + lid);
  if (mode === 'full') {
    if (full) full.style.display = ''; if (para) para.style.display = 'none';
    if (bF) bF.classList.add('active'); if (bP) bP.classList.remove('active');
    rdFullBtns(lid, false); rdStatus(lid, '就緒');
  } else {
    if (full) full.style.display = 'none'; if (para) para.style.display = '';
    if (bP) bP.classList.add('active'); if (bF) bF.classList.remove('active');
    if (!rd.paraIdx[lid]) rd.paraIdx[lid] = 0;
    rdUpdatePara(lid);
  }
}
function rdUpdatePara(lid) {
  var paras = rdGetParas(lid), idx = rd.paraIdx[lid] || 0;
  var el = document.getElementById('rd-para-status-' + lid);
  if (el) el.textContent = '第 ' + (idx + 1) + ' / ' + paras.length + ' 段';
  rdHighlight(lid, idx);
}
function rdPlay(lid) {
  if (!window.speechSynthesis) { rdStatus(lid, '不支援'); return; }
  window.speechSynthesis.cancel(); rd.lid = lid;
  var bar   = document.getElementById('reader-' + lid);
  var abody = bar ? bar.closest('.acard').querySelector('.abody') : null;
  var text  = abody ? (abody.innerText || abody.textContent || '').trim() : '';
  if (!text) { rdStatus(lid, '無文字'); return; }
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH'; u.rate = rd.speed; rd.u = u;
  u.onstart  = function(){ rdStatus(lid, '▶ 朗讀中'); rdFullBtns(lid, true); };
  u.onpause  = function(){ rdStatus(lid, '⏸ 已暫停'); };
  u.onresume = function(){ rdStatus(lid, '▶ 朗讀中'); };
  u.onend    = function(){ rdStatus(lid, '✓ 完成'); rdFullBtns(lid, false); rd.lid = null; };
  u.onerror  = function(e){ if (e.error !== 'interrupted'){ rdStatus(lid, '⚠ 錯誤'); rdFullBtns(lid, false); } };
  window.speechSynthesis.speak(u);
}
function rdPause(lid) {
  var ss = window.speechSynthesis; if (!ss) return;
  if (ss.speaking && !ss.paused) { ss.pause(); if (rd.lid) rdStatus(rd.lid, '⏸ 已暫停'); }
  else if (ss.paused)            { ss.resume(); if (rd.lid) rdStatus(rd.lid, '▶ 朗讀中'); }
}
function rdStop() {
  window.speechSynthesis && window.speechSynthesis.cancel();
  rd.playing = false;
  if (rd.lid) {
    rdStatus(rd.lid, '就緒'); rdFullBtns(rd.lid, false);
    rdGetParas(rd.lid).forEach(function(p){ p.classList.remove('para-active'); });
    rd.lid = null;
  }
}
function rdSetSpeed(val, lid) {
  rd.speed = parseFloat(val);
  var d = parseFloat(val).toFixed(1) + '×';
  ['rd-speed-val-', 'rd-speed-val2-'].forEach(function(p){
    var el = document.getElementById(p + lid); if (el) el.textContent = d;
  });
  if (rd.lid === lid && window.speechSynthesis.speaking) rdPlay(lid);
}
function rdParaPlay(lid) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); rd.lid = lid; rd.playing = true;
  var idx   = rd.paraIdx[lid] || 0;
  var paras = rdGetParas(lid);
  if (!paras.length) return;
  if (idx >= paras.length) { idx = 0; rd.paraIdx[lid] = 0; }
  rdHighlight(lid, idx);
  var text = (paras[idx].innerText || paras[idx].textContent || '').trim();
  var el   = document.getElementById('rd-para-status-' + lid);
  if (el) el.textContent = '▶ 第 ' + (idx + 1) + ' / ' + paras.length + ' 段';
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH'; u.rate = rd.speed;
  u.onend = function() {
    if (!rd.playing) return;
    if (rd.loop[lid]) {
      setTimeout(function(){ if (rd.playing) rdParaPlay(lid); }, 600);
    } else {
      var next = (rd.paraIdx[lid] || 0) + 1;
      if (next < rdGetParas(lid).length) {
        rd.paraIdx[lid] = next;
        setTimeout(function(){ if (rd.playing) rdParaPlay(lid); }, 700);
      } else {
        rd.playing = false;
        rdGetParas(lid).forEach(function(p){ p.classList.remove('para-active'); });
        var s = document.getElementById('rd-para-status-' + lid);
        if (s) s.textContent = '✓ 完成';
        rd.lid = null;
      }
    }
  };
  u.onerror = function(e){ if (e.error !== 'interrupted') rd.playing = false; };
  window.speechSynthesis.speak(u);
}
function rdParaPrev(lid) {
  window.speechSynthesis && window.speechSynthesis.cancel(); rd.playing = false;
  rd.paraIdx[lid] = Math.max(0, (rd.paraIdx[lid] || 0) - 1); rdUpdatePara(lid);
}
function rdParaNext(lid) {
  window.speechSynthesis && window.speechSynthesis.cancel(); rd.playing = false;
  rd.paraIdx[lid] = Math.min(rdGetParas(lid).length - 1, (rd.paraIdx[lid] || 0) + 1); rdUpdatePara(lid);
}
function rdToggleLoop(lid) {
  rd.loop[lid] = !rd.loop[lid];
  var btn = document.getElementById('rd-loop-' + lid);
  if (btn) btn.classList.toggle('loop-on', rd.loop[lid]);
}
