/* ForgeFit v0.7 Progress UI */
(function(root,factory){const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;root.ForgeFitProgressUI=api;})(typeof globalThis!=="undefined"?globalThis:this,function progressUIFactory(){
 const fmt=(n,d=1)=>Number(n).toLocaleString("id-ID",{maximumFractionDigits:d});
 const date=at=>new Date(at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
 const days=s=>s.progressRange==="7"?7:s.progressRange==="30"?30:Infinity;
 const show=(n,suffix)=>n===null||!Number.isFinite(n)?"Belum ada":fmt(n)+" "+suffix;
 function plot(points,unit,esc){
   const clean=points.filter(x=>Number.isFinite(x.value)&&Number.isFinite(x.at));
   const info=ForgeFitProgress.seriesSvg(clean);
   if(!info)return `<div class="progress-empty-chart"><span aria-hidden="true">◌</span><p>Belum ada data aktual untuk grafik ini.</p></div>`;
   return `<svg viewBox="0 0 340 155" preserveAspectRatio="none" role="img" aria-label="Grafik aktual ${esc(unit)} dari ${clean.length} catatan" class="progress-svg">
      <path class="grid" d="M16 26H324M16 72H324M16 118H324"/><path class="line" d="${info.path}"/>
      ${info.points.map(p=>`<circle class="plot-dot" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="4.5"><title>${esc(date(p.at)+" · "+fmt(p.value)+" "+unit)}</title></circle>`).join("")}
      <text x="16" y="150">${esc(date(clean[0].at))}</text>
      <text x="324" y="150" text-anchor="end">${esc(date(clean[clean.length-1].at))}</text>
    </svg>`;
 }
 function metric(label,value,action,desc="Ketuk untuk detail"){
   return `<button class="progress-metric" data-act="${action}"><span class="eyebrow">${label}</span><strong>${value}</strong><small>${desc}</small></button>`;
 }
 function historyList(s,section,historyCard){
   return `${section("Riwayat latihan","riwayat","Buka semua")}${s.history.length?s.history.slice(-4).reverse().map(historyCard).join(""):`<div class="hint">Belum ada riwayat. Selesaikan satu workout untuk melihat progres.</div>`}`;
 }
 function progress({s,heading,section,historyCard,esc,btn,ico,duration}){
   const P=ForgeFitProgress,d=days(s),sr=P.strength(s.history,d),cr=P.cardio(s.history,d),weights=P.bodyWeight(s.weightLog,d);
   const allWeights=P.bodyWeight(s.weightLog,Infinity),body=s.profile||P.profile({});
   const rangeLabel=s.progressRange==="7"?"7 hari":s.progressRange==="30"?"30 hari":"Semua waktu";
   const subtitle={Beban:"Kekuatan dan volume latihan",Kardio:"Durasi dan intensitas aktual",Tubuh:"Pengukuran dan profil tubuh"}[s.progressFilter];
   const nav=`<div class="progress-filter-bar"><div class="progress-filter-summary"><strong>${esc(s.progressFilter)} · ${esc(rangeLabel)}</strong><small>${esc(subtitle)}</small></div>
     <button class="progress-filter-icon" data-act="bukaFilterProgres" aria-label="Buka filter progres, saat ini ${esc(s.progressFilter)}, ${esc(rangeLabel)}" title="Filter progres">
     <svg class="icon" style="width:23px;height:23px" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="var(--panel)"/><circle cx="15" cy="17" r="2" fill="var(--panel)"/></svg></button></div>`;
   let main="";
   if(s.progressFilter==="Beban"){
     const names=[...new Set(sr.map(x=>x.name))];
     const chosen=names.includes(s.progressExercise)?s.progressExercise:(sr.at(-1)?.name||"");
     const selected=sr.filter(x=>x.name===chosen);
     const trend=selected.filter(x=>x.maxLoadKg!==null).map(x=>({at:x.at,value:x.maxLoadKg}));
     const volume=sr.reduce((a,x)=>a+x.volumeKg,0),count=sr.reduce((a,x)=>a+x.sets,0);
     const loads=selected.filter(x=>x.maxLoadKg!==null).map(x=>x.maxLoadKg);
     const best=loads.length?Math.max(...loads):null;
     main=`<div class="progress-metrics">
       ${metric("SET SELESAI",fmt(count,0),"riwayat","Hanya set yang selesai")}
       ${metric("TOTAL VOLUME",show(volume,"kg"),"infoGrafik","Beban × repetisi")}
       </div>${section("Performa gerakan")}
       ${names.length?`<div class="chips exercise-picks">${names.map(n=>`<button class="chip ${chosen===n?'active':''}" data-act="pilihProgresGerakan" data-name="${esc(n)}">${esc(n)}</button>`).join("")}</div>`:`<div class="hint">Belum ada set selesai pada rentang ini. Selesaikan satu latihan beban dulu.</div>`}
       <div class="card progress-chart-card"><button class="card-action" data-act="infoGrafik">
         <div class="row"><div><span class="eyebrow">BEBAN TERTINGGI PER SESI</span><h2>${esc(chosen||"Belum ada gerakan")}</h2></div>
         <span class="pill">${show(best,"kg")}</span></div>
         ${plot(trend,"kg",esc)}
         <span class="muted">Hanya completed sets. Ketuk untuk metode perhitungan.</span>
       </button></div>
       ${section("Detail pencatatan")}
       ${selected.length?selected.slice().reverse().slice(0,8).map(x=>`<button class="progress-record" data-act="detailRiwayat" data-id="${esc(x.id)}">
          <span><b>${esc(date(x.at))}</b><small>${x.sets} set · Volume ${fmt(x.volumeKg)} kg</small></span>
          <strong>${show(x.maxLoadKg,"kg")}</strong>${ico("right",15)}</button>`).join(""):`<div class="hint">Belum ada catatan untuk gerakan ini.</div>`}`;
   }else if(s.progressFilter==="Kardio"){
     const sec=cr.reduce((n,e)=>n+e.durationSeconds,0),unique=new Set(cr.map(x=>x.id)).size;
     const measured=cr.filter(x=>x.durationSeconds>0),bySession=new Map();
     for(const e of measured){const old=bySession.get(e.id)||{at:e.at,value:0};old.value+=e.durationSeconds/60;bySession.set(e.id,old)}
     const intensities=cr.map(x=>x.intensity).filter(x=>x!==null),names=[...new Set(cr.map(x=>x.name))];
     main=`<div class="progress-metrics">
       ${metric("SESI KARDIO",fmt(unique,0),"riwayat","Dengan kardio selesai")}
       ${metric("DURASI AKTUAL",duration(sec),"infoGrafik","Menit:detik dari timer")}
       </div>
       <div class="card progress-chart-card"><button class="card-action" data-act="infoGrafik">
         <div class="row"><div><span class="eyebrow">DURASI KARDIO PER SESI</span><h2>Waktu bergerak</h2></div><span class="pill">${measured.length} terukur</span></div>
         ${plot([...bySession.values()],"menit",esc)}
         <span class="muted">Target menit tidak dihitung sebagai durasi aktual.</span>
       </button></div>
       <div class="progress-metrics">
       ${metric("GERAKAN SELESAI",fmt(cr.length,0),"riwayat","Cardio yang dicatat")}
       ${metric("RPE TERTINGGI",intensities.length?fmt(Math.max(...intensities),0)+"/10":"Belum ada","infoGrafik","Intensitas terlapor")}
       </div>${section("Jenis kardio")}
       ${names.length?names.map(n=>{
         const rows=cr.filter(x=>x.name===n);
         return `<button class="progress-record" data-act="detailKardio" data-name="${esc(n)}">
           <span><b>${esc(n)}</b><small>${rows.length} catatan · aktual ${duration(rows.reduce((t,x)=>t+x.durationSeconds,0))}</small></span>${ico("right",16)}</button>`;
       }).join(""):`<div class="hint">Belum ada kardio yang diselesaikan. Durasi yang tidak diukur tidak direka.</div>`}`;
   }else{
     const latest=allWeights.at(-1)?.kg??body.weightKg;
     const current=allWeights.at(-1)?.kg??null,previous=allWeights.at(-2)?.kg??null;
     const delta=current!==null&&previous!==null?current-previous:null;
     main=`<div class="progress-metrics">
       ${metric("BERAT BADAN",show(latest,"kg"),"catatBB","Ketuk untuk catat BB")}
       ${metric("TINGGI BADAN",show(body.heightCm,"cm"),"bukaProfil","Ketuk untuk ubah profil")}
       </div>
       <div class="card progress-chart-card"><button class="card-action" data-act="infoGrafik">
         <div class="row"><div><span class="eyebrow">RIWAYAT BERAT BADAN</span><h2>Perubahan BB</h2></div><span class="pill">${weights.length} catatan</span></div>
         ${plot(weights.map(e=>({at:e.at,value:e.kg})),"kg",esc)}
         <span class="muted">Hanya dari pengukuran yang dimasukkan sendiri.</span>
       </button></div>
       <div class="progress-body-actions">
         ${btn("catatBB",`${ico("plus",18)} Catat BB`,"block")}
         ${btn("bukaProfil",`${ico("edit",18)} Edit profil`,"outline block")}</div>
       <div class="card profile-summary"><div class="eyebrow">PROFIL PRIBADI</div>
         <div class="profile-pairs"><span>Jenis kelamin</span><b>${esc(body.sex||"Belum diisi")}</b></div>
         <div class="profile-pairs"><span>Target latihan</span><b>${esc(body.goal)}</b></div>
         <div class="profile-pairs"><span>Selisih dua BB terakhir</span><b>${delta===null?"Butuh 2 catatan":(delta>0?"+":"")+fmt(delta)+" kg"}</b></div>
         <div class="muted">Selisih dua pengukuran, bukan penilaian kesehatan.</div>
       </div>
       ${section("Catatan BB")}
       ${allWeights.length?allWeights.slice().reverse().slice(0,8).map(e=>{
          const i=s.weightLog.findIndex(w=>Number(w.at)===e.at&&Number(w.kg)===e.kg);
          return `<button class="progress-record" data-act="detailBB" data-i="${i}">
            <span><b>${esc(date(e.at))}</b><small>Ketuk untuk lihat atau hapus</small></span>
            <strong>${fmt(e.kg)} kg</strong>${ico("right",15)}</button>`;
       }).join(""):`<div class="hint">Belum ada pengukuran BB. Isi lewat Profil atau Catat BB.</div>`}`;
   }
   return `${heading("Perkembangan","DATA LATIHAN AKTUAL")}${nav}${main}${historyList(s,section,historyCard)}`;
 }
 function settingsProfile({s,section,esc,ico}){
   const p=s.profile||ForgeFitProgress.profile({});
   const bb=p.weightKg===null?"BB belum diisi":fmt(p.weightKg)+" kg";
   const tb=p.heightCm===null?"TB belum diisi":fmt(p.heightCm,0)+" cm";
   return `${section("Profil tubuh","bukaProfil","Ubah")}
     <button class="card profile-settings-card" data-act="bukaProfil">
       <div class="row"><div class="profile-avatar">${ico("weight",24)}</div>
       <div class="grow"><h2>Data pribadi</h2><p>BB, TB, jenis kelamin dan target latihan</p></div>${ico("right",20)}</div>
       <div class="profile-summary-chips"><span>${esc(bb)}</span><span>${esc(tb)}</span><span>${esc(p.goal)}</span></div>
       <small>Opsional · Disimpan hanya di perangkat ini</small>
     </button>`;
 }
 function renderModal({s,modal,f,select,btn,esc}){
   const p=s.profile||ForgeFitProgress.profile({});
   if(s.modal==="profil"){
     modal("Profil tubuh",`<p>Semua kolom opsional. Untuk profil dan progres pribadi.</p>
       ${f("profileWeight","Berat badan (kg)",p.weightKg??"","number",'min="20" max="400" step="0.1" inputmode="decimal"')}
       ${f("profileHeight","Tinggi badan (cm)",p.heightCm??"","number",'min="80" max="250" step="0.1" inputmode="decimal"')}
       ${select("profileSex","Jenis kelamin",["Belum diisi","Laki-laki","Perempuan","Tidak ingin menyebutkan"],p.sex||"Belum diisi")}
       ${select("profileGoal","Target utama",["Menjaga kebugaran","Meningkatkan stamina","Meningkatkan kekuatan","Membangun otot","Mengatur berat badan"],p.goal)}
       <div class="hint">BB baru masuk riwayat jika berbeda dari catatan terakhir. Tidak ada upload data.</div>`,
       `<div class="actions">${btn("tutup","Batal","secondary")}${btn("simpanProfil","Simpan profil")}</div>`);
   }else if(s.modal==="catatBB"){
     const latest=s.weightLog.at(-1)?.kg??p.weightKg??"";
     modal("Catat berat badan",`<p>Catat pengukuran manual dengan waktu sekarang.</p>
       ${f("newWeight","Berat badan (kg)",latest,"number",'min="20" max="400" step="0.1" inputmode="decimal"')}`,
       `<div class="actions">${btn("tutup","Batal","secondary")}${btn("simpanBB","Simpan catatan")}</div>`);
   }else if(s.modal==="detailBB"){
     const e=s.weightLog[s.bodyWeightIndex];
     if(!e){modal("Catatan tidak ditemukan","<p>Data tidak ditemukan.</p>",btn("tutup","Tutup","block"));return}
     modal("Detail pengukuran",`<div class="profile-measurement">${fmt(e.kg)} kg</div>
       <p>${esc(new Date(e.at).toLocaleString("id-ID"))}</p><p>Pengukuran manual, bukan diagnosis kesehatan.</p>`,
       `<div class="actions">${btn("hapusBB","Hapus catatan","outline")}${btn("tutup","Kembali")}</div>`);
   }else if(s.modal==="hapusBB"){
     modal("Hapus catatan BB?",`<p>Pengukuran ini akan dihapus. Riwayat workout tetap aman.</p>`,
       `<div class="actions">${btn("tutup","Batal","secondary")}${btn("konfirmasiHapusBB","Hapus","danger")}</div>`);
   }
 }
 function action(name,node,{s,val,dismiss,draw,renderModal,warn,navigate}){
   const accepted=["bukaProfil","simpanProfil","catatBB","simpanBB","detailBB","hapusBB","konfirmasiHapusBB","pilihProgresGerakan","bukaFilterProgres","draftBagian","draftRentang","resetFilterProgres","terapkanFilterProgres","detailKardio"];
   if(!accepted.includes(name))return false;
   const P=ForgeFitProgress;
   switch(name){
     case "bukaFilterProgres":
       s.filterDraft=s.progressFilter;s.rangeDraft=s.progressRange;s.modal="filterProgres";renderModal();break;
     case "draftBagian":
       if(s.modal==="filterProgres"&&["Beban","Kardio","Tubuh"].includes(node.dataset.name)){s.filterDraft=node.dataset.name;syncFilterOptions(s)}break;
     case "draftRentang":
       if(s.modal==="filterProgres"&&["7","30","all"].includes(node.dataset.name)){s.rangeDraft=node.dataset.name;syncFilterOptions(s)}break;
     case "resetFilterProgres":
       if(s.modal==="filterProgres"){s.filterDraft="Beban";s.rangeDraft="7";syncFilterOptions(s)}break;
     case "terapkanFilterProgres":
       if(s.modal==="filterProgres"){
         s.progressFilter=["Beban","Kardio","Tubuh"].includes(s.filterDraft)?s.filterDraft:s.progressFilter;
         s.progressRange=["7","30","all"].includes(s.rangeDraft)?s.rangeDraft:s.progressRange;
         s.filterDraft=null;s.rangeDraft=null;dismiss();draw();
       }break;
     case "bukaProfil":s.modal="profil";renderModal();break;
     case "simpanProfil":{
       let weight,height;
       try{weight=P.validateOptional(val("profileWeight"),20,400,"BB");height=P.validateOptional(val("profileHeight"),80,250,"TB")}
       catch(e){warn(e.message);return true}
       const prior=s.weightLog.at(-1)?.kg;
       s.profile=P.profile({weightKg:weight,heightCm:height,sex:val("profileSex"),goal:val("profileGoal")});
       if(weight!==null&&prior!==weight)s.weightLog.push({id:"bw"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),at:Date.now(),kg:weight});
       dismiss();draw();warn("Profil tersimpan lokal");break;
     }
     case "catatBB":s.modal="catatBB";renderModal();break;
     case "simpanBB":{
       let kg;
       try{kg=P.validateOptional(val("newWeight"),20,400,"BB");if(kg===null)throw new Error("Isi BB terlebih dahulu")}
       catch(e){warn(e.message);return true}
       const last=s.weightLog.at(-1);
       if(last&&last.kg===kg&&Date.now()-last.at<60000){warn("Catatan BB yang sama baru saja disimpan");return true}
       s.weightLog.push({id:"bw"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),at:Date.now(),kg});
       s.profile={...s.profile,weightKg:kg};s.progressFilter="Tubuh";
       dismiss();navigate("progres");warn("BB tercatat");break;
     }
     case "detailBB":s.bodyWeightIndex=Number(node.dataset.i);s.modal="detailBB";renderModal();break;
     case "hapusBB":s.modal="hapusBB";renderModal();break;
     case "konfirmasiHapusBB":{
       if(Number.isInteger(s.bodyWeightIndex)&&s.bodyWeightIndex>=0&&s.bodyWeightIndex<s.weightLog.length){
         s.weightLog.splice(s.bodyWeightIndex,1);
         s.profile={...s.profile,weightKg:s.weightLog.at(-1)?.kg??null};
       }
       s.bodyWeightIndex=null;dismiss();draw();warn("Catatan BB dihapus");break;
     }
     case "pilihProgresGerakan":s.progressExercise=node.dataset.name;draw();break;
     case "detailKardio":s.cardioDetailName=node.dataset.name;s.modal="kardioDetail";renderModal();break;
   }
   return true;
 }
 // Change only selected radio states. Never rebuild an open bottom sheet.
 function syncFilterOptions(s){
   const sheet=document.querySelector('.progress-filter-sheet');
   if(!sheet||!sheet.querySelectorAll)return;
   sheet.querySelectorAll('.progress-filter-option').forEach(option=>{
     const kind=option.dataset.act;
     const selected=kind==='draftBagian'?option.dataset.name===s.filterDraft:
       kind==='draftRentang'?option.dataset.name===s.rangeDraft:false;
     option.classList.toggle('active',selected);
     option.setAttribute('aria-checked',String(selected));
   });
 }
 function filterModal({s,modal,btn,esc}){
  const selectedSection=s.filterDraft||s.progressFilter,selectedRange=s.rangeDraft||s.progressRange;
  const options=(choices,current,action,name)=>`<div class="progress-filter-options" role="radiogroup" aria-label="${name}">${
    choices.map(([value,label])=>`<button type="button" class="progress-filter-option ${value===current?'active':''}"
      role="radio" aria-checked="${value===current}" data-act="${action}" data-name="${value}">
      <span>${esc(label)}</span><span class="progress-radio" aria-hidden="true"><i></i></span></button>`).join("")
  }</div>`;
  const content=`<div class="progress-filter-body">
    <div class="progress-filter-intro"><span>Atur hasil yang ingin ditampilkan</span><button type="button" data-act="resetFilterProgres">Reset</button></div>
    <div class="progress-filter-group"><h3>Bagian</h3>
      ${options([["Beban","Beban"],["Kardio","Kardio"],["Tubuh","Tubuh"]],selectedSection,"draftBagian","Bagian progres")}</div>
    <div class="progress-filter-group"><h3>Rentang waktu</h3>
      ${options([["7","7 hari terakhir"],["30","30 hari terakhir"],["all","Semua waktu"]],selectedRange,"draftRentang","Rentang progres")}</div></div>`;
  const buttons=`<div class="progress-filter-footer">${btn("terapkanFilterProgres","Terapkan filter","block")}</div>`;
  modal("Filter progres",content,buttons,"progress-filter-sheet");
}
 function cardioModal({s,modal,btn,esc}){
   const n=s.cardioDetailName||"Kardio",rows=ForgeFitProgress.cardio(s.history,days(s)).filter(x=>x.name===n);
   const total=rows.reduce((v,x)=>v+x.durationSeconds,0),minutes=Math.floor(total/60),secs=String(total%60).padStart(2,"0");
   modal("Detail kardio",`<p><b>${esc(n)}</b></p><p>${rows.length} aktivitas selesai dalam rentang pilihan.</p>
     <div class="profile-measurement">${minutes}:${secs} <small>menit:detik</small></div>
     <p>Waktu dari timer yang tercatat, bukan target rencana.</p>`,btn("riwayat","Buka riwayat","block"));
 }
 return {progress,settingsProfile,renderModal,action,cardioModal,filterModal};
});
