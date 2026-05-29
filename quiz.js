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
