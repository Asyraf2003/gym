(()=>{'use strict';
const $=s=>document.querySelector(s),app=$('#app'),nav=$('#nav'),dialog=$('#dialog'),toast=$('#toast');
const paths={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',dumbbell:'<path d="M6 7v10M3 9v6m3-3h12m0-5v10m3-8v6M9 10v4m6-4v4"/>',chart:'<path d="M3 17l6-6 4 4 8-9M15 6h6v6"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.6-2-3.4-2.4 1A7 7 0 0 0 14 5l-.4-2.6h-3.2L10 5a7 7 0 0 0-2.4 1.4l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 3.2l-2 1.6 2 3.4 2.4-1A7 7 0 0 0 10 19l.4 2.6h3.2L14 19a7 7 0 0 0 2.4-1.4l2.4 1 2-3.4-2-1.6A7 7 0 0 0 19 12z"/>',heart:'<path d="M20 6c-2-3-6-3-8 0-2-3-6-3-8 0-3 5 8 13 8 13S23 11 20 6z"/><path d="M3 12h5l2-3 3 6 2-3h6"/>',leg:'<path d="M8 3h7l2 5-2 5 3 8H9l-2-8 2-5z"/>',down:'<path d="m6 9 6 6 6-6"/>',back:'<path d="m15 18-6-6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12 4 4L19 6"/>',play:'<path d="m8 5 11 7-11 7z"/>',pause:'<path d="M8 5v14M16 5v14"/>',timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v5l3 2M9 2h6"/>',edit:'<path d="M4 20h4L20 8l-4-4L4 16v4zM14 6l4 4"/>',trash:'<path d="M4 7h16M9 4h6M7 7l1 13h8l1-13M10 11v6m4-6v6"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/>',cloud:'<path d="M7 18h11a4 4 0 0 0 0-8h-1A6 6 0 0 0 5 11a4 4 0 0 0 2 7z"/>',history:'<path d="M3 12a9 9 0 1 0 3-7M3 4v5h5M12 7v6l4 2"/>',up:'<path d="m6 15 6-6 6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',close:'<path d="M5 5l14 14M19 5 5 19"/>',save:'<path d="M4 3h14l3 3v15H3V3zM7 3v7h10V3M7 21v-8h10v8"/>',bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',weight:'<path d="M12 3v18M6 7v10M18 7v10M3 9v6M21 9v6"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',moon:'<path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11z"/>',logout:'<path d="M10 17l5-5-5-5M15 12H3M12 3h9v18h-9"/>'};
const ico=(n,size=19)=>`<svg class="icon" style="width:${size}px;height:${size}px" viewBox="0 0 24 24" aria-hidden="true">${paths[n]||paths.dumbbell}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seed=[
{id:'r1',name:'Dada + Kardio',category:'Dada',detail:'Fokus dada, skipping sebagai penutup',duration:65,exercises:['Bench Press','Incline Dumbbell Press','Chest Fly','Triceps Extension','Skipping']},
{id:'r2',name:'Punggung + Kardio',category:'Punggung',detail:'Fokus tarikan, bersepeda ringan sebagai penutup',duration:60,exercises:['Lat Pulldown','Seated Cable Row','Single Arm Row','Biceps Curl','Cycling']},
{id:'r3',name:'Kaki + Kardio',category:'Kaki',detail:'Fokus kaki, jalan menanjak sebagai penutup',duration:70,exercises:['Squat','Romanian Deadlift','Leg Press','Leg Curl','Incline Walking']},
{id:'r4',name:'Kardio Intensif',category:'Kardio',detail:'Interval dan ketahanan',duration:25,exercises:['Skipping Intervals','Running']}
];
const defaultCatalog=[{name:'Bench Press',cat:'Dada',type:'strength'},{name:'Incline Dumbbell Press',cat:'Dada',type:'strength'},{name:'Chest Fly',cat:'Dada',type:'strength'},{name:'Triceps Extension',cat:'Lengan',type:'strength'},{name:'Push Up',cat:'Dada',type:'strength'},{name:'Lat Pulldown',cat:'Punggung',type:'strength'},{name:'Seated Cable Row',cat:'Punggung',type:'strength'},{name:'Single Arm Row',cat:'Punggung',type:'strength'},{name:'Biceps Curl',cat:'Lengan',type:'strength'},{name:'Squat',cat:'Kaki',type:'strength'},{name:'Romanian Deadlift',cat:'Kaki',type:'strength'},{name:'Leg Press',cat:'Kaki',type:'strength'},{name:'Leg Curl',cat:'Kaki',type:'strength'},{name:'Dumbbell Lateral Raise',cat:'Bahu',type:'strength'},{name:'Plank',cat:'Inti',type:'cardio'},{name:'Skipping',cat:'Kardio',type:'cardio'},{name:'Skipping Intervals',cat:'Kardio',type:'cardio'},{name:'Running',cat:'Kardio',type:'cardio'},{name:'Cycling',cat:'Kardio',type:'cardio'},{name:'Incline Walking',cat:'Kardio',type:'cardio'}];
function read(){try{return JSON.parse(localStorage.getItem('forgefit-ui-demo-v3'))}catch(_){return null}}
const previous=read()||{};
const catalog=[...defaultCatalog,...(previous.customCatalog||[])];
const s={page:'beranda',theme:previous.theme||'gelap',animations:previous.animations??true,restDefault:previous.restDefault||90,unit:previous.unit||'kg',filter:'Semua',progressFilter:'Beban',modal:null,search:'',routineId:'r1',recordId:null,exerciseIndex:0,routines:previous.routines||structuredClone(seed),history:previous.history||[],active:previous.active||null,restUntil:previous.restUntil||0,cardioStartedAt:0,cardioElapsed:previous.cardioElapsed||0,cardioRunning:false,editCategory:'Dada'};
let toastHandle;
function save(){try{localStorage.setItem('forgefit-ui-demo-v3',JSON.stringify({theme:s.theme,animations:s.animations,restDefault:s.restDefault,unit:s.unit,customCatalog:catalog.slice(defaultCatalog.length),routines:s.routines,history:s.history,active:s.active,restUntil:s.restUntil,cardioElapsed:s.cardioElapsed}))}catch(e){console.error(e)}}
const val=(id)=>document.getElementById(id)?.value;
function warn(t){toast.innerHTML=`<div class="toast">${esc(t)}</div>`;clearTimeout(toastHandle);toastHandle=setTimeout(()=>toast.innerHTML='',2600)}
function categoryIcon(c){return ({Kardio:'heart',Dada:'dumbbell',Punggung:'chart',Kaki:'leg'})[c]||'dumbbell'}
const idNow=()=> 'id'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const isCardio=n=>catalog.find(e=>e.name===n)?.type==='cardio'||/skipping|running|cycling|walking|plank/i.test(n);
const duration=t=>`${String(Math.floor(Math.max(0,t)/60)).padStart(2,'0')}:${String(Math.max(0,t)%60).padStart(2,'0')}`;
const days=()=>new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'});
const heading=(h,sub='RUANG LATIHAN')=>`<header class="header"><div><div class="eyebrow">${sub}</div><h1>${esc(h)}</h1></div><button class="round" data-act="pengaturan" aria-label="Buka pengaturan">${ico('settings',21)}</button></header>`;
const section=(h,action,label)=>`<div class="section-head"><h2>${esc(h)}</h2>${action?`<button class="link" data-act="${action}">${esc(label||'Lihat semua')} ${ico('right',14)}</button>`:''}</div>`;
const btn=(name,label,cls='secondary',args='')=>`<button class="btn ${cls}" data-act="${name}" ${args}>${label}</button>`;
function routineCard(r){return `<button class="routine-card" data-act="detailRutinitas" data-id="${esc(r.id)}" aria-label="Lihat rincian ${esc(r.name)}"><div class="row"><div class="mark">${ico(categoryIcon(r.category))}</div><div class="grow"><b>${esc(r.name)}</b><p>${esc(r.detail)}</p></div><span class="pill">${r.duration} mnt</span>${ico('right',16)}</div></button>`}
function focusCard(c,desc){return `<button class="tile" data-act="kategori" data-name="${c}"><span class="glyph">${ico(categoryIcon(c))}</span><b>${c}</b><small>${desc}</small></button>`}
function home(){const last=s.history.at(-1),weekly=s.history.filter(h=>Date.now()-h.endedAt<7*864e5).length;return `${heading('Latihan hari ini',esc(days()).toUpperCase())}<section class="card hero" data-act="${s.active?'lanjut':s.routines.length?'mulai':'latihanBebas'}" data-id="${esc(s.routines[0]?.id||'')}" tabindex="0" role="button"><div class="tag"><span class="dot"></span>${s.active?'LATIHAN BELUM SELESAI':'REKOMENDASI LATIHAN'}</div><h2>${esc(s.active?.name||s.routines[0]?.name||'Latihan bebas')}</h2><p>${s.active?'Sesi latihan tersimpan. Lanjutkan pencatatan kapan saja.':'Latihan utama dengan kardio sebagai penutup. Bisa diubah sesuai kebutuhan.'}</p>${btn(s.active?'lanjut':s.routines.length?'mulai':'latihanBebas',''+ico('play')+(s.active?'Lanjutkan latihan':'Mulai latihan'),'block',`data-id="${esc(s.routines[0]?.id||'')}"`)}</section><div class="stats"><section class="card"><button class="card-action" data-act="ringkasan"><div class="eyebrow">7 HARI TERAKHIR</div><div class="big">${weekly}</div><div class="muted">Sesi selesai · ketuk detail</div></button></section><section class="card"><button class="card-action" data-act="riwayat"><div class="eyebrow">TOTAL LATIHAN</div><div class="big">${s.history.length}</div><div class="muted">Buka riwayat latihan</div></button></section></div>${section('Fokus latihan','semuaLatihan','Semua rutinitas')}<div class="tiles">${focusCard('Kardio','Intensitas dan ketahanan')}${focusCard('Dada','Latihan dorong')}${focusCard('Punggung','Latihan tarik')}${focusCard('Kaki','Latihan tubuh bawah')}</div>${section('Rutinitas pilihan','semuaLatihan','Lihat semua')}${s.routines.slice(0,2).map(routineCard).join('')}${section('Aktivitas terakhir','riwayat','Riwayat')}${last?historyCard(last):`<div class="hint">Belum ada sesi selesai. Data pada prototype ini hanya simulasi lokal.</div>`}`}
function train(){const arr=s.routines.filter(r=>s.filter==='Semua'||r.category===s.filter);return `${heading('Rutinitas latihan','PILIH DAN KELOLA')}${s.active?btn('lanjut',`${ico('play')}Lanjutkan ${esc(s.active.name)}`,'block')+'<div style="height:12px"></div>':''}<div class="chips">${['Semua','Kardio','Dada','Punggung','Kaki'].map(n=>`<button class="chip ${s.filter===n?'active':''}" data-act="filter" data-name="${n}">${n}</button>`).join('')}</div>${section(s.filter==='Semua'?'Semua rutinitas':`Rutinitas ${s.filter}`,'buatRutinitas','Tambah baru')}${arr.length?arr.map(routineCard).join(''):'<div class="empty card">Belum ada rutinitas untuk kategori ini. Buat rutinitas baru untuk memulai.</div>'}${btn('latihanBebas',`${ico('plus')} Mulai latihan bebas`,'outline block')}${section('Daftar gerakan','daftarGerakan','Buka daftar')}<div class="hint">Ketuk kotak rutinitas untuk melihat rincian, mengedit gerakan, mengatur urutan, atau memulai latihan.</div>`}
function back(to='latihan'){return `<div class="backbar">${btn('pindah',`${ico('back')} Kembali`,'secondary small',`data-page="${to}"`)}</div>`}
function detail(){const r=s.routines.find(r=>r.id===s.routineId);if(!r)return train();return `${back()}${heading(r.name,'RINCIAN RUTINITAS')}<div class="card"><div class="row"><div><div class="eyebrow">FOKUS</div><div style="font-weight:800;margin-top:7px">${r.category}</div></div><span class="pill">± ${r.duration} menit</span></div><p class="muted">${esc(r.detail)}</p><div class="actions">${btn('editRutinitas',`${ico('edit')} Ubah`,'secondary')}${btn('hapusRutinitas',`${ico('trash')} Hapus`,'outline')}</div></div>${section(`Daftar gerakan (${r.exercises.length})`,'editRutinitas','Atur gerakan')}<div class="card">${r.exercises.map((n,i)=>`<button class="list-row" data-act="detailGerakan" data-name="${esc(n)}"><span class="pill">${i+1}</span><span class="grow"><b>${esc(n)}</b><small>${isCardio(n)?'Kardio · durasi / intensitas':'Latihan beban · set / repetisi'}</small></span>${ico('right')}</button>`).join('')||'<p class="muted">Rutinitas ini belum memiliki gerakan.</p>'}</div>${btn('mulai',`${ico('play')} Siapkan rutinitas ini`,'block',`data-id="${esc(r.id)}"`)}`}
function createSession(r){
  if(s.active){warn('Masih ada sesi tersimpan. Lanjutkan atau akhiri dahulu.');s.page='aktif';draw();return}
  s.active={id:idNow(),routineId:r.id||null,name:r.name,startedAt:0,phase:'prepare',exerciseIndex:0,setIndex:0,restUntil:0,
    exercises:r.exercises.map(n=>({name:n,type:isCardio(n)?'cardio':'strength',
      sets:isCardio(n)?[]:Array.from({length:3},()=>({weight:20,reps:10,done:false})),
      minutes:10,intensity:5,done:false,seconds:0,running:false,startedAt:0}))};
  s.page='aktif';s.restUntil=0;save();draw();
}
function guidedListItem(e,i,a){
  const done=ForgeFitGuided.finished(e),current=i===a.exerciseIndex&&a.phase!=='complete';
  const description=e.type==='cardio'?`${e.minutes} menit · RPE ${e.intensity}/10`:`${e.sets.filter(x=>x.done).length}/${e.sets.length} set`;
  const inner=`<span class="guided-index ${done?'locked':current?'now':''}">${done?ico('check'):i+1}</span>
  <span class="grow"><b>${esc(e.name)}</b><small>${esc(description)} · ${done?'Terkunci':current?'Saat ini':'Berikutnya'}</small></span>
  ${done?ico('check',17):ico(current?'play':'right',17)}`;
  return done?`<div class="guided-list-item completed">${inner}</div>`:
    `<button class="guided-list-item ${current?'current':''}" data-act="guidedQueue" data-ex="${i}">${inner}</button>`;
}
function guidedDock(a,c){
  const states={
    prepare:['SIAP MULAI',c?'Mulai latihan':'Tambahkan gerakan','guidedStart','play','Belum ada checklist sebelum Start.'],
    working:['AKTIF',c?.exercise.type==='cardio'?'Selesaikan kardio':'Selesaikan set '+(c.setIndex+1),'guidedComplete','check','Selesai → otomatis istirahat → langkah berikutnya.'],
    rest:['ISTIRAHAT','Lewati istirahat','guidedSkip','right','Timer akan lanjut otomatis setelah selesai.'],
    complete:['TUNTAS','Simpan hasil latihan','guidedFinish','save','Progress selesai terkunci.']
  };
  const [heading,label,action,icon,hint]=states[a.phase];
  return `<aside class="guided-dock"><div class="row"><span class="eyebrow">${heading}</span>
    <b>${a.phase==='rest'?'<span id="restClock">00:00</span>':esc(c?.exercise.name||'ForgeFit')}</b></div>
    ${btn(action,`${ico(icon)} ${esc(label)}`,'block',a.phase==='prepare'&&!c?'disabled':'')}<p>${hint}</p></aside>`;
}
function active(){
  const a=ForgeFitGuided.ensure(s.active);if(!a)return train();
  const G=ForgeFitGuided,c=G.current(a),count=G.count(a),done=G.doneCount(a);
  let focus='';
  if(a.phase==='complete')focus=`<section class="card guided-focus"><div class="guided-kicker">SESI TUNTAS</div><h2>Semua langkah selesai</h2><p>${done} langkah tercatat. Hasil yang sudah selesai terkunci.</p></section>`;
  else if(!c)focus=`<section class="card guided-focus"><h2>Belum ada gerakan</h2><p>Tambahkan gerakan untuk memulai latihan bebas.</p>${btn('tambahGerakan',`${ico('plus')} Tambah gerakan`,'secondary block')}</section>`;
  else if(a.phase==='rest')focus=`<section class="card guided-focus rest-mode"><div class="guided-kicker">ISTIRAHAT OTOMATIS</div><h2>${esc(c.exercise.name)}</h2>
    <div id="guidedRestClock" class="guided-countdown">00:00</div><p>Set sebelumnya selesai dan terkunci. Timer akan mengantar ke langkah berikutnya.</p>
    <div class="actions">${btn('guidedRestPlus','+15 detik','secondary')}${btn('guidedSkip','Lewati istirahat','outline')}</div></section>`;
  else{
    const e=c.exercise,isCardio=e.type==='cardio';
    focus=`<section class="card guided-focus ${a.phase==='working'?'focus-active':''}">
    <div class="row"><span class="guided-kicker">${a.phase==='prepare'?'PERSIAPAN GERAKAN':'SEDANG DIKERJAKAN'}</span><span class="pill">${isCardio?'KARDIO':'SET '+(c.setIndex+1)+'/'+e.sets.length}</span></div>
    <h2>${esc(e.name)}</h2>
    <div class="guided-target">${isCardio?`<div><small>TARGET</small><strong>${e.minutes} menit</strong></div><div><small>INTENSITAS</small><strong>${e.intensity}/10</strong></div>`:
      `<div><small>BEBAN</small><strong>${s.unit==='lb'?Math.round(c.set.weight*2.20462*10)/10:c.set.weight} ${esc(s.unit)}</strong></div><div><small>REPETISI</small><strong>${c.set.reps} reps</strong></div>`}</div>
    ${isCardio&&a.phase==='working'?`<div id="guidedCardioClock" class="guided-cardio-clock">00:00</div>
      ${btn('guidedCardioToggle',e.running?'Pause timer':'Lanjutkan timer','secondary block')}`:''}
    <p>${a.phase==='prepare'?'Periksa target sebelum menekan Start.':'Set yang sudah selesai tidak punya kontrol edit.'}</p>
    ${btn('guidedTune',`${ico('settings')} Tuning latihan`,'outline block')}</section>`;
  }
  return `${back('beranda')}${heading(a.name,'GUIDED WORKOUT')}
    <section class="card"><div class="row"><div><div class="eyebrow">DURASI SESI</div><div class="timer" id="sessionClock">${a.startedAt?'00:00':'Belum mulai'}</div></div>
    <div style="text-align:right"><div class="eyebrow">PROGRES</div><div class="timer">${done}/${count}</div></div></div>
    <div class="progress-track"><div class="progress-fill" style="width:${count?Math.round(done/count*100):0}%"></div></div></section>
    ${focus}${section('Urutan gerakan')}
    <div class="guided-list">${a.exercises.map((e,i)=>guidedListItem(e,i,a)).join('')}</div>
    ${a.phase!=='complete'?btn('tambahGerakan',`${ico('plus')} Tambah gerakan berikutnya`,'outline block'):''}
    <div class="guided-early">${btn('selesai','Akhiri sesi lebih awal','secondary small')}</div>
    ${a.phase==='complete'||c?guidedDock(a,c):''}`;
}
function guidedModal(){
  const a=ForgeFitGuided.ensure(s.active),G=ForgeFitGuided;if(!a){dismiss();return}
  if(s.modal==='guidedQueue'){
    const e=a.exercises[s.tuneIndex];if(!e){dismiss();return}
    const done=G.finished(e);
    modal('Rincian gerakan',`<p><b>${esc(e.name)}</b></p><p>${done?'Selesai. Hasil terkunci.':e.type==='cardio'?`Target ${e.minutes} menit · intensitas ${e.intensity}/10`:`${e.sets.length} set direncanakan`}</p>`,
      done?btn('tutup','Kembali','block'):`<div class="actions">${btn('tutup','Kembali','secondary')}${btn('guidedTune','Tuning','secondary')}</div>`);
    return;
  }
  let ix=s.tuneIndex??a.exerciseIndex;
  if(ix<a.exerciseIndex||G.finished(a.exercises[ix]))ix=a.exercises.findIndex((e,j)=>j>=a.exerciseIndex&&!G.finished(e));
  s.tuneIndex=ix;
  const e=a.exercises[ix];
  if(!e){modal('Tuning',`<p>Semua gerakan telah selesai dan tidak dapat diedit.</p>`,btn('tutup','Tutup','block'));return}
  const choices=a.exercises.map((x,i)=>i>=a.exerciseIndex&&!G.finished(x)?
    `<button class="chip ${ix===i?'active':''}" data-act="guidedTuneTarget" data-ex="${i}">${esc(x.name)}</button>`:'').join('');
  const fields=e.type==='cardio'?f('guidedMinutes','Target menit',e.minutes,'number','min="1" max="300"')+
    select('guidedIntensity','Intensitas 1–10',Array.from({length:10},(_,j)=>String(j+1)),String(e.intensity)):
    e.sets.map((set,j)=>set.done||(ix===a.exerciseIndex&&j<a.setIndex)?'':
      `<div class="guided-tune-set"><b>Set ${j+1}</b>${f('gw'+j,'Beban ('+s.unit+')',s.unit==='lb'?Math.round(set.weight*2.20462*10)/10:set.weight,'number','min="0" step="0.5"')}
      ${f('gr'+j,'Repetisi',set.reps,'number','min="0" max="999"')}</div>`).join('')+
      `<div class="actions">${btn('guidedMoreSet','+ Set','secondary')}${btn('guidedLessSet','− Set terakhir','outline')}</div>`;
  modal('Tuning latihan',`<p>Hanya set saat ini dan langkah berikutnya yang dapat diubah. Set selesai tidak ditampilkan di form.</p>
    <div class="chips">${choices}</div>${fields}
    ${f('guidedRest','Istirahat berikutnya (detik)',s.restDefault,'number','min="0" max="600"')}
    <div class="hint">OK kembali ke langkah yang sama. Timer berjalan tidak di-reset.</div>`,
    `<div class="actions">${btn('tutup','Batal','secondary')}${btn('guidedSaveTune','OK · Lanjutkan')}</div>`);
}
function guidedAction(name,node){
  if(!name.startsWith('guided'))return false;
  const a=ForgeFitGuided.ensure(s.active),G=ForgeFitGuided;
  if(!a){warn('Tidak ada sesi aktif');return true}
  switch(name){
    case 'guidedStart':if(G.start(a)){draw();warn('Latihan dimulai')}break;
    case 'guidedComplete':if(G.complete(a,s.restDefault)){draw();warn(a.phase==='rest'?'Set selesai, istirahat dimulai':'Langkah selesai')}break;
    case 'guidedSkip':if(G.skipRest(a))draw();break;
    case 'guidedRestPlus':if(a.phase==='rest'){a.restUntil+=15000;draw()}break;
    case 'guidedQueue':s.tuneIndex=Number(node.dataset.ex);s.modal='guidedQueue';renderModal();break;
    case 'guidedTune':if(s.modal!=='guidedQueue')s.tuneIndex=a.exerciseIndex;s.modal='guidedTune';renderModal();break;
    case 'guidedTuneTarget':s.tuneIndex=Number(node.dataset.ex);renderModal();break;
    case 'guidedMoreSet':if(G.resizeSets(a,s.tuneIndex,1))renderModal();else warn('Set terkunci tidak dapat dihapus');break;
    case 'guidedLessSet':if(G.resizeSets(a,s.tuneIndex,-1))renderModal();else warn('Set selesai atau aktif tidak bisa dihapus');break;
    case 'guidedCardioToggle':{const c=G.current(a);if(c?.exercise.running)G.pauseCardio(a);else G.playCardio(a);draw();break}
    case 'guidedSaveTune':{
      const ix=s.tuneIndex,e=a.exercises[ix];if(!e)break;
      const rest=Number(val('guidedRest'));if(Number.isFinite(rest))s.restDefault=Math.max(0,Math.min(600,Math.round(rest)));
      if(e.type==='cardio')G.tune(a,ix,{minutes:Number(val('guidedMinutes')),intensity:Number(val('guidedIntensity'))});
      else G.tune(a,ix,{sets:e.sets.map((x,j)=>({
        weight:val('gw'+j)===undefined?NaN:s.unit==='lb'?Number(val('gw'+j))/2.20462:Number(val('gw'+j)),
        reps:val('gr'+j)===undefined?NaN:Number(val('gr'+j))
      }))});
      dismiss();draw();warn('Tuning tersimpan, langkah tetap sama');break;
    }
    case 'guidedFinish':s.modal='selesai';renderModal();break;
  }
  save();return true;
}
function historyCard(h){return `<button class="routine-card" data-act="detailRiwayat" data-id="${esc(h.id)}"><div class="row"><div class="mark">${ico('history')}</div><div class="grow"><b>${esc(h.name)}</b><p>${new Date(h.endedAt).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})} · ${h.minutes} menit · ${h.completed} catatan</p></div>${ico('right')}</div></button>`}
function progress(){const count=s.history.length,total=s.history.reduce((sum,h)=>sum+h.completed,0);return `${heading('Perkembangan','RIWAYAT DAN HASIL')}<div class="chips">${['Beban','Kardio'].map(n=>`<button class="chip ${s.progressFilter===n?'active':''}" data-act="filterProgres" data-name="${n}">${n}</button>`).join('')}</div><div class="card"><button class="card-action" data-act="infoGrafik"><div class="row"><div><div class="eyebrow">${s.progressFilter==='Beban'?'SET TERCATAT':'LATIHAN KARDIO'}</div><div class="big">${s.progressFilter==='Beban'?total:s.history.reduce((x,h)=>x+h.exercises.filter(e=>e.type==='cardio'&&e.done).length,0)} <span class="muted">${s.progressFilter==='Beban'?'set':'sesi'}</span></div></div><span class="pill">SIMULASI</span></div><svg class="chart" viewBox="0 0 330 145" preserveAspectRatio="none" role="img" aria-label="Grafik ilustrasi"><path class="grid" d="M8 30H322M8 70H322M8 108H322"/><path class="area" d="M10 120 L60 111 L110 99 L160 102 L210 80 L260 62 L320 38 L320 128 L10 128Z"/><path class="line" d="M10 120 L60 111 L110 99 L160 102 L210 80 L260 62 L320 38"/><text x="12" y="143">P1</text><text x="105" y="143">P3</text><text x="208" y="143">P5</text><text x="305" y="143">P7</text></svg><span class="muted">Ilustrasi grafik. Ketuk untuk penjelasan perhitungan.</span></button></div><div class="stats"><section class="card"><button class="card-action" data-act="ringkasan"><div class="eyebrow">SESI SELESAI</div><div class="big">${count}</div><div class="muted">Lihat ringkasan</div></button></section><section class="card"><button class="card-action" data-act="riwayat"><div class="eyebrow">CATATAN TOTAL</div><div class="big">${total}</div><div class="muted">Lihat riwayat</div></button></section></div>${section('Riwayat latihan','riwayat','Semua riwayat')}${s.history.length?s.history.slice(-4).reverse().map(historyCard).join(''):`<div class="hint">Belum ada data riwayat. Selesaikan satu sesi latihan untuk melihat hasilnya di sini.</div>`}`}
function allHistory(){return `${back('progres')}${heading('Riwayat latihan','SEMUA SESI')}${s.history.length?s.history.slice().reverse().map(historyCard).join(''):'<div class="empty card">Belum ada riwayat latihan.</div>'}`}
function detailHistory(){const h=s.history.find(x=>x.id===s.recordId);if(!h)return allHistory();return `${back('riwayat')}${heading(h.name,'RINCIAN SESI')}<div class="card"><div class="eyebrow">SELESAI</div><div style="font-size:14px;margin:7px 0">${new Date(h.endedAt).toLocaleString('id-ID')}</div><div class="muted">Durasi ${h.minutes} menit · ${h.completed} catatan selesai</div></div>${h.exercises.map(e=>`<div class="card"><b class="exercise-name">${esc(e.name)}</b><div class="muted">${e.type==='cardio'?`${e.minutes} menit · intensitas ${e.intensity}/10 · ${e.done?'selesai':'belum selesai'}`:`${e.sets.filter(x=>x.done).length} dari ${e.sets.length} set selesai`}</div>${e.type==='strength'?e.sets.map((x,i)=>`<div class="setting"><span class="muted">Set ${i+1}</span><span style="font-size:12px">${x.weight} kg × ${x.reps} ${x.done?'✓':'○'}</span></div>`).join(''):''}</div>`).join('')}${btn('hapusRiwayat',`${ico('trash')} Hapus catatan ini`,'outline block')}`}
function settings(){return `${heading('Pengaturan','SESUAIKAN APLIKASI')}${section('Tampilan')}<div class="card"><div class="eyebrow" style="margin-bottom:10px">TEMA</div><div class="segment">${['gelap','terang','sistem'].map(n=>`<button class="${s.theme===n?'selected':''}" data-act="tema" data-name="${n}">${n.charAt(0).toUpperCase()+n.slice(1)}</button>`).join('')}</div><div class="setting" data-act="animasi" tabindex="0" role="button"><div class="grow"><b>Animasi dan transisi</b><p>Gerakan halus saat berpindah halaman</p></div><button class="switch ${s.animations?'on':''}" data-act="animasi" role="switch" aria-checked="${s.animations}" aria-label="Ubah pengaturan animasi"></button></div></div>${section('Preferensi latihan')}<div class="card"><div class="setting" data-act="pilihIstirahat" tabindex="0" role="button"><div><b>Waktu istirahat</b><p>Hitung mundur setelah menyelesaikan set</p></div>${btn('pilihIstirahat',`${s.restDefault} dtk ${ico('down',13)}`,'secondary small')}</div><div class="setting" data-act="pilihSatuan" tabindex="0" role="button"><div><b>Satuan beban</b><p>Tampilan kilogram atau pon</p></div>${btn('pilihSatuan',s.unit,'secondary small')}</div></div>${section('Penyimpanan dan cadangan')}<div class="card"><div class="setting" data-act="infoLokal" tabindex="0" role="button"><div class="grow"><b>Penyimpanan lokal</b><p>Pengaturan bawaan. Prototype menyimpan simulasi dalam penyimpanan browser, bukan SQLite.</p></div>${btn('infoLokal',ico('info'),'secondary iconbtn')}</div><div class="setting" data-act="infoCadangan" tabindex="0" role="button"><div class="grow"><b>Cadangan GitHub privat</b><p>Fitur pilihan, tidak aktif secara bawaan</p></div>${btn('infoCadangan',ico('right'),'secondary iconbtn')}</div><div class="setting" data-act="aturUlang" tabindex="0" role="button"><div class="grow"><b>Hapus data simulasi</b><p>Atur ulang latihan dan pengaturan dalam prototype</p></div>${btn('aturUlang',ico('trash'),'outline iconbtn')}</div></div><div class="hint">Versi pratinjau antarmuka. Belum ada integrasi cloud, akun, atau SQLite Android.</div>`}
function exercisesPage(){return `${back('latihan')}${heading('Daftar gerakan','PILIH GERAKAN')}${btn('buatGerakan',`${ico('plus')} Tambah gerakan sendiri`,'secondary block')}<div class="field"><label for="search">Cari gerakan</label><input id="search" placeholder="Ketik nama gerakan" value="${esc(s.search)}" data-input="search" autocomplete="off"></div><div id="exerciseResults">${listExercises()}</div>`}
function listExercises(){let filtered=catalog.filter(e=>e.name.toLowerCase().includes(s.search.toLowerCase()));return filtered.map(e=>`<button class="list-row" data-act="detailGerakan" data-name="${esc(e.name)}"><div class="mark">${ico(categoryIcon(e.cat))}</div><span class="grow"><b>${esc(e.name)}</b><small>${esc(e.cat)} · ${e.type==='cardio'?'Kardio':'Latihan beban'}</small></span>${ico('right')}</button>`).join('')||'<p class="empty">Gerakan tidak ditemukan.</p>'}
function draw(){if(s.active)ForgeFitGuided.ensure(s.active);document.body.classList.toggle('guided',s.page==='aktif');let sys=window.matchMedia?.('(prefers-color-scheme: dark)').matches?'gelap':'terang',theme=s.theme==='sistem'?sys:s.theme;document.body.classList.toggle('light',theme==='terang');document.documentElement.classList.toggle('light',theme==='terang');document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='terang'?'#f5f7fa':'#0b1119');document.body.classList.toggle('reduced',!s.animations);let views={beranda:home,latihan:train,rincian:detail,aktif:active,progres:progress,riwayat:allHistory,detailRiwayat:detailHistory,pengaturan:settings,gerakan:exercisesPage};app.innerHTML=(views[s.page]||home)();app.classList.remove('enter');void app.offsetWidth;app.classList.add('enter');renderNav();renderModal();updateClocks();save()}
function renderNav(){nav.style.display=s.page==='aktif'?'none':'';if(s.page==='aktif'){nav.innerHTML='';return}let items=[['beranda','Beranda','home'],['latihan','Latihan','dumbbell'],['progres','Progres','chart'],['pengaturan','Pengaturan','settings']];nav.innerHTML=items.map(([id,label,icon])=>`<button data-act="pindah" data-page="${id}" class="${s.page===id?'active':''}" aria-label="${label}" ${s.page===id?'aria-current="page"':''}>${ico(icon)}<span>${label}</span></button>`).join('')}
function modal(title,content,buttons=''){dialog.innerHTML=`<div class="modal-backdrop" data-act="tutupLuar"><section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="grab"></div><div class="row"><h2>${esc(title)}</h2><button class="btn secondary iconbtn" data-act="tutup" aria-label="Tutup">${ico('close')}</button></div>${content}${buttons}</section></div>`}
function f(id,label,value='',type='text',extra=''){return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}" ${extra}></div>`}
function select(id,label,options,value){return `<div class="field"><label for="${id}">${label}</label><select id="${id}">${options.map(n=>`<option ${n===value?'selected':''}>${esc(n)}</option>`).join('')}</select></div>`}
function renderModal(){if(s.modal==='guidedTune'||s.modal==='guidedQueue'){guidedModal();return}if(!s.modal){dialog.innerHTML='';return}const m=s.modal;if(m==='rutinitasBaru'||m==='rutinitasEdit'){const r=m==='rutinitasEdit'?s.routines.find(x=>x.id===s.routineId):null;modal(r?'Ubah rutinitas':'Rutinitas baru',f('routineName','Nama rutinitas',r?.name||'')+select('routineCat','Kategori utama',['Dada','Punggung','Kaki','Kardio'],r?.category||s.editCategory)+f('routineDuration','Perkiraan durasi (menit)',r?.duration||45,'number','min="1" max="300"')+f('routineDetail','Keterangan singkat',r?.detail||'')+(r?`<p class="muted">Gerakan saat ini: ${r.exercises.length}. Urutan gerakan dapat diubah di bawah.</p><div id="editMoves">${r.exercises.map((n,i)=>`<div class="list-row"><b class="grow">${i+1}. ${esc(n)}</b>${btn('naikGerakan',ico('up'),'secondary iconbtn',`data-i="${i}"`)}${btn('turunGerakan',ico('down'),'secondary iconbtn',`data-i="${i}"`)}${btn('buangGerakan',ico('trash'),'outline iconbtn',`data-i="${i}"`)}</div>`).join('')}</div>${btn('pilihGerakanRutinitas',`${ico('plus')} Tambah gerakan`,'secondary block')}`:'<p class="muted">Setelah membuat rutinitas, pilih “Ubah” untuk mengatur gerakannya.</p>')+`<div class="actions">${btn('tutup','Batal','secondary')}${btn('simpanRutinitas',r?'Simpan perubahan':'Buat rutinitas')}</div>`);return}
if(m==='pilihGerakan'||m==='pilihGerakanRutinitas'){modal('Tambahkan gerakan',`<p>Pilih gerakan yang ingin ditambahkan.</p><div style="max-height:55dvh;overflow:auto">${catalog.map(e=>`<button class="list-row" data-act="pilihGerakanSekarang" data-name="${esc(e.name)}"><span class="grow"><b>${esc(e.name)}</b><small>${esc(e.cat)}</small></span>${ico('plus')}</button>`).join('')}</div>`);return}
if(m==='ubahSesi'){const e=s.active?.exercises[s.exerciseIndex];if(!e){s.modal=null;return}modal('Ubah gerakan',`<p><b>${esc(e.name)}</b></p>${e.type==='cardio'?f('cardioMinutes','Target durasi (menit)',e.minutes,'number','min="1"')+select('cardioIntensity','Intensitas (1 ringan – 10 maksimal)',Array.from({length:10},(_,i)=>String(i+1)),String(e.intensity)):''}<div class="actions">${btn('hapusGerakanSesi',`${ico('trash')} Hapus`,'outline')}${btn('gantiGerakanSesi',`${ico('edit')} Ganti`,'secondary')}</div><div class="actions">${btn('tutup','Batal','secondary')}${btn('simpanGerakanSesi','Simpan')}</div>`);return}
if(m==='pilihPengganti'){modal('Ganti gerakan',`<p>Pilih gerakan pengganti.</p><div style="max-height:55dvh;overflow:auto">${catalog.map(e=>`<button class="list-row" data-act="konfirmasiPengganti" data-name="${esc(e.name)}"><b class="grow">${esc(e.name)}</b>${ico('right')}</button>`).join('')}</div>`);return}
if(m==='selesai'){modal('Selesaikan sesi?',`<p>Latihan akan disimpan ke riwayat simulasi. Data tidak dikirim ke internet.</p>`,`<div class="actions">${btn('tutup','Lanjut latihan','secondary')}${btn('konfirmasiSelesai','Simpan sesi')}</div>`);return}
if(m==='hapusRutinitas'){modal('Hapus rutinitas?',`<p>Rutinitas akan dihapus dari daftar. Riwayat latihan yang sudah selesai tetap ada.</p>`,`<div class="actions">${btn('tutup','Batal','secondary')}${btn('konfirmasiHapusRutinitas','Hapus','danger')}</div>`);return}
if(m==='hapusRiwayat'){modal('Hapus riwayat?',`<p>Catatan sesi yang dipilih akan dihapus dari simulasi ini.</p>`,`<div class="actions">${btn('tutup','Batal','secondary')}${btn('konfirmasiHapusRiwayat','Hapus','danger')}</div>`);return}
if(m==='istirahat'){modal('Atur waktu istirahat',`<p>Pilih durasi bawaan yang digunakan setelah set selesai.</p><div class="actions">${[60,90,120,180].map(n=>btn('setIstirahat',`${n} dtk`,n===s.restDefault?'':'secondary',`data-n="${n}"`)).join('')}</div>`);return}
if(m==='satuan'){modal('Satuan beban',`<p>Nilai internal tetap disimpan dalam kilogram pada simulasi ini.</p><div class="actions">${['kg','lb'].map(n=>btn('setSatuan',n,n===s.unit?'':'secondary',`data-name="${n}"`)).join('')}</div>`);return}
if(m==='cadangan'){modal('Cadangan GitHub privat',`<p>Fitur ini akan bersifat opsional. Setiap pengguna nantinya dapat menghubungkan repository privat miliknya sendiri untuk cadangan terenkripsi.</p><div class="hint">Tidak ada login, token GitHub, atau unggahan data dalam pratinjau ini. Bawaan aplikasi final tetap SQLite lokal.</div>`,btn('tutup','Mengerti','block'));return}
if(m==='lokal'){modal('Penyimpanan lokal',`<p>Pratinjau ini memakai penyimpanan browser hanya agar alur UI bisa dicoba. Saat dipindahkan ke Android native, SQLite/Room menjadi penyimpanan utama.</p>`,btn('tutup','Tutup','block'));return}
if(m==='reset'){modal('Hapus simulasi?',`<p>Semua rutinitas tambahan, catatan, dan perubahan di pratinjau akan dihapus. Tindakan ini tidak mengakses data di luar aplikasi.</p>`,`<div class="actions">${btn('tutup','Batal','secondary')}${btn('konfirmasiReset','Hapus semua','danger')}</div>`);return}
if(m==='grafik'){modal('Tentang grafik',`<p>Grafik yang ditampilkan masih ilustrasi untuk menilai tampilan dan interaksi. Perhitungan progres sebenarnya belum diintegrasikan.</p>`,btn('tutup','Mengerti','block'));return}
if(m==='ringkasan'){const seven=s.history.filter(h=>Date.now()-h.endedAt<7*864e5);modal('Ringkasan latihan',`<div class="card"><div class="big">${seven.length}</div><div class="muted">Sesi selesai dalam 7 hari terakhir</div></div><p>Ketuk “Riwayat” untuk membuka rincian setiap sesi.</p>`,btn('keRiwayat','Buka riwayat','block'));return}
if(m==='gerakan'){const n=s.search;const e=catalog.find(x=>x.name===n);modal(n,`<p>Kategori: ${esc(e?.cat||'Buatan sendiri')}<br>Jenis pencatatan: ${e?.type==='cardio'?'Durasi dan intensitas':'Set, beban, dan repetisi'}.</p><p>Gerakan ini dapat dipilih saat membuat rutinitas atau ketika sesi sedang berlangsung.</p>`,btn('tutup','Tutup','block'));return}
if(m==='gerakanBaru'){modal('Gerakan baru',f('moveName','Nama gerakan')+select('moveCat','Kategori',['Dada','Punggung','Kaki','Kardio','Bahu','Lengan','Inti'],'Dada')+select('moveType','Jenis pencatatan',['Latihan beban','Kardio'],'Latihan beban'),`<div class="actions">${btn('tutup','Batal','secondary')}${btn('simpanGerakan','Tambahkan')}</div>`);return}
}
function updateClocks(){
  const a=s.active;if(!a)return;
  const t=$('#sessionClock');if(t)t.textContent=a.startedAt?duration(Math.floor((Date.now()-a.startedAt)/1000)):'Belum mulai';
  const r=$('#guidedRestClock');if(r)r.textContent=duration(Math.ceil((a.restUntil-Date.now())/1000));
  const d=$('#restClock');if(d)d.textContent=duration(Math.ceil((a.restUntil-Date.now())/1000));
  const c=ForgeFitGuided.current(a),clock=$('#guidedCardioClock');
  if(c&&clock){const e=c.exercise;clock.textContent=duration((e.seconds||0)+(e.running?Math.max(0,Math.floor((Date.now()-e.startedAt)/1000)):0))}
}
function navigate(p){s.page=p;s.modal=null;window.scrollTo(0,0);draw()}
function dismiss(){s.modal=null;renderModal()}
function act(name,node,event){if(guidedAction(name,node,event))return;if(['centangSet','tambahSet','hapusSet','editGerakanSesi','simpanGerakanSesi','hapusGerakanSesi','gantiGerakanSesi','konfirmasiPengganti','tandaKardio','jedaKardio','resetKardio','lewatiIstirahat'].includes(name)){warn('Gunakan Tuning untuk langkah sekarang atau berikutnya');return}const id=node.dataset.id,ex=+node.dataset.ex,set=+node.dataset.set,idx=+node.dataset.i;switch(name){
case 'pindah':navigate(node.dataset.page);break;case 'pengaturan':navigate('pengaturan');break;case 'semuaLatihan':navigate('latihan');break;case 'kategori':s.filter=node.dataset.name;navigate('latihan');break;case 'filter':s.filter=node.dataset.name;draw();break;case 'detailRutinitas':s.routineId=id;navigate('rincian');break;case 'mulai':{const r=s.routines.find(x=>x.id===id)||s.routines[0];if(r)createSession(r);break}case 'lanjut':navigate('aktif');break;case 'latihanBebas':createSession({name:'Latihan bebas',id:null,exercises:[]});break;
case 'buatRutinitas':s.modal='rutinitasBaru';renderModal();break;case 'editRutinitas':s.modal='rutinitasEdit';renderModal();break;
case 'simpanRutinitas':{const n=val('routineName')?.trim(),cat=val('routineCat'),d=val('routineDuration'),desc=val('routineDetail')?.trim();if(!n||n.length<2){warn('Nama rutinitas minimal 2 karakter');break}const mins=Math.min(300,Math.max(1,Number(d)||45));if(s.modal==='rutinitasEdit'){const r=s.routines.find(x=>x.id===s.routineId);if(!r)break;Object.assign(r,{name:n,category:cat,duration:mins,detail:desc||'Rutinitas pribadi'});dismiss();draw();warn('Rutinitas diperbarui')}else{const r={id:idNow(),name:n,category:cat,duration:mins,detail:desc||'Rutinitas pribadi',exercises:[]};s.routines.push(r);s.routineId=r.id;s.filter='Semua';dismiss();navigate('rincian');warn('Rutinitas dibuat. Tambahkan gerakan melalui Ubah.')}break}
case 'naikGerakan':case 'turunGerakan':{const r=s.routines.find(x=>x.id===s.routineId),to=idx+(name==='naikGerakan'?-1:1);if(r&&to>=0&&to<r.exercises.length){[r.exercises[idx],r.exercises[to]]=[r.exercises[to],r.exercises[idx]];save();renderModal()}break}
case 'buangGerakan':{const r=s.routines.find(x=>x.id===s.routineId);if(r){r.exercises.splice(idx,1);save();renderModal()}break}
case 'pilihGerakanRutinitas':s.modal='pilihGerakanRutinitas';renderModal();break;
case 'tambahGerakan':s.modal='pilihGerakan';renderModal();break;
case 'pilihGerakanSekarang':{const n=node.dataset.name;if(s.modal==='pilihGerakanRutinitas'){const r=s.routines.find(x=>x.id===s.routineId);if(r){r.exercises.push(n);s.modal='rutinitasEdit';renderModal();save();warn('Gerakan ditambahkan')}}else if(s.active){s.active.exercises.push({name:n,type:isCardio(n)?'cardio':'strength',sets:isCardio(n)?[]:[{weight:20,reps:10,done:false}],minutes:10,intensity:5,done:false,seconds:0,running:false,startedAt:0});if(s.active.phase==='complete'){s.active.exerciseIndex=s.active.exercises.length-1;s.active.setIndex=0;s.active.phase='prepare'}dismiss();draw();warn('Gerakan ditambahkan')}break}
case 'hapusRutinitas':s.modal='hapusRutinitas';renderModal();break;case 'konfirmasiHapusRutinitas':s.routines=s.routines.filter(x=>x.id!==s.routineId);navigate('latihan');warn('Rutinitas dihapus');break;
case 'centangSet':{const t=s.active?.exercises[ex]?.sets[set];if(t){t.done=!t.done;if(t.done)s.restUntil=Date.now()+s.restDefault*1000;save();draw()}break}
case 'tambahSet':{const e=s.active?.exercises[ex];if(e?.type==='strength'){const last=e.sets.at(-1)||{weight:20,reps:10};e.sets.push({...last,done:false});draw()}break}
case 'hapusSet':{const e=s.active?.exercises[ex];if(e?.sets.length){e.sets.pop();draw();warn('Set terakhir dihapus')}break}
case 'editGerakanSesi':s.exerciseIndex=ex;s.modal='ubahSesi';renderModal();break;
case 'simpanGerakanSesi':{const e=s.active?.exercises[s.exerciseIndex];if(!e)break;if(e.type==='cardio'){e.minutes=Math.max(1,Number(val('cardioMinutes'))||10);e.intensity=Math.min(10,Math.max(1,Number(val('cardioIntensity'))||5))}dismiss();draw();break}
case 'hapusGerakanSesi':s.active?.exercises.splice(s.exerciseIndex,1);dismiss();draw();warn('Gerakan dihapus dari sesi');break;
case 'gantiGerakanSesi':s.modal='pilihPengganti';renderModal();break;
case 'konfirmasiPengganti':{const e=s.active?.exercises[s.exerciseIndex],n=node.dataset.name;if(!e)break;e.name=n;e.type=isCardio(n)?'cardio':'strength';e.done=false;e.sets=e.type==='strength'?[{weight:20,reps:10,done:false}]:[];dismiss();draw();warn('Gerakan diganti');break}
case 'tandaKardio':{const e=s.active?.exercises[ex];if(e){e.done=!e.done;draw()}break}
case 'jedaKardio':{const e=s.active?.exercises[ex];if(!e||e.type!=='cardio')break;if(e.running){e.seconds=(e.seconds||0)+Math.floor((Date.now()-e.startedAt)/1000);e.running=false}else{e.startedAt=Date.now();e.running=true}save();draw();break}
case 'resetKardio':{const e=s.active?.exercises[ex];if(e){e.seconds=0;e.running=false;draw()}break}
case 'lewatiIstirahat':s.restUntil=0;draw();break;
case 'selesai':s.modal='selesai';renderModal();break;
case 'konfirmasiSelesai':{if(!s.active)break;const a=s.active;if(!a.startedAt)a.startedAt=Date.now();a.exercises.forEach(e=>{if(e.running){e.seconds=(e.seconds||0)+Math.floor((Date.now()-e.startedAt)/1000);e.running=false}});const completed=a.exercises.reduce((n,e)=>n+(e.type==='cardio'?Number(e.done):e.sets.filter(t=>t.done).length),0);s.history.push({id:a.id,name:a.name,endedAt:Date.now(),minutes:Math.max(1,Math.ceil((Date.now()-a.startedAt)/6e4)),completed,exercises:structuredClone(a.exercises)});s.active=null;s.cardioRunning=false;s.cardioElapsed=0;s.restUntil=0;navigate('progres');warn('Sesi tercatat di riwayat simulasi');break}
case 'riwayat':navigate('riwayat');break;case 'keRiwayat':navigate('riwayat');break;case 'detailRiwayat':s.recordId=id;navigate('detailRiwayat');break;case 'hapusRiwayat':s.modal='hapusRiwayat';renderModal();break;case 'konfirmasiHapusRiwayat':s.history=s.history.filter(x=>x.id!==s.recordId);navigate('riwayat');warn('Riwayat dihapus');break;
case 'filterProgres':s.progressFilter=node.dataset.name;draw();break;case 'infoGrafik':s.modal='grafik';renderModal();break;case 'ringkasan':s.modal='ringkasan';renderModal();break;
case 'tema':s.theme=node.dataset.name;draw();break;case 'animasi':s.animations=!s.animations;draw();break;case 'pilihIstirahat':s.modal='istirahat';renderModal();break;case 'setIstirahat':s.restDefault=Number(node.dataset.n);dismiss();draw();break;case 'pilihSatuan':s.modal='satuan';renderModal();break;case 'setSatuan':s.unit=node.dataset.name;dismiss();draw();break;case 'infoCadangan':s.modal='cadangan';renderModal();break;case 'infoLokal':s.modal='lokal';renderModal();break;case 'aturUlang':s.modal='reset';renderModal();break;
case 'konfirmasiReset':localStorage.removeItem('forgefit-ui-demo-v3');location.reload();break;
case 'daftarGerakan':navigate('gerakan');break;case 'detailGerakan':s.search=node.dataset.name;s.modal='gerakan';renderModal();break;case 'buatGerakan':s.modal='gerakanBaru';renderModal();break;
case 'simpanGerakan':{const n=val('moveName')?.trim();if(!n||n.length<2){warn('Nama gerakan minimal 2 karakter');break}if(catalog.some(x=>x.name.toLowerCase()===n.toLowerCase())){warn('Gerakan sudah tersedia');break}catalog.push({name:n,cat:val('moveCat'),type:val('moveType')==='Kardio'?'cardio':'strength'});dismiss();draw();warn('Gerakan ditambahkan ke daftar simulasi');break}
case 'tutup':dismiss();break;case 'tutupLuar':if(event.target===node)dismiss();break;
}}
const click=e=>{let node=e.target.closest('[data-act]');if(node){act(node.dataset.act,node,e)}};document.addEventListener('click',click);
document.addEventListener('change',e=>{const n=e.target;if(n.dataset.field&&s.active){const x=s.active.exercises[+n.dataset.ex]?.sets[+n.dataset.set];if(!x)return;let v=Math.max(0,Number(n.value)||0);if(n.dataset.field==='reps')v=Math.floor(v);if(n.dataset.field==='weight'&&s.unit==='lb')v=Math.round(v/2.20462*100)/100;x[n.dataset.field]=v;save()}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button][data-act]')){e.preventDefault();act(e.target.dataset.act,e.target,e)}});
document.addEventListener('input',e=>{if(e.target.dataset.input==='search'){s.search=e.target.value;const results=$('#exerciseResults');if(results)results.innerHTML=listExercises()}});
window.forgeFitBack=()=>{if(s.modal){dismiss();return true}if(s.page==='beranda')return false;const map={aktif:'beranda',rincian:'latihan',riwayat:'progres',detailRiwayat:'riwayat',gerakan:'latihan'};navigate(map[s.page]||'beranda');return true};
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(s.theme==='sistem')draw()});
setInterval(()=>{if(s.active){const rested=s.active.phase==='rest';ForgeFitGuided.ensure(s.active);if(rested&&s.active.phase!=='rest'){draw();warn('Istirahat selesai. Langkah berikutnya siap.')}else updateClocks()}},1000);
draw();
})();
