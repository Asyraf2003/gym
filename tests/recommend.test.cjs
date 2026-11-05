const {test}=require('node:test'); const assert=require('node:assert/strict');
const {recommend,readSessions}=require('../app/src/main/assets/recommend.js');
const H=3600000,now=Date.UTC(2026,10,5,12);const routines=[{id:'d',name:'Dada',category:'Dada'},{id:'p',name:'Punggung',category:'Punggung'},{id:'k',name:'Kaki',category:'Kaki'},{id:'r',name:'Pemulihan aktif',category:'Kardio'}];const catalog=[{name:'Bench Press',cat:'Dada'},{name:'Lat Pulldown',cat:'Punggung'},{name:'Squat',cat:'Kaki'}];
const session=(h,name,done=true)=>({endedAt:now-h*H,exercises:[{name,type:'strength',sets:[{done}]}]});
test('no history picks first focus',()=>assert.equal(recommend([],routines,catalog,now).routine.id,'d'));
test('chest to back after recovery',()=>assert.equal(recommend([session(40,'Bench Press')],routines,catalog,now).routine.id,'p'));
test('short rest selects recovery',()=>assert.equal(recommend([session(2,'Bench Press')],routines,catalog,now).routine.id,'r'));
test('three heavy sessions select recovery',()=>assert.equal(recommend([session(60,'Bench Press'),session(40,'Lat Pulldown'),session(20,'Squat')],routines,catalog,now).routine.id,'r'));
test('incomplete and future sessions excluded',()=>{const h=[session(40,'Bench Press',false),session(-2,'Squat')];assert.equal(readSessions(h,catalog,now).length,0)});
