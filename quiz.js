function initTabs(){
  document.querySelectorAll('.tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const t=tab.dataset.target;
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
      tab.classList.add('active');
      const el=document.getElementById(t);
      el.classList.add('active');
      window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-55,behavior:'smooth'});
    });
  });
}

function initQuiz(cid,answers){
  const c=document.getElementById(cid);
  if(!c)return;
  let score=0,done=0;const total=answers.length;
  c.querySelectorAll('.qcard').forEach((card,qi)=>{
    const opts=card.querySelectorAll('.obtn');
    const fb=card.querySelector('.fb');
    opts.forEach((btn,i)=>{
      btn.addEventListener('click',()=>{
        if(btn.disabled)return;
        opts.forEach(b=>b.disabled=true);
        const cor=answers[qi];
        if(i===cor){
          btn.classList.add('ok');
          if(fb){fb.textContent='✓ 正確！';fb.className='fb show ok';}
          score++;
        }else{
          btn.classList.add('ng');
          opts[cor].classList.add('ok');
          if(fb){fb.textContent='✗ 正確答案：'+opts[cor].querySelector('.otext').textContent;fb.className='fb show ng';}
        }
        done++;
        const pf=c.querySelector('.pfill');const pl=c.querySelector('.plabel');
        if(pf)pf.style.width=(done/total*100)+'%';
        if(pl)pl.textContent=done+'/'+total;
        if(done===total){
          const sb=c.querySelector('.scorebar');
          if(sb){sb.querySelector('.sn').textContent=score+'/'+total;sb.classList.add('show');}
        }
      });
    });
  });
}

function resetQuiz(cid){
  const c=document.getElementById(cid);if(!c)return;
  c.querySelectorAll('.obtn').forEach(b=>{b.disabled=false;b.classList.remove('ok','ng');});
  c.querySelectorAll('.fb').forEach(f=>f.className='fb');
  const sb=c.querySelector('.scorebar');if(sb)sb.classList.remove('show');
  const pf=c.querySelector('.pfill');if(pf)pf.style.width='0%';
  const pl=c.querySelector('.plabel');if(pl)pl.textContent='0/'+c.querySelectorAll('.qcard').length;
}

function initFill(cid,answers){
  const c=document.getElementById(cid);if(!c)return;
  c.querySelectorAll('.fq').forEach((q,qi)=>{
    const chips=q.querySelectorAll('.chip');
    const fa=q.querySelector('.fanswer');
    chips.forEach(chip=>{
      chip.addEventListener('click',()=>{
        if(chip.disabled)return;
        chips.forEach(ch=>ch.disabled=true);
        const v=chip.dataset.value;
        if(v===answers[qi]){
          chip.classList.add('ck');
          if(fa){fa.textContent='✓ 答對了！';fa.className='fanswer show';}
        }else{
          chip.classList.add('cn');
          chips.forEach(ch=>{if(ch.dataset.value===answers[qi])ch.classList.add('ck');});
          if(fa){fa.textContent='正確答案：'+answers[qi];fa.className='fanswer show';}
        }
      });
    });
  });
}


// Speak function (Web Speech API, Thai TH)
function speak(word) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(word);
  u.lang = 'th-TH';
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}
// Mobile tooltip for .conj spans
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.conj').forEach(function(el) {
    el.addEventListener('click', function(e) {
      // toggle this one
      var isOn = el.classList.contains('tip-on');
      // close all others
      document.querySelectorAll('.conj.tip-on').forEach(function(x){ x.classList.remove('tip-on'); });
      if (!isOn) {
        el.classList.add('tip-on');
        // auto-close after 2.5s
        setTimeout(function(){ el.classList.remove('tip-on'); }, 2500);
      }
      e.stopPropagation();
    });
  });
  // vword tooltip (same logic as conj)
  document.querySelectorAll('.vword').forEach(function(el) {
    el.addEventListener('click', function(e) {
      var isOn = el.classList.contains('tip-on');
      document.querySelectorAll('.vword.tip-on,.conj.tip-on').forEach(function(x){ x.classList.remove('tip-on'); });
      if (!isOn) {
        el.classList.add('tip-on');
        setTimeout(function(){ el.classList.remove('tip-on'); }, 2500);
      }
      e.stopPropagation();
    });
  });
  // tap elsewhere to close all tips
  document.addEventListener('click', function() {
    document.querySelectorAll('.conj.tip-on,.vword.tip-on').forEach(function(x){ x.classList.remove('tip-on'); });
  });
});

// ── ARTICLE READER ──────────────────────────────────────────
var rdState = {
  speed: 0.85,
  currentId: null,
  utterance: null,
  // para mode
  paraIdx: {},   // lessonId -> current paragraph index
  loopOn: {},    // lessonId -> bool
  paraPlaying: false
};

// ── helpers ──
function rdGetParas(lid) {
  var bar = document.getElementById('reader-' + lid);
  if (!bar) return [];
  var abody = bar.closest('.acard').querySelector('.abody');
  if (!abody) return [];
  return Array.from(abody.querySelectorAll('p[data-para]'));
}

function rdParaText(el) {
  return el ? (el.innerText || el.textContent || '').trim() : '';
}

function rdSetStatus(id, msg) {
  ['rd-status-','rd-para-status-'].forEach(function(prefix) {
    var el = document.getElementById(prefix + id);
    if (el) el.textContent = msg;
  });
}

function rdSetFullBtns(lid, playing) {
  var ctrl = document.getElementById('rd-full-' + lid);
  if (!ctrl) return;
  ctrl.querySelector('.rd-play').disabled  =  playing;
  ctrl.querySelector('.rd-pause').disabled = !playing;
  ctrl.querySelector('.rd-stop').disabled  = !playing;
}

function rdHighlight(lid, idx) {
  rdGetParas(lid).forEach(function(p, i) {
    p.classList.toggle('para-active', i === idx);
  });
}

function rdClearHighlight(lid) {
  rdGetParas(lid).forEach(function(p) { p.classList.remove('para-active'); });
}

function rdUpdateParaStatus(lid) {
  var paras = rdGetParas(lid);
  var idx = rdState.paraIdx[lid] || 0;
  var el = document.getElementById('rd-para-status-' + lid);
  if (el) el.textContent = '第 ' + (idx+1) + ' / ' + paras.length + ' 段';
  rdHighlight(lid, idx);
}

// ── mode switch ──
function rdSwitchMode(lid, mode) {
  window.speechSynthesis && window.speechSynthesis.cancel();
  rdClearHighlight(lid);
  rdState.paraPlaying = false;

  var fullCtrl = document.getElementById('rd-full-' + lid);
  var paraCtrl = document.getElementById('rd-para-' + lid);
  var btnFull  = document.getElementById('rd-mode-full-' + lid);
  var btnPara  = document.getElementById('rd-mode-para-' + lid);

  if (mode === 'full') {
    if (fullCtrl) fullCtrl.style.display = '';
    if (paraCtrl) paraCtrl.style.display = 'none';
    if (btnFull)  btnFull.classList.add('active');
    if (btnPara)  btnPara.classList.remove('active');
    rdSetFullBtns(lid, false);
    rdSetStatus(lid, '就緒');
  } else {
    if (fullCtrl) fullCtrl.style.display = 'none';
    if (paraCtrl) paraCtrl.style.display = '';
    if (btnPara)  btnPara.classList.add('active');
    if (btnFull)  btnFull.classList.remove('active');
    if (!rdState.paraIdx[lid]) rdState.paraIdx[lid] = 0;
    rdUpdateParaStatus(lid);
  }
}

// ── FULL MODE ──
function rdPlay(lid) {
  if (!window.speechSynthesis) { rdSetStatus(lid,'不支援'); return; }
  window.speechSynthesis.cancel();
  rdState.currentId = lid;

  var bar = document.getElementById('reader-' + lid);
  var abody = bar ? bar.closest('.acard').querySelector('.abody') : null;
  var text = abody ? (abody.innerText || abody.textContent || '').trim() : '';
  if (!text) { rdSetStatus(lid,'無文字'); return; }

  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH';
  u.rate = rdState.speed;
  rdState.utterance = u;

  u.onstart  = function() { rdSetStatus(lid,'▶ 朗讀中'); rdSetFullBtns(lid,true); };
  u.onpause  = function() { rdSetStatus(lid,'⏸ 已暫停'); };
  u.onresume = function() { rdSetStatus(lid,'▶ 朗讀中'); };
  u.onend    = function() { rdSetStatus(lid,'✓ 完成'); rdSetFullBtns(lid,false); rdState.currentId=null; };
  u.onerror  = function(e) { if(e.error!=='interrupted'){ rdSetStatus(lid,'⚠ 錯誤'); rdSetFullBtns(lid,false); }};

  window.speechSynthesis.speak(u);
}

function rdPause(lid) {
  if (!window.speechSynthesis) return;
  var ss = window.speechSynthesis;
  if (ss.speaking && !ss.paused) {
    ss.pause();
    if (rdState.currentId) rdSetStatus(rdState.currentId,'⏸ 已暫停');
  } else if (ss.paused) {
    ss.resume();
    if (rdState.currentId) rdSetStatus(rdState.currentId,'▶ 朗讀中');
  }
}

function rdStop() {
  window.speechSynthesis && window.speechSynthesis.cancel();
  rdState.paraPlaying = false;
  if (rdState.currentId) {
    rdSetStatus(rdState.currentId,'就緒');
    rdSetFullBtns(rdState.currentId, false);
    rdClearHighlight(rdState.currentId);
    rdState.currentId = null;
  }
}

function rdSetSpeed(val, lid) {
  rdState.speed = parseFloat(val);
  var display = parseFloat(val).toFixed(1) + '×';
  ['rd-speed-val-','rd-speed-val2-'].forEach(function(p) {
    var el = document.getElementById(p + lid);
    if (el) el.textContent = display;
  });
  // restart if playing full mode
  if (rdState.currentId === lid && window.speechSynthesis.speaking) {
    rdPlay(lid);
  }
}

// ── PARA MODE ──
function rdParaPlay(lid) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  rdState.currentId = lid;
  rdState.paraPlaying = true;

  var idx   = rdState.paraIdx[lid] || 0;
  var paras = rdGetParas(lid);
  if (!paras.length) return;
  if (idx >= paras.length) { idx = 0; rdState.paraIdx[lid] = 0; }

  rdHighlight(lid, idx);
  var text = rdParaText(paras[idx]);
  if (!text) { rdParaNext(lid); return; }

  var el = document.getElementById('rd-para-status-' + lid);
  if (el) el.textContent = '▶ 第 '+(idx+1)+' / '+paras.length+' 段';

  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH';
  u.rate = rdState.speed;

  u.onend = function() {
    if (!rdState.paraPlaying) return;
    if (rdState.loopOn[lid]) {
      // loop same paragraph
      setTimeout(function(){ if(rdState.paraPlaying) rdParaPlay(lid); }, 600);
    } else {
      // auto-advance
      var next = (rdState.paraIdx[lid] || 0) + 1;
      if (next < rdGetParas(lid).length) {
        rdState.paraIdx[lid] = next;
        setTimeout(function(){ if(rdState.paraPlaying) rdParaPlay(lid); }, 700);
      } else {
        // finished all
        rdState.paraPlaying = false;
        rdClearHighlight(lid);
        var s = document.getElementById('rd-para-status-' + lid);
        if (s) s.textContent = '✓ 完成';
        rdState.currentId = null;
      }
    }
  };
  u.onerror = function(e) {
    if (e.error !== 'interrupted') {
      rdState.paraPlaying = false;
      var s = document.getElementById('rd-para-status-' + lid);
      if (s) s.textContent = '⚠ 錯誤';
    }
  };

  window.speechSynthesis.speak(u);
}

function rdParaPrev(lid) {
  window.speechSynthesis && window.speechSynthesis.cancel();
  rdState.paraPlaying = false;
  var idx = (rdState.paraIdx[lid] || 0) - 1;
  rdState.paraIdx[lid] = Math.max(0, idx);
  rdUpdateParaStatus(lid);
}

function rdParaNext(lid) {
  window.speechSynthesis && window.speechSynthesis.cancel();
  rdState.paraPlaying = false;
  var paras = rdGetParas(lid);
  var idx = (rdState.paraIdx[lid] || 0) + 1;
  rdState.paraIdx[lid] = Math.min(paras.length - 1, idx);
  rdUpdateParaStatus(lid);
}

function rdToggleLoop(lid) {
  rdState.loopOn[lid] = !rdState.loopOn[lid];
  var btn = document.getElementById('rd-loop-' + lid);
  if (btn) btn.classList.toggle('loop-on', rdState.loopOn[lid]);
}
