const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const base=path.join(__dirname,"../app/src/main/assets");
function harness(){
  const blank=()=>({innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){},toggle(){}},offsetWidth:100});
  const els=new Map(["#app","#nav","#dialog","#toast"].map(k=>[k,blank()])),handlers={},data=new Map(),inputs=new Map();
  const document={
    querySelector:q=>els.get(q)||{...blank(),setAttribute(){}},
    getElementById:id=>inputs.get(id)||null,
    addEventListener:(k,v)=>handlers[k]=v,
    body:{classList:{toggle(){}}},documentElement:{classList:{toggle(){}}}
  };
  const window={matchMedia:()=>({matches:true,addEventListener(){}}),scrollTo(){}};
  const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  const c={document,window,localStorage:storage,console,setInterval(){},setTimeout(){return 1},clearTimeout(){},Date,Math,Intl,structuredClone,location:{reload(){}}};
  for(const name of ["guided.js","progress.js","progress-ui.js","app.js"]){
    vm.runInNewContext(fs.readFileSync(path.join(base,name),"utf8"),c,{filename:name});
  }
  return {
    click:(act,dataset={})=>{const node={dataset:{act,...dataset}};handlers.click({target:{closest:()=>node}})},
    set:(id,value)=>inputs.set(id,{value:String(value)}),
    state:()=>JSON.parse(data.get("forgefit-ui-demo-v3")),
    html:()=>els.get("#app").innerHTML,
    modal:()=>els.get("#dialog").innerHTML,
    back:()=>window.forgeFitBack(),
    backdrop:()=>{const node={dataset:{act:"tutupLuar"}};node.closest=()=>node;handlers.click({target:node})},
    storage:data
  };
}
test("Progress empty state contains no invented chart, records or profile values",()=>{
 const h=harness();h.click("pindah",{page:"progres"});
 assert.match(h.html(),/Belum ada data aktual/);
 assert.match(h.html(),/0 set|0/);
 assert.doesNotMatch(h.html(),/Grafik ilustrasi/);
 h.click("bukaFilterProgres");h.click("draftBagian",{name:"Tubuh"});h.click("terapkanFilterProgres");
 assert.match(h.html(),/Belum ada pengukuran BB/);
 assert.match(h.html(),/Belum ada/);
});
test("Profile BB/TB/sex/goal stored locally and editable",()=>{
 const h=harness();
 h.click("pindah",{page:"pengaturan"});
 assert.match(h.html(),/Profil tubuh/);
 h.click("bukaProfil");
 h.set("profileWeight","72.5");h.set("profileHeight","175");
 h.set("profileSex","Laki-laki");h.set("profileGoal","Meningkatkan stamina");
 h.click("simpanProfil");
 const p=h.state();
 assert.equal(p.profile.weightKg,72.5);
 assert.equal(p.profile.heightCm,175);
 assert.equal(p.profile.sex,"Laki-laki");
 assert.equal(p.profile.goal,"Meningkatkan stamina");
 assert.equal(p.weightLog.length,1);
 assert.match(h.html(),/72,5 kg/);
 h.click("pindah",{page:"progres"});h.click("bukaFilterProgres");h.click("draftBagian",{name:"Tubuh"});h.click("terapkanFilterProgres");
 assert.match(h.html(),/72,5 kg/);
 assert.match(h.html(),/Laki-laki/);
 assert.match(h.html(),/Meningkatkan stamina/);
});
test("Invalid profile input is rejected and previous data kept",()=>{
 const h=harness();h.click("bukaProfil");
 h.set("profileWeight","900");h.set("profileHeight","180");
 h.set("profileSex","Belum diisi");h.set("profileGoal","Menjaga kebugaran");
 h.click("simpanProfil");
 assert.equal(h.state().profile.weightKg,null);
 assert.equal(h.state().weightLog.length,0);
 assert.match(h.modal(),/Profil tubuh/);
});
test("New measurements appear in body chart and deletion affects body only",()=>{
 const h=harness();h.click("pindah",{page:"progres"});h.click("bukaFilterProgres");h.click("draftBagian",{name:"Tubuh"});h.click("terapkanFilterProgres");
 h.click("catatBB");h.set("newWeight","75");h.click("simpanBB");
 h.click("catatBB");h.set("newWeight","74.5");h.click("simpanBB");
 assert.equal(h.state().weightLog.length,2);
 assert.match(h.html(),/0,5 kg/);
 assert.match(h.html(),/progress-svg/);
 h.click("detailBB",{i:"0"});
 assert.match(h.modal(),/75 kg/);
 h.click("hapusBB");h.click("konfirmasiHapusBB");
 assert.equal(h.state().weightLog.length,1);
 assert.equal(h.state().profile.weightKg,74.5);
 assert.match(h.html(),/74,5 kg/);
});
test("Strength only displays real completed set after saving history",()=>{
 const h=harness();h.click("mulai",{id:"r1"});h.click("guidedStart");h.click("guidedComplete");
 h.click("selesai");h.click("konfirmasiSelesai");
 assert.equal(h.state().history.length,1);
 const page=h.html();
 assert.match(page,/SET SELESAI/);
 assert.match(page,/20 kg/);
 assert.match(page,/200 kg/);
 assert.match(page,/progress-svg/);
 assert.doesNotMatch(page,/Grafik ilustrasi/);
});
test("Cardio target does not masquerade as measured duration",()=>{
 const h=harness();h.click("mulai",{id:"r4"});h.click("guidedStart");h.click("guidedComplete");
 h.click("selesai");h.click("konfirmasiSelesai");h.click("bukaFilterProgres");h.click("draftBagian",{name:"Kardio"});h.click("terapkanFilterProgres");
 assert.match(h.html(),/0:00/);
 assert.match(h.html(),/Belum ada data aktual/);
 assert.doesNotMatch(h.html(),/10:00/);
 h.click("detailKardio",{name:"Skipping Intervals"});
 assert.match(h.modal(),/Waktu dari timer/);
});
test("Range and exercise tabs are interactive and stored",()=>{
 const h=harness();h.click("pindah",{page:"progres"});
 h.click("bukaFilterProgres");h.click("draftRentang",{name:"7"});h.click("terapkanFilterProgres");assert.equal(h.state().progressRange,"7");
 h.click("bukaFilterProgres");h.click("draftBagian",{name:"Kardio"});h.click("terapkanFilterProgres");assert.equal(h.state().progressFilter,"Kardio");
 h.click("bukaFilterProgres");h.click("draftRentang",{name:"all"});h.click("terapkanFilterProgres");assert.equal(h.state().progressRange,"all");
});

test("Finishing workout selects relevant progress tab even after viewing Body",()=>{
 const h=harness();
 h.click("pindah",{page:"progres"});
 h.click("bukaFilterProgres");h.click("draftBagian",{name:"Tubuh"});h.click("terapkanFilterProgres");
 h.click("pindah",{page:"beranda"});
 h.click("mulai",{id:"r1"});h.click("guidedStart");h.click("guidedComplete");
 h.click("selesai");h.click("konfirmasiSelesai");
 assert.equal(h.state().progressFilter,"Beban");
 assert.match(h.html(),/BEBAN TERTINGGI PER SESI/);
});
test("Cardio-only workout opens Cardio progress",()=>{
 const h=harness();h.click("mulai",{id:"r4"});h.click("guidedStart");h.click("guidedComplete");
 h.click("selesai");h.click("konfirmasiSelesai");
 assert.equal(h.state().progressFilter,"Kardio");
 assert.match(h.html(),/DURASI AKTUAL/);
});

test("Filter icon is the only filter control; default is Beban / 7 hari",()=>{
 const h=harness();h.click("pindah",{page:"progres"});
 assert.equal(h.state().progressFilter,"Beban");
 assert.equal(h.state().progressRange,"7");
 assert.match(h.html(),/progress-filter-icon/);
 assert.match(h.html(),/Beban · 7 hari/);
 assert.doesNotMatch(h.html(),/data-act="filterProgres"/);
 assert.doesNotMatch(h.html(),/data-act="rentangProgres"/);
 h.click("bukaFilterProgres");
 assert.match(h.modal(),/progress-filter-sheet/);
 assert.match(h.modal(),/Filter progres/);
 assert.match(h.modal(),/Terapkan filter/);
});
test("Filter choices are drafts until applied, canceled drafts are discarded",()=>{
 const h=harness();h.click("pindah",{page:"progres"});
 h.click("bukaFilterProgres");h.click("draftBagian",{name:"Kardio"});h.click("draftRentang",{name:"30"});
 assert.equal(h.state().progressFilter,"Beban");assert.equal(h.state().progressRange,"7");
 h.click("tutup");assert.equal(h.modal(),"");
 h.click("bukaFilterProgres");h.click("draftBagian",{name:"Tubuh"});h.click("draftRentang",{name:"all"});
 h.click("terapkanFilterProgres");
 assert.equal(h.state().progressFilter,"Tubuh");assert.equal(h.state().progressRange,"all");
 assert.match(h.html(),/Tubuh · Semua waktu/);
});
test("Filter Reset changes draft only; backdrop and Android Back leave active values unchanged",()=>{
 const h=harness();h.click("pindah",{page:"progres"});
 h.click("bukaFilterProgres");h.click("draftBagian",{name:"Kardio"});h.click("draftRentang",{name:"30"});h.click("terapkanFilterProgres");
 assert.equal(h.state().progressFilter,"Kardio");assert.equal(h.state().progressRange,"30");
 h.click("bukaFilterProgres");h.click("resetFilterProgres");
 assert.equal(h.state().progressFilter,"Kardio");assert.equal(h.state().progressRange,"30");
 h.backdrop();assert.equal(h.modal(),"");
 h.click("bukaFilterProgres");h.click("draftBagian",{name:"Tubuh"});h.back();
 assert.equal(h.modal(),"");assert.equal(h.state().progressFilter,"Kardio");
 h.click("bukaFilterProgres");h.click("resetFilterProgres");h.click("terapkanFilterProgres");
 assert.equal(h.state().progressFilter,"Beban");assert.equal(h.state().progressRange,"7");
});
