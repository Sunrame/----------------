/* ================= ДАННЫЕ ================= */
/* w — голосов «работает», p — «частично», x — «не работает»
   u — числовой ключ даты (месяц*100+день) для сортировки
   wl — обход белых списков: ok / mid / no                    */
const DATA = [
 {n:'WPN.ME',upd:'23 июл',u:723,w:48,p:2,x:2,r:4.8,rv:28,wl:'ok',pr:350,tr:'Безлимит',dv:'10',pt:['VLESS','Reality'],trl:true,
  rw:[{a:'Олег',o:'МТС',s:5,t:'Полгода без единого разрыва, ютуб в 4К.',d:'21 июл'},{a:'Аноним',o:'Билайн',s:4,t:'Работает, но хочется сервер поближе.',d:'14 июл'}]},
 {n:'XConnect VPN',upd:'20 июл',u:720,w:258,p:9,x:8,r:4.7,rv:87,wl:'ok',pr:149,tr:'Безлимит',dv:'3',pt:['VLESS','Reality'],trl:true,
  rw:[{a:'Марина',o:'МегаФон',s:5,t:'Даже в белом списке тянет — редкость.',d:'19 июл'},{a:'dmtr',o:'Tele2',s:4,t:'Иногда просаживается вечером, в целом топ.',d:'8 июл'}]},
 {n:'StealthSurf VPN',upd:'26 июл',u:726,w:229,p:13,x:10,r:4.6,rv:150,wl:'ok',pr:199,tr:'Безлимит',dv:'Безлимит',pt:['VLESS','Reality','XHTTP'],trl:true,
  rw:[{a:'Аноним',o:'МТС',s:5,t:'Двухзвенная схема реально спасает на мобильном.',d:'26 июл'},{a:'Kira',o:'Ростелеком',s:4,t:'Скорость ок, поддержка отвечает быстро.',d:'22 июл'},{a:'Паша',o:'Билайн',s:5,t:'Единственный, кто пережил июльские блокировки.',d:'17 июл'}]},
 {n:'AmneziaVPN',upd:'25 июл',u:725,w:240,p:40,x:59,r:3.7,rv:50,wl:'no',pr:380,tr:'Безлимит',dv:'7',pt:['AmneziaWG','OpenVPN'],
  rw:[{a:'Гена',o:'МТС',s:3,t:'Свой сервер — хорошо, но настройка не для всех.',d:'23 июл'},{a:'Аноним',o:'МегаФон',s:2,t:'В белом списке лежит полностью.',d:'11 июл'}]},
 {n:'GeodemaVPN',upd:'9 июл',u:709,w:156,p:20,x:16,r:4.1,rv:20,wl:'mid',pr:299,tr:'Безлимит',dv:'10',pt:['VLESS','WireGuard']},
 {n:'FS VPN',upd:'26 июл',u:726,w:119,p:0,x:0,r:5.0,rv:30,wl:'ok',pr:299,tr:'Безлимит',dv:'от 1 до 10',pt:['VLESS','Reality'],trl:true},
 {n:'DOZOR VPN',upd:'27 июл',u:727,w:98,p:1,x:1,r:4.9,rv:45,wl:'ok',pr:199,tr:'Безлимит',dv:'3, 5, 7',pt:['VLESS','Reality','Hysteria2'],
  rw:[{a:'Света',o:'Tele2',s:5,t:'Ни одного падения за месяц, беру ещё год.',d:'27 июл'}]},
 {n:'GLOBUS VPN',upd:'24 июн',u:624,w:120,p:12,x:9,r:4.3,rv:38,wl:'mid',pr:149,tr:'Безлимит',dv:'—',pt:['VLESS','Shadowsocks']},
 {n:'КОПАТЫЧ ВПН',upd:'26 июл',u:726,w:89,p:3,x:2,r:4.8,rv:12,wl:'mid',pr:50,tr:'Безлимит',dv:'—',pt:['VLESS'],
  rw:[{a:'Аноним',o:'МТС',s:5,t:'За полтинник — просто копай и пользуйся.',d:'25 июл'}]},
 {n:'EOFVPN',upd:'18 июл',u:718,w:120,p:26,x:20,r:3.9,rv:16,wl:'mid',pr:0,tr:'Безлимит',dv:'15',pt:['VLESS','OpenVPN']},
 {n:'VPN Red Shield',upd:'9 июл',u:709,w:92,p:10,x:9,r:4.2,rv:15,wl:'mid',pr:800,tr:'Безлимит',dv:'10',pt:['VLESS','WireGuard']},
 {n:'BlancVPN',upd:'22 июн',u:622,w:112,p:20,x:26,r:3.7,rv:42,wl:'mid',pr:800,tr:'Безлимит',dv:'Безлимит',pt:['VLESS','Hysteria2'],trl:true},
 {n:'ByGate VPN',upd:'18 июл',u:718,w:71,p:0,x:0,r:5.0,rv:5,wl:'mid',pr:149,tr:'Безлимит',dv:'Безлимит',pt:['VLESS','Reality']},
 {n:'Velion VPN',upd:'26 июн',u:626,w:78,p:0,x:0,r:5.0,rv:12,wl:'ok',pr:159,tr:'Безлимит',dv:'3',pt:['VLESS','Reality']},
 {n:'FPTN',upd:'25 июл',u:725,w:70,p:16,x:10,r:3.8,rv:15,wl:'mid',pr:0,tr:'Безлимит',dv:'3',pt:['Shadowsocks']},
 {n:'MatadoraVPN',upd:'27 июл',u:727,w:48,p:3,x:2,r:4.5,rv:11,wl:'ok',pr:159,tr:'Безлимит',dv:'1-10',pt:['VLESS','Reality']},
 {n:'PaperVPN',upd:'27 июл',u:727,w:62,p:10,x:15,r:3.9,rv:9,wl:'no',pr:380,tr:'100 ГБ / мес',dv:'Безлимит',pt:['WireGuard','OpenVPN']},
 {n:'SatkaVPN',upd:'27 июл',u:727,w:46,p:4,x:3,r:4.5,rv:17,wl:'ok',pr:0,tr:'100 ГБ / мес',dv:'1-999',pt:['VLESS','AmneziaWG']},
 {n:'Flow Proxy',upd:'22 июл',u:722,w:60,p:9,x:7,r:4.0,rv:8,wl:'mid',pr:199,tr:'50 ГБ / мес',dv:'3',pt:['Shadowsocks','VLESS']},
 {n:'Xnet VPN',upd:'26 июл',u:726,w:38,p:2,x:1,r:4.6,rv:13,wl:'mid',pr:0,tr:'Безлимит',dv:'1, 5, 10, 20',pt:['VLESS']},
 {n:'ZVO Connect',upd:'30 июн',u:630,w:27,p:0,x:0,r:5.0,rv:21,wl:'ok',pr:199,tr:'Безлимит',dv:'—',pt:['VLESS','Reality']},
 {n:'PROTECT YOU VPN',upd:'6 июн',u:606,w:31,p:5,x:4,r:4.5,rv:14,wl:'ok',pr:0,tr:'Безлимит',dv:'5, 10, безлимит',pt:['VLESS','AmneziaWG']},
 {n:'ShadowHub',upd:'5 июн',u:605,w:38,p:7,x:5,r:4.1,rv:5,wl:'mid',pr:250,tr:'Безлимит',dv:'5',pt:['Shadowsocks','VLESS']},
 {n:'Lightning VPN',upd:'27 июл',u:727,w:23,p:1,x:0,r:4.9,rv:35,wl:'ok',pr:150,tr:'500 ГБ / мес',dv:'2-8',pt:['VLESS','Hysteria2'],trl:true},
 {n:'DAR VPN',upd:'3 июл',u:703,w:24,p:0,x:0,r:5.0,rv:13,wl:'ok',pr:149,tr:'Безлимит',dv:'—',pt:['VLESS','Reality']},
 {n:'Turbo Gate VPN',upd:'25 июл',u:725,w:19,p:1,x:1,r:4.7,rv:7,wl:'ok',pr:99,tr:'Безлимит',dv:'5',pt:['VLESS'],trl:true},
 {n:'SnegVPN',upd:'21 июл',u:721,w:15,p:4,x:3,r:4.0,rv:6,wl:'mid',pr:0,tr:'10 ГБ / мес',dv:'1',pt:['WireGuard']},
 {n:'Kometa VPN',upd:'27 июл',u:727,w:14,p:1,x:0,r:4.9,rv:9,wl:'ok',pr:129,tr:'Безлимит',dv:'3',pt:['VLESS','Reality'],trl:true},
 {n:'Bober VPN',upd:'12 июл',u:712,w:11,p:4,x:4,r:3.5,rv:4,wl:'mid',pr:89,tr:'Безлимит',dv:'—',pt:['OpenVPN','WireGuard']},
 {n:'Polar Net',upd:'26 июл',u:726,w:21,p:2,x:1,r:4.6,rv:8,wl:'ok',pr:179,tr:'Безлимит',dv:'4',pt:['Hysteria2','VLESS']},
 {n:'MgLink VPN',upd:'15 июл',u:715,w:12,p:2,x:2,r:4.2,rv:3,wl:'mid',pr:249,tr:'200 ГБ / мес',dv:'2',pt:['Shadowsocks']},
 {n:'FreeGate',upd:'18 июл',u:718,w:9,p:5,x:20,r:2.8,rv:11,wl:'no',pr:0,tr:'5 ГБ / мес',dv:'1',pt:['OpenVPN']},
 {n:'Zebra VPN',upd:'3 июн',u:603,w:7,p:3,x:16,r:2.5,rv:5,wl:'no',pr:299,tr:'Безлимит',dv:'5',pt:['OpenVPN']},
];
DATA.forEach((v,i)=>{ v.id=i; v.rw=v.rw||[]; });

/* ================= СОСТОЯНИЕ ================= */
const S = {st:'all',q:'',price:850,proto:'any',wl:'any',rate:0,free:false,unl:false,trial:false,sort:'w',dir:-1,page:1,pp:25};
const WLTXT = {ok:'Работает',mid:'Частично',no:'Не работает'};
const $ = s=>document.querySelector(s);
const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const tot = v=>v.w+v.p+v.x;
const ratio = v=>tot(v)?(v.w+v.p*.5)/tot(v):0;
const status = v=>{const r=ratio(v);return r>=.85?'ok':r>=.5?'mid':'no'};
const price = v=>v.pr===0?'Бесплатно':v.pr+' ₽ / мес';
const avaCls = v=>'v'+(v.id%3);
const initials = n=>{const p=n.replace(/VPN|ВПН/gi,'').trim().split(/\s+/);return ((p[0]||n)[0]+(p[1]?p[1][0]:'')).toUpperCase()};

/* ================= ФИЛЬТРАЦИЯ ================= */
function passExceptStatus(v){
  if(S.q && !v.n.toLowerCase().includes(S.q)) return false;
  if(v.pr>S.price) return false;
  if(S.proto!=='any' && !v.pt.includes(S.proto)) return false;
  if(S.wl!=='any' && v.wl!==S.wl) return false;
  if(S.rate && v.r<S.rate) return false;
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
    let va=k==='n'?a.n.toLowerCase():a[k], vb=k==='n'?b.n.toLowerCase():b[k];
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
    <td><span class="star">★ ${v.r.toFixed(1)}</span></td>
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
      <span class="k">Рейтинг</span><span class="star">★ ${v.r.toFixed(1)} <span class="mut">(${v.rv})</span></span>
      <span class="k">Обход БС</span><span>${stBadge(v.wl)}</span>
      <span class="k">Цена от</span><span>${price(v)}</span>
      <span class="k">Трафик</span><span>${v.tr}</span>
      <span class="k">Устройства</span><span>${esc(v.dv)}</span>
    </div>
  </div>`;
}
function render(){
  const {base,arr} = filtered();
  /* счётчики */
  const cnt={ok:0,mid:0,no:0};
  base.forEach(v=>cnt[status(v)]++);
  $('#cAll').textContent='('+base.length+')';
  $('#cOk').textContent='('+cnt.ok+')'; $('#cMid').textContent='('+cnt.mid+')'; $('#cNo').textContent='('+cnt.no+')';
  const g={ok:0,mid:0,no:0}; let rev=0;
  DATA.forEach(v=>{g[status(v)]++; rev+=v.rv;});
  $('#stWork').textContent=g.ok; $('#stTotal').textContent=DATA.length; $('#stRev').textContent=rev;
  $('#found').textContent=arr.length;
  /* страницы */
  const pages=Math.max(1,Math.ceil(arr.length/S.pp));
  if(S.page>pages) S.page=pages;
  const slice=arr.slice((S.page-1)*S.pp, S.page*S.pp);
  $('#rows').innerHTML = slice.map(rowHTML).join('') || `<tr><td colspan="7" style="text-align:center;padding:34px" class="norvw">Ничего не нашлось — попробуйте сбросить фильтры 🤷</td></tr>`;
  $('#cards').innerHTML = slice.map(cardHTML).join('') || `<p class="norvw" style="padding:20px">Ничего не нашлось — попробуйте сбросить фильтры 🤷</p>`;
  let ph='';
  for(let i=1;i<=pages;i++) ph+=`<button class="pg ${i===S.page?'on':''}" data-pg="${i}">${i}</button>`;
  $('#pag').innerHTML=pages>1?ph:'';
  const from=arr.length?(S.page-1)*S.pp+1:0;
  $('#pgInfo').textContent=`${from}–${Math.min(S.page*S.pp,arr.length)} из ${arr.length}`;
  /* стрелки сортировки */
  document.querySelectorAll('th[data-sort]').forEach(th=>{
    th.textContent=th.textContent.replace(/ [↑↓]$/,'');
    th.classList.toggle('th-on',th.dataset.sort===S.sort);
    if(th.dataset.sort===S.sort) th.textContent+=S.dir===-1?' ↓':' ↑';
  });
}

/* ================= МОДАЛКА СЕРВИСА ================= */
let vote={st:null,stars:0};
function openVpn(id){
  const v=DATA[id]; vote={st:null,stars:0};
  $('#mBox').innerHTML=`
    <button class="mclose" data-close aria-label="Закрыть">✕</button>
    <div class="mhead">
      <span class="ava ${avaCls(v)}">${initials(v.n)}</span>
      <div><h3>${esc(v.n)}</h3>
      <div style="margin-top:4px">${stBadge(status(v))}</div></div>
    </div>
    <div class="mstats">
      <div class="ms"><div class="k">Рейтинг</div><div class="v star">★ ${v.r.toFixed(1)}</div></div>
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
      <div id="rvList">${v.rw.length?v.rw.map(r=>rvHTML(r)).join(''):'<p class="norvw">Отзывов пока нет — будьте первым! ✍</p>'}</div>
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
        <textarea id="vTxt" placeholder="Пара слов о сервисе (необязательно)…"></textarea>
        <button class="btn prime vsend" id="vSend" data-id="${v.id}">Отправить голос</button>
      </div>
    </div>`;
  $('#ovl').classList.add('open');
  document.body.style.overflow='hidden';
}
function rvHTML(r){
  return `<div class="rvw"><div class="rh"><b>${esc(r.a)}</b><span>📶 ${esc(r.o)}</span>${r.s?`<span class="star">${'★'.repeat(r.s)}</span>`:''}<span>${r.d}</span></div><div class="rt">${esc(r.t)}</div></div>`;
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
document.addEventListener('click',e=>{
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
    const id=+e.target.closest('#vSend').dataset.id, v=DATA[id];
    if(!vote.st){toast('Сначала выберите: работает, частично или нет 🙂'); return;}
    if(vote.st==='ok') v.w++; else if(vote.st==='mid') v.p++; else v.x++;
    const txt=$('#vTxt').value.trim(), op=$('#vOp').value;
    if(vote.stars>0){v.r=(v.r*v.rv+vote.stars)/(v.rv+1); v.rv++;}
    if(txt){v.rw.unshift({a:'Вы',o:op,s:vote.stars,t:txt,d:'сегодня'});}
    render(); openVpn(id);
    toast('Голос учтён — рейтинг обновлён! 🗳'); return;}

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
$('#addForm').addEventListener('submit',e=>{
  e.preventDefault(); closeModals(); e.target.reset();
  toast('Заявка отправлена на модерацию — сервис скоро появится в каталоге 🚀');
});
$('#burger').addEventListener('click',()=>$('#mnav').classList.toggle('open'));
document.querySelectorAll('#mnav a').forEach(a=>a.addEventListener('click',()=>$('#mnav').classList.remove('open')));

/* дата «обновлено» */
const now=new Date();
$('#stDate').textContent=now.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});

render();

/* ================= COOKIE-УВЕДОМЛЕНИЕ ================= */
const store={
  get(k){try{return localStorage.getItem(k)}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
};
const cBar=$('#cookies');
if(cBar && !store.get('vh_cookies')) cBar.hidden=false;
const cOk=$('#cookieOk');
if(cOk) cOk.addEventListener('click',()=>{store.set('vh_cookies','1'); cBar.hidden=true;});
