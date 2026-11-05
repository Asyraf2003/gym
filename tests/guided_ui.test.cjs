const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.join(__dirname,'../app/src/main/assets');
function harness(){
 const el=()=>({innerHTML:'',classList:{add(){},remove(){},toggle(){}},offsetWidth:100,style:{},textContent:''});
 const els=new Map(['#app','#nav','#dialog','#toast'].map(x=>[x,el()])),handlers={},data=new Map(),inputs=new Map();
 const document={querySelector:q=>els.get(q)||{...el(),setAttribute(){}},getElementById:id=>inputs.get(id)||null,addEventListener:(k,v)=>handlers[k]=v,body:{classList:{add(){},remove(){},toggle(){}}},documentElement:{classList:{toggle(){}}}};
 const window={matchMedia:()=>({matches:true,addEventListener(){}}),scrollTo(){}},localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const ctx={window,document,localStorage,console,setInterval(){},setTimeout(){return 1},clearTimeout(){},Date,Math,structuredClone,location:{reload(){}}};
 for(const file of ['guided.js','progress.js','progress-ui.js','notify.js','recommend.js','app.js'])vm.runInNewContext(fs.readFileSync(path.join(base,file),'utf8'),ctx,{filename:file});
 return {click:(name,ds={})=>{const node={dataset:{act:name,...ds}};handlers.click({target:{closest:()=>node}})},state:()=>JSON.parse(data.get('forgefit-ui-demo-v3')),html:()=>els.get('#app').innerHTML,modal:()=>els.get('#dialog').innerHTML,setInput:(k,v)=>inputs.set(k,{value:v})};
}
test('UI: preparation, single-step completion, automatic rest and immutable past',()=>{
 const h=harness();h.click('mulai',{id:'r1'});
 assert.equal(h.state().active.phase,'prepare');assert.match(h.html(),/guidedStart/);assert.doesNotMatch(h.html(),/data-act="guidedComplete"/);
 h.click('guidedStart');h.click('guidedComplete');
 assert.equal(h.state().active.phase,'rest');assert.equal(h.state().active.exercises[0].sets[0].done,true);
 h.click('guidedTune');assert.doesNotMatch(h.modal(),/id="gw0"/);assert.match(h.modal(),/id="gw1"/);
 h.setInput('gw1','22.5');h.setInput('gr1','12');h.setInput('guidedRest','60');h.click('guidedSaveTune');
 assert.equal(h.state().active.exercises[0].sets[0].weight,20);assert.equal(h.state().active.exercises[0].sets[1].weight,22.5);
 assert.equal(h.state().active.phase,'rest');h.click('guidedSkip');assert.equal(h.state().active.setIndex,1);
 h.click('guidedComplete');h.click('guidedSkip');h.click('guidedComplete');h.click('guidedSkip');
 assert.equal(h.state().active.exerciseIndex,1);assert.equal(h.state().active.phase,'prepare');assert.match(h.html(),/Terkunci/);
 h.click('selesai');h.click('konfirmasiSelesai');assert.equal(h.state().active,null);assert.equal(h.state().history.length,1);
});
test('UI: cardio requires Start and finishes without a second checkbox',()=>{
 const h=harness();h.click('mulai',{id:'r4'});h.click('guidedStart');
 assert.equal(h.state().active.exercises[0].running,true);
 h.click('guidedComplete');h.click('guidedSkip');assert.equal(h.state().active.phase,'prepare');
 h.click('guidedStart');h.click('guidedComplete');assert.equal(h.state().active.phase,'complete');
 h.click('guidedFinish');h.click('konfirmasiSelesai');assert.equal(h.state().history.length,1);
});
test('UI: free workout can add its first exercise',()=>{
 const h=harness();h.click('latihanBebas');h.click('tambahGerakan');h.click('pilihGerakanSekarang',{name:'Bench Press'});
 assert.match(h.html(),/guidedStart/);h.click('guidedStart');assert.equal(h.state().active.phase,'working');
});
test('UI: current version is visible and opens about modal',()=>{
 const h=harness();
 h.click("pindah",{page:"pengaturan"});
 assert.match(h.html(),/v0\.10\.0-preview/);
 h.click('infoVersi');
 assert.match(h.modal(),/ForgeFit v0\.10\.0-preview/);
 h.click('tutup');
 assert.equal(h.modal(),'');
});

test('UI: edit exercise name in Tuning without changing completed records',()=>{
 const h=harness();h.click('mulai',{id:'r1'});h.click('guidedTune');
 assert.match(h.modal(),/id="guidedName"/);
 assert.match(h.modal(),/data-act="guidedToggleSearch"/);
 assert.match(h.modal(),/id="guidedRecordingType"/);
 h.setInput('guidedName','Incline Barbell Press');
 h.setInput('guidedRecordingType','Beban (set / reps)');
 h.click('guidedSaveTune');
 assert.equal(h.state().active.exercises[0].name,'Incline Barbell Press');
 assert.equal(h.state().active.phase,'prepare');
 h.click('guidedStart');h.click('guidedComplete');h.click('guidedSkip');
 h.click('guidedTune');
 h.setInput('guidedName','Cable Crunch');
 h.setInput('guidedRecordingType','Beban (set / reps)');
 h.click('guidedSaveTune');
 const exercises=h.state().active.exercises;
 assert.equal(exercises[0].name,'Incline Barbell Press');
 assert.equal(exercises[0].sets.length,1);
 assert.equal(exercises[0].sets[0].done,true);
 assert.equal(exercises[1].name,'Cable Crunch');
 assert.equal(h.state().active.phase,'prepare');
});
test('UI: searchable exercise choices include core/cardio and category filters',()=>{
 const h=harness();
 h.click('pindah',{page:'latihan'});
 assert.match(h.html(),/data-act="cariGerakan"/);
 assert.match(h.html(),/Perut/);
 h.click('cariGerakan');assert.match(h.html(),/id="search"/);
 h.click('pindah',{page:'latihan'});
 h.click('latihanBebas');h.click('tambahGerakan');
 assert.match(h.modal(),/id="pickerSearch"/);
 assert.match(h.modal(),/<option value="Perut">Perut<\/option>/);
 assert.match(h.modal(),/Bench Press/);
 assert.match(h.modal(),/id="pickerMore"/);
 assert.match(h.modal(),/id="pickerCount"/);
 h.click('pilihGerakanSekarang',{name:'Cable Crunch'});
 assert.equal(h.state().active.exercises[0].name,'Cable Crunch');
});
test('UI: Tuning search picker offers options without leaving the editor',()=>{
 const h=harness();h.click('mulai',{id:'r3'});
 h.click('guidedTune');assert.match(h.modal(),/data-act="guidedToggleSearch"/);
 assert.match(h.modal(),/data-act="guidedChooseExercise"/);
 assert.match(h.modal(),/id="guidedSearch"/);
});
