/* ================= СОСТОЯНИЕ ================= */
let DATA = [];       // каталог сервисов — приходит с сервера
let LOADED = false;  // отличаем «ещё грузится» от «загружено и пусто»
const S = {st:'all',q:'',price:850,proto:'any',wl:'any',rate:0,free:false,unl:false,trial:false,sort:'w',dir:-1,page:1,pp:25};
const WLTXT = {ok:'Работает',mid:'Частично',no:'Не работает'};
const MONTHS=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const $ = s=>document.querySelector(s);
const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtDate = iso=>{const d=new Date(iso); return isNaN(d)?'':d.getDate()+' '+MONTHS[d.getMonth()]};

const tot = v=>v.w+v.p+v.x;
const ratio = v=>tot(v)?(v.w+v.p*.5)/tot(v):0;
const status = v=>{const r=ratio(v);return r>=.85?'ok':r>=.5?'mid':'no'};
const price = v=>v.pr===0?'Бесплатно':v.pr+' ₽ / мес';
const avaCls = v=>'v'+(v.id%3);
const initials = n=>{const p=n.replace(/VPN|ВПН/gi,'').trim().split(/\s+/);return ((p[0]||n)[0]+(p[1]?p[1][0]:'')).toUpperCase()};
const ratingTxt = v=> v.r==null?'—':v.r.toFixed(1);
const ratingNum = v=> v.r==null?0:v.r;

/* ================= API ================= */
async function api(path, opts={}){
  const res = await fetch(path, {headers:{'Content-Type':'application/json'}, ...opts});
  let data=null; try{ data = await res.json(); }catch(e){}
  if(!res.ok) throw new Error((data&&data.detail) || 'Ошибка сети — попробуйте ещё раз');
  return data;
}
async function loadCatalog(){
  try{ DATA = await api('/api/services'); }
  catch(e){ DATA=[]; toast('Не удалось загрузить каталог — обновите страницу'); }
  LOADED = true;
  render();
}

/* ================= ФИЛЬТРАЦИЯ ================= */
function passExceptStatus(v){
  if(S.q && !v.n.toLowerCase().includes(S.q)) return false;
  if(v.pr>S.price) return false;
  if(S.proto!=='any' && !v.pt.includes(S.proto)) return false;
  if(S.wl!=='any' && v.wl!==S.wl) return false;
  if(S.rate && ratingNum(v)<S.rate) return false;
  if(S.free && v.pr!==0) return false;
  if(S.unl && v.tr!=='Безлимит') return false;
  if(S.trial && !v.trl) return false;
  return true;
}
function filtered(){
  const base = DATA.filter(passExceptStatus);
  const arr = (S.st==='all'?base:base.filter(v=>status(v)===S.st)).slice();
  arr.sort((a,b)=>{
    const k=S.sort;
    let va=k==='n'?a.n.toLowerCase():(k==='r'?ratingNum(a):a[k]);
    let vb=k==='n'?b.n.toLowerCase():(k==='r'?ratingNum(b):b[k]);
    if(va<vb) return S.dir===-1?1:-1;
    if(va>vb) return S.dir===-1?-1:1;
    return b.w-a.w;
  });
  return {base,arr};
}

/* ================= ОТРИСОВКА ================= */
function stBadge(code){return `<span class="st ${code}">${WLTXT[code]}</span>`}
function rowHTML(v){
  const st=status(v);
  return `<tr data-id="${v.id}" title="Открыть отзывы и голосование">
    <td><span class="vname"><span class="sdot ${st}" title="${WLTXT[st]}"></span><span class="ava ${avaCls(v)}">${initials(v.n)}</span>${esc(v.n)}</span></td>
    <td><span class="star">★ ${ratingTxt(v)}</span></td>
    <td>${v.rv}</td>
    <td>${stBadge(v.wl)}</td>
    <td>${price(v)}</td>
    <td class="mut">${v.tr}</td>
    <td class="mut">${esc(v.dv)}</td>
  </tr>`;
}
function cardHTML(v){
  const st=status(v);
  return `<div class="vcard" data-id="${v.id}">
    <div class="vname"><span class="sdot ${st}" title="${WLTXT[st]}"></span><span class="ava ${avaCls(v)}">${initials(v.n)}</span>${esc(v.n)}</div>
    <div class="vgrid">
      <span class="k">Статус</span><span>${stBadge(st)}</span>
      <span class="k">Рейтинг</span><span class="star">★ ${ratingTxt(v)} <span class="mut">(${v.rv})</span></span>
      <span class="k">Обход БС</span><span>${stBadge(v.wl)}</span>
      <span class="k">Цена от</span><span>${price(v)}</span>
      <span class="k">Трафик</span><span>${v.tr}</span>
      <span class="k">Устройства</span><span>${esc(v.dv)}</span>
    </div>
  </div>`;
}
function render(){
  const {base,arr} = filtered();
  const cnt={ok:0,mid:0,no:0};
  base.forEach(v=>cnt[status(v)]++);
  $('#cAll').textContent='('+base.length+')';
  $('#cOk').textContent='('+cnt.ok+')'; $('#cMid').textContent='('+cnt.mid+')'; $('#cNo').textContent='('+cnt.no+')';
  const g={ok:0,mid:0,no:0}; let rev=0;
  DATA.forEach(v=>{g[status(v)]++; rev+=v.rv;});
  $('#stWork').textContent=g.ok; $('#stTotal').textContent=DATA.length; $('#stRev').textContent=rev;
  $('#found').textContent=arr.length;
  const pages=Math.max(1,Math.ceil(arr.length/S.pp));
  if(S.page>pages) S.page=pages;
  const slice=arr.slice((S.page-1)*S.pp, S.page*S.pp);
  const emptyMsg = LOADED ? 'Ничего не нашлось — попробуйте сбросить фильтры 🤷' : 'Загружаем каталог…';
  $('#rows').innerHTML = slice.map(rowHTML).join('') || `<tr><td colspan="7" style="text-align:center;padding:34px" class="norvw">${emptyMsg}</td></tr>`;
  $('#cards').innerHTML = slice.map(cardHTML).join('') || `<p class="norvw" style="padding:20px">${emptyMsg}</p>`;
  let ph='';
  for(let i=1;i<=pages;i++) ph+=`<button class="pg ${i===S.page?'on':''}" data-pg="${i}">${i}</button>`;
  $('#pag').innerHTML=pages>1?ph:'';
  const from=arr.length?(S.page-1)*S.pp+1:0;
  $('#pgInfo').textContent=`${from}–${Math.min(S.page*S.pp,arr.length)} из ${arr.length}`;
  document.querySelectorAll('th[data-sort]').forEach(th=>{
    th.textContent=th.textContent.replace(/ [↑↓]$/,'');
    th.classList.toggle('th-on',th.dataset.sort===S.sort);
    if(th.dataset.sort===S.sort) th.textContent+=S.dir===-1?' ↓':' ↑';
  });
}

/* ================= МОДАЛКА СЕРВИСА ================= */
let vote={st:null,stars:0};
async function openVpn(id){
  vote={st:null,stars:0};
  $('#mBox').innerHTML=`<button class="mclose" data-close aria-label="Закрыть">✕</button><p class="norvw" style="padding:40px 0;text-align:center">Загрузка…</p>`;
  $('#ovl').classList.add('open');
  document.body.style.overflow='hidden';
  let v;
  try{ v = await api('/api/services/'+id); }
  catch(e){
    $('#mBox').innerHTML=`<button class="mclose" data-close aria-label="Закрыть">✕</button><p class="norvw" style="padding:40px 0;text-align:center">Не удалось загрузить сервис 😕</p>`;
    return;
  }
  renderModal(v);
}
function renderModal(v){
  const reviews = v.reviews||[];
  $('#mBox').innerHTML=`
    <button class="mclose" data-close aria-label="Закрыть">✕</button>
    <div class="mhead">
      <span class="ava ${avaCls(v)}">${initials(v.n)}</span>
      <div><h3>${esc(v.n)}</h3>
      <div style="margin-top:4px">${stBadge(status(v))}</div></div>
    </div>
    <div class="mstats">
      <div class="ms"><div class="k">Рейтинг</div><div class="v star">★ ${ratingTxt(v)}</div></div>
      <div class="ms"><div class="k">Отзывы</div><div class="v">${v.rv}</div></div>
      <div class="ms"><div class="k">Обход БС</div><div class="v">${stBadge(v.wl)}</div></div>
      <div class="ms"><div class="k">Цена от</div><div class="v">${price(v)}</div></div>
      <div class="ms"><div class="k">Трафик</div><div class="v">${v.tr}</div></div>
      <div class="ms"><div class="k">Устройства</div><div class="v">${esc(v.dv)}</div></div>
      <div class="ms"><div class="k">Пробный период</div><div class="v">${v.trl?'Есть':'Нет'}</div></div>
    </div>
    <div class="prots">${v.pt.map(p=>`<span class="prot">${p}</span>`).join('')}</div>
    <div class="msec">
      <h4>💬 Отзывы</h4>
      <div id="rvList">${reviews.length?reviews.map(r=>rvHTML(r)).join(''):'<p class="norvw">Отзывов пока нет — будьте первым! ✍</p>'}</div>
    </div>
    <div class="msec">
      <h4>🗳 Как ${esc(v.n)} работает у вас?</h4>
      <div class="vform">
        <div class="vbtns">
          <button type="button" class="vbtn ok" data-v="ok">✔ Работает</button>
          <button type="button" class="vbtn mid" data-v="mid">〜 Частично</button>
          <button type="button" class="vbtn no" data-v="no">✘ Не работает</button>
        </div>
        <div class="vrow">
          <select id="vOp" aria-label="Ваш оператор">
            <option>МТС</option><option>МегаФон</option><option>Билайн</option>
            <option>Tele2</option><option>Ростелеком</option><option>Другой</option>
          </select>
          <span class="stars" role="radiogroup" aria-label="Оценка">
            ${[1,2,3,4,5].map(i=>`<button type="button" class="sbtn" data-s="${i}" aria-label="${i} из 5">★</button>`).join('')}
          </span>
        </div>
        <input id="vName" maxlength="40" placeholder="Ваше имя или псевдоним (необязательно)" style="margin-top:12px">
        <textarea id="vTxt" placeholder="Пара слов о сервисе (необязательно)…"></textarea>
        <button class="btn prime vsend" id="vSend" data-id="${v.id}">Отправить голос</button>
      </div>
    </div>`;
}
function rvHTML(r){
  return `<div class="rvw"><div class="rh"><b>${esc(r.a)}</b><span>📶 ${esc(r.o)}</span>${r.s?`<span class="star">${'★'.repeat(r.s)}</span>`:''}<span>${fmtDate(r.d)}</span></div><div class="rt">${esc(r.t)}</div></div>`;
}
function closeModals(){
  document.querySelectorAll('.ovl').forEach(o=>o.classList.remove('open'));
  document.body.style.overflow='';
}

/* ================= ТОСТ ================= */
let toastT;
function toast(msg){
  const t=$('#toast'); t.hidden=false; t.textContent=msg;
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(toastT);
  toastT=setTimeout(()=>{t.classList.remove('show'); setTimeout(()=>t.hidden=true,300)},2600);
}

/* ================= ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ ================= */
function showPage(p){
  $('#pageMain').hidden = p!=='main';
  $('#pageAbout').hidden = p!=='about';
  window.scrollTo({top:0,behavior:'auto'});
}

/* ================= СОБЫТИЯ ================= */
document.addEventListener('click', async e=>{
  const pl=e.target.closest('[data-page]');
  if(pl){e.preventDefault(); showPage(pl.dataset.page); $('#mnav').classList.remove('open'); return;}

  const stub=e.target.closest('[data-stub]');
  if(stub){e.preventDefault(); toast('«'+stub.dataset.stub+'» — раздел в разработке 🛠'); return;}

  const an=e.target.closest('a[href^="#"]');
  if(an && an.getAttribute('href').length>1 && $('#pageMain').hidden) showPage('main');

  const tab=e.target.closest('.tab');
  if(tab){S.st=tab.dataset.st; S.page=1;
    document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t===tab));
    render(); return;}

  const row=e.target.closest('tr[data-id],.vcard[data-id]');
  if(row){openVpn(+row.dataset.id); return;}

  const th=e.target.closest('th[data-sort]');
  if(th){const k=th.dataset.sort;
    if(S.sort===k) S.dir*=-1; else {S.sort=k; S.dir=k==='n'?1:-1;}
    S.page=1; render(); return;}

  const pg=e.target.closest('.pg');
  if(pg){S.page=+pg.dataset.pg; render();
    document.getElementById('catalog').scrollIntoView({behavior:'smooth'}); return;}

  const vb=e.target.closest('.vbtn');
  if(vb){vote.st=vb.dataset.v;
    vb.parentElement.querySelectorAll('.vbtn').forEach(b=>b.classList.toggle('on',b===vb)); return;}

  const sb=e.target.closest('.sbtn');
  if(sb){vote.stars=+sb.dataset.s;
    sb.parentElement.querySelectorAll('.sbtn').forEach(b=>b.classList.toggle('on',+b.dataset.s<=vote.stars)); return;}

  if(e.target.closest('#vSend')){
    const btn=e.target.closest('#vSend'), id=+btn.dataset.id;
    if(!vote.st){toast('Сначала выберите: работает, частично или нет 🙂'); return;}
    const text=$('#vTxt').value.trim(), operator=$('#vOp').value, author=$('#vName').value.trim();
    const oldTxt=btn.textContent; btn.disabled=true; btn.textContent='Отправляем…';
    try{
      const res = await api(`/api/services/${id}/vote`,{method:'POST',
        body:JSON.stringify({status:vote.st, operator, stars:vote.stars||null, text, author})});
      toast(res.moderated ? 'Голос учтён, отзыв — на модерации ✍' : 'Голос учтён — рейтинг обновлён! 🗳');
      await loadCatalog();
      await openVpn(id);
    }catch(err){
      toast(err.message||'Не получилось отправить голос');
      btn.disabled=false; btn.textContent=oldTxt;
    }
    return;
  }

  if(e.target.closest('[data-close]')){closeModals(); return;}
  if(e.target.classList && e.target.classList.contains('ovl')){closeModals(); return;}
});

document.addEventListener('keydown',e=>{if(e.key==='Escape') closeModals();});

$('#q').addEventListener('input',e=>{S.q=e.target.value.trim().toLowerCase(); S.page=1; render();});
$('#btnFilters').addEventListener('click',()=>{
  const f=$('#filters'); f.classList.toggle('open');
  $('#btnFilters').textContent=f.classList.contains('open')?'Свернуть фильтры ▴':'Развернуть фильтры ▾';
});
$('#fPrice').addEventListener('input',e=>{
  S.price=+e.target.value;
  $('#fPriceLbl').textContent=S.price>=850?'любая':(S.price===0?'только бесплатные':'до '+S.price+' ₽/мес');
  S.page=1; render();
});
$('#fProto').addEventListener('change',e=>{S.proto=e.target.value; S.page=1; render();});
$('#fWl').addEventListener('change',e=>{S.wl=e.target.value; S.page=1; render();});
$('#fRate').addEventListener('change',e=>{S.rate=+e.target.value; S.page=1; render();});
$('#fFree').addEventListener('change',e=>{S.free=e.target.checked; S.page=1; render();});
$('#fUnl').addEventListener('change',e=>{S.unl=e.target.checked; S.page=1; render();});
$('#fTrial').addEventListener('change',e=>{S.trial=e.target.checked; S.page=1; render();});
$('#btnReset').addEventListener('click',()=>{
  Object.assign(S,{q:'',price:850,proto:'any',wl:'any',rate:0,free:false,unl:false,trial:false,page:1});
  $('#q').value=''; $('#fPrice').value=850; $('#fPriceLbl').textContent='любая';
  $('#fProto').value='any'; $('#fWl').value='any'; $('#fRate').value='0';
  $('#fFree').checked=false; $('#fUnl').checked=false; $('#fTrial').checked=false;
  render(); toast('Фильтры сброшены 🧹');
});
$('#perPage').addEventListener('change',e=>{S.pp=+e.target.value; S.page=1; render();});
$('#addBtn').addEventListener('click',()=>{$('#addOvl').classList.add('open'); document.body.style.overflow='hidden';});
$('#addForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const body={
    name:$('#aName').value.trim(), link:$('#aLink').value.trim(),
    price:$('#aPrice').value.trim(), protocols:$('#aProt').value.trim(),
    comment:$('#aTxt').value.trim(),
  };
  const btn=e.target.querySelector('button[type=submit]'); btn.disabled=true;
  try{
    await api('/api/submissions',{method:'POST', body:JSON.stringify(body)});
    closeModals(); e.target.reset();
    toast('Заявка отправлена на модерацию — спасибо! 🚀');
  }catch(err){ toast(err.message||'Не получилось отправить заявку'); }
  finally{ btn.disabled=false; }
});
$('#burger').addEventListener('click',()=>$('#mnav').classList.toggle('open'));
document.querySelectorAll('#mnav a').forEach(a=>a.addEventListener('click',()=>$('#mnav').classList.remove('open')));

/* дата «обновлено» */
const now=new Date();
$('#stDate').textContent=now.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});

loadCatalog();

/* ================= COOKIE-УВЕДОМЛЕНИЕ ================= */
const store={
  get(k){try{return localStorage.getItem(k)}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
};
const cBar=$('#cookies');
if(cBar && !store.get('vh_cookies')) cBar.hidden=false;
const cOk=$('#cookieOk');
if(cOk) cOk.addEventListener('click',()=>{store.set('vh_cookies','1'); cBar.hidden=true;});
