const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.join(__dirname,'../app/src/main/assets');
function harness(){
 const blank=()=>({innerHTML:'',textContent:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},offsetWidth:100,setAttribute(){},scrollTop:0});
 const els=new Map(['#app','#nav','#dialog','#toast'].map(k=>[k,blank()])),inputs=new Map(),handlers={},data=new Map();
 let modalWrites=0;const modal=els.get('#dialog');let modalHtml='';
 Object.defineProperty(modal,'innerHTML',{get(){return modalHtml},set(v){modalWrites++;modalHtml=v;}});
 const document={
  querySelector:q=>els.get(q)||inputs.get(q.replace(/^#/,''))||blank(),
  getElementById:id=>inputs.get(id)||null,
  addEventListener:(k,fn)=>handlers[k]=fn,
  body:{classList:{add(){},remove(){},toggle(){}}},documentElement:{classList:{toggle(){}}}
 };
 const window={matchMedia:()=>({matches:true,addEventListener(){}}),scrollTo(){}};
 const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const ctx={document,window,localStorage:storage,console,setInterval(){},setTimeout(){return 1},clearTimeout(){},Date,Math,Intl,structuredClone,location:{reload(){}}};
 for(const name of ['guided.js','progress.js','progress-ui.js','notify.js','app.js'])vm.runInNewContext(fs.readFileSync(path.join(base,name),'utf8'),ctx,{filename:name});
 const click=(act,dataset={})=>{const node={dataset:{act,...dataset}};handlers.click({target:{closest:()=>node}});};
 function mockPicker(scope){
  const clear={hidden:true};
  const search={value:'',dataset:{input:scope+'Search'},parentElement:{querySelector:()=>clear},focus(){}};
  const list={innerHTML:'',dataset:{category:'Semua',visible:'6',pickerAction:scope==='guided'?'guidedChooseExercise':'pilihGerakanSekarang'},scrollTop:42};
  const sel={id:scope+'Category',value:'Semua',dataset:{pickerCategory:scope}};
  const more={hidden:false,innerHTML:''};const count={textContent:''};
  inputs.set(scope+'Search',search);inputs.set(scope+'Results',list);inputs.set(scope+'Category',sel);
  inputs.set(scope+'More',more);inputs.set(scope+'Count',count);
  return {search,list,sel,more,count,clear};
 }
 return {click,mockPicker,inputs,input:n=>handlers.input({target:n}),change:n=>handlers.change({target:n}),
  state:()=>JSON.parse(data.get('forgefit-ui-demo-v3')),html:()=>els.get('#app').innerHTML,
  modal:()=>modalHtml,modalWrites:()=>modalWrites};
}
test('Picker filters in place, resets stale scroll and limits results',()=>{
 const h=harness();h.click('mulai',{id:'r1'});h.click('guidedTune');
 assert.match(h.modal(),/id="guidedCategory"/);assert.match(h.modal(),/id="guidedMore"/);
 const p=h.mockPicker('guided'),before=h.modalWrites();
 p.sel.value='Perut';h.change(p.sel);
 assert.match(p.list.innerHTML,/Cable Crunch/);assert.doesNotMatch(p.list.innerHTML,/Bench Press/);
 assert.equal(p.list.scrollTop,0);assert.match(p.count.textContent,/6 dari 16/);
 assert.equal(h.modalWrites(),before,'Category must not remount sheet');
 p.search.value='hanging';h.input(p.search);
 assert.match(p.list.innerHTML,/Hanging Knee Raise/);
 assert.match(p.list.innerHTML,/Hanging Leg Raise/);
 assert.doesNotMatch(p.list.innerHTML,/Cable Crunch/);
 assert.equal(p.count.textContent,'2 dari 2');assert.equal(p.more.hidden,true);
 assert.equal(h.modalWrites(),before,'Typing must not remount sheet');
 p.search.value='';h.input(p.search);assert.equal(p.clear.hidden,true);
 p.sel.value='Semua';h.change(p.sel);h.click('moreExerciseResults',{scope:'guided'});
 assert.equal(p.list.dataset.visible,'12');assert.match(p.count.textContent,/12 dari/);
});
test('Guided selection gives visible feedback before saving',()=>{
 const h=harness();h.click('mulai',{id:'r1'});h.click('guidedTune');
 const selected={value:'Bench Press',scrollIntoView(){}},type={value:'Beban (set / reps)'},panel={hidden:false},notice={hidden:true,textContent:''};
 h.inputs.set('guidedName',selected);h.inputs.set('guidedRecordingType',type);
 h.inputs.set('guidedSearchPanel',panel);h.inputs.set('guidedPicked',notice);
 h.click('guidedChooseExercise',{name:'Reverse Crunch'});
 assert.equal(selected.value,'Reverse Crunch');assert.equal(panel.hidden,true);
 assert.equal(notice.hidden,false);assert.match(notice.textContent,/Dipilih: Reverse Crunch/);
 assert.equal(h.state().active.exercises[0].name,'Bench Press');
 h.click('guidedSaveTune');assert.equal(h.state().active.exercises[0].name,'Reverse Crunch');
});
test('Progress selected movement uses a visible dropdown',()=>{
 const h=harness();h.click('mulai',{id:'r1'});h.click('guidedStart');
 for(let i=0;i<3;i++){h.click('guidedComplete');h.click('guidedSkip');}
 h.click('guidedStart');h.click('guidedComplete');
 h.click('selesai');h.click('konfirmasiSelesai');
 assert.match(h.html(),/id="progressExerciseSelect"/);
 assert.match(h.html(),/Bench Press/);assert.match(h.html(),/Incline Dumbbell Press/);
 h.change({id:'progressExerciseSelect',value:'Bench Press',dataset:{}});
 assert.equal(h.state().progressExercise,'Bench Press');
 assert.match(h.html(),/<option value="Bench Press" selected>/);
});
