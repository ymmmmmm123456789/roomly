
const screens = [...document.querySelectorAll(".screen")];
const navButtons = [...document.querySelectorAll(".bottom-nav button")];
let currentPin = null;
let selectedFurniture = null;
const LAYOUT_STORAGE_KEY = "roomly-myroom-layout-v2";
const ROOM_STORAGE_KEY = "roomly-room-settings-v1";

const pins = [
  {img:"inspo8.jpg",name:"Graphic warm",base:94,why:"低めのソファと大きめラグで、視線が散らかりにくい。8畳でもまとまりを作りやすい構成です。",tags:["白いローソファ","柄ラグ","オレンジ照明"],sense:"白と木をベースに、オレンジを少量だけ使っているので、物が多くても全体がまとまって見えます。"},
  {img:"inspo2.jpg",name:"Retro city pop",base:91,why:"家具の高さが低く、差し色を点で使っているので狭い部屋でも圧迫感が出にくいです。",tags:["低めソファ","丸い照明","赤・オレンジ"],sense:"色を全部そろえるのではなく、黒を土台にしてオレンジを繰り返しているのがポイントです。"},
  {img:"inspo6.jpg",name:"Cozy lighting",base:88,why:"家具数を絞り、照明と植物で雰囲気を作っているので日本の賃貸にも落とし込みやすいです。",tags:["植物2〜3点","間接照明","家具量少なめ"],sense:"天井照明だけに頼らず、低い位置に光源を増やすことで奥行きが生まれています。"},
  {img:"inspo3.jpg",name:"Airy mid-century",base:86,why:"壁際に家具を寄せて中央の余白を残しているため、長方形の部屋と相性が良いです。",tags:["木の家具","ロー家具","中央の余白"],sense:"視線が奥まで抜けるように、大きい家具を低く抑えているのが広く見える理由です。"},
  {img:"inspo5.jpg",name:"Colorful gallery",base:82,why:"アートや照明で個性を出している一方、大型家具は控えめ。賃貸でも小物から真似しやすいです。",tags:["アート","小型照明","色の反復"],sense:"カラフルでも色をバラバラに置かず、赤・黄・緑を複数箇所で繰り返すとまとまります。"},
  {img:"inspo4.jpg",name:"Warm books & plants",base:80,why:"壁面を活用して床を空ける考え方が、小さめの部屋でも使いやすいです。",tags:["壁面アート","植物","縦収納"],sense:"高さのある本や植物を壁側に集めることで、床面の余白を確保しています。"}
];

function showScreen(id){
  screens.forEach(s=>s.classList.toggle("active", s.id===id));
  navButtons.forEach(b=>b.classList.toggle("active", b.dataset.nav===id));
  window.scrollTo({top:0,behavior:"smooth"});
}

document.getElementById("startBtn").addEventListener("click",()=>showScreen("roomSetupScreen"));
document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.back)));
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>{
  const target=b.dataset.nav;
  if(target==="editorScreen" && !currentPin){showScreen("resultsScreen"); return;}
  if(target==="detailScreen" && !currentPin){showScreen("resultsScreen"); return;}
  showScreen(target);
}));

document.getElementById("matchBtn").addEventListener("click",()=>{
  ["roomSize","roomShape","housing"].forEach(id=>{
  document.getElementById(id).addEventListener("change",saveRoomSettings);
});
restoreRoomSettings();

renderResults();
  showScreen("resultsScreen");
});

function getScore(pin,index){
  const size = Number(document.getElementById("roomSize").value);
  const shape = document.getElementById("roomShape").value;
  let score = pin.base + (size-8)*1.7;
  if(shape==="square" && index===1) score-=4;
  if(shape==="ldk" && index===3) score+=5;
  return Math.max(58,Math.min(97,Math.round(score)));
}

function renderResults(){
  const grid=document.getElementById("resultsGrid");
  grid.innerHTML="";
  pins.forEach((pin,index)=>{
    const score=getScore(pin,index);
    const btn=document.createElement("button");
    btn.className="result-card";
    btn.innerHTML=`<img src="${pin.img}" alt="${pin.name}"><div class="result-meta"><div class="match">${score}% MATCH</div><div class="result-name">${pin.name}</div></div>`;
    btn.addEventListener("click",()=>openDetail(pin,score));
    grid.appendChild(btn);
  });
}

function openDetail(pin,score){
  currentPin={...pin,score};
  document.getElementById("detailImage").src=pin.img;
  document.getElementById("detailImage").alt=pin.name;
  document.getElementById("detailScore").textContent=score+"%";
  document.getElementById("detailWhy").textContent=pin.why;
  document.getElementById("detailSense").textContent=pin.sense;
  document.getElementById("detailTags").innerHTML=pin.tags.map(t=>`<span>${t}</span>`).join("");
  document.getElementById("referenceImage").src=pin.img;
  document.getElementById("referenceTitle").textContent=pin.name;
  showScreen("detailScreen");
}

document.getElementById("tryLayoutBtn").addEventListener("click",()=>{
  if(!currentPin) return;
  if(!document.querySelector(".furniture")){
    if(!restoreLayout()) seedFurniture();
  }
  showScreen("editorScreen");
});

const canvas=document.getElementById("roomCanvas");
const specs={
  sofa:{label:"SOFA",cls:"sofa"},
  tv:{label:"TV",cls:"tv"},
  table:{label:"TABLE",cls:"table"},
  rug:{label:"RUG",cls:"rug"},
  plant:{label:"🌿",cls:"plant"},
  lamp:{label:"💡",cls:"lamp"},
  shelf:{label:"SHELF",cls:"shelf"}
};


function saveLayout(){
  try{
    const items=[...document.querySelectorAll(".furniture")].map((el,index)=>({
      type:el.dataset.type,
      left:el.style.left,
      top:el.style.top,
      zIndex:el.style.zIndex || String(index+1)
    }));
    localStorage.setItem(LAYOUT_STORAGE_KEY,JSON.stringify(items));
  }catch(_){}
}

function restoreLayout(){
  try{
    const items=JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY)||"null");
    if(!Array.isArray(items)||!items.length)return false;
    document.querySelectorAll(".furniture").forEach(x=>x.remove());
    items.forEach(item=>{
      const el=addFurniture(item.type,0,0,false);
      el.style.left=item.left||"40%";
      el.style.top=item.top||"40%";
      el.style.zIndex=item.zIndex||"";
    });
    selectedFurniture=null;
    document.querySelectorAll(".furniture").forEach(x=>x.classList.remove("selected"));
    return true;
  }catch(_){return false;}
}

function saveRoomSettings(){
  try{
    localStorage.setItem(ROOM_STORAGE_KEY,JSON.stringify({
      size:document.getElementById("roomSize").value,
      shape:document.getElementById("roomShape").value,
      housing:document.getElementById("housing").value
    }));
  }catch(_){}
}

function restoreRoomSettings(){
  try{
    const d=JSON.parse(localStorage.getItem(ROOM_STORAGE_KEY)||"null");
    if(!d)return;
    if(d.size)document.getElementById("roomSize").value=d.size;
    if(d.shape)document.getElementById("roomShape").value=d.shape;
    if(d.housing)document.getElementById("housing").value=d.housing;
  }catch(_){}
}

function addFurniture(type,x=42,y=42,shouldSave=true){
  const spec=specs[type];
  const el=document.createElement("div");
  el.className=`furniture ${spec.cls}`;
  el.textContent=spec.label;
  el.dataset.type=type;
  el.style.left=x+"%";
  el.style.top=y+"%";
  canvas.appendChild(el);
  bindFurniture(el);
  selectFurniture(el);
  if(type==="rug") el.style.zIndex="1";
  else el.style.zIndex=String(10 + document.querySelectorAll(".furniture").length);
  if(shouldSave) saveLayout();
  return el;
}

function seedFurniture(){
  addFurniture("rug",28,48);
  addFurniture("sofa",8,62);
  addFurniture("table",58,52);
  addFurniture("tv",58,12);
  addFurniture("plant",12,16);
}

function selectFurniture(el){
  document.querySelectorAll(".furniture").forEach(x=>x.classList.remove("selected"));
  selectedFurniture=el;
  if(el) el.classList.add("selected");
}

function bindFurniture(el){
  let drag=null;
  el.addEventListener("pointerdown",e=>{
    e.preventDefault();
    selectFurniture(el);
    const r=el.getBoundingClientRect();
    drag={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};
    el.classList.add("dragging");
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove",e=>{
    if(!drag || drag.id!==e.pointerId) return;
    const cr=canvas.getBoundingClientRect();
    const er=el.getBoundingClientRect();
    let x=e.clientX-cr.left-drag.dx;
    let y=e.clientY-cr.top-drag.dy;
    x=Math.max(-er.width*.12,Math.min(x,cr.width-er.width*.88));
    y=Math.max(-er.height*.12,Math.min(y,cr.height-er.height*.88));
    el.style.left=(x/cr.width*100)+"%";
    el.style.top=(y/cr.height*100)+"%";
  });
  const end=e=>{
    if(!drag) return;
    el.classList.remove("dragging");
    try{el.releasePointerCapture(e.pointerId)}catch(_){}
    drag=null;
    saveLayout();
  };
  el.addEventListener("pointerup",end);
  el.addEventListener("pointercancel",end);
}

document.querySelectorAll("#furnitureToolbar button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const count=document.querySelectorAll(".furniture").length;
    addFurniture(btn.dataset.type,36+(count%3)*8,34+(count%4)*7);
  });
});

document.getElementById("deleteSelectedBtn").addEventListener("click",()=>{
  if(selectedFurniture){
    selectedFurniture.remove();
    selectedFurniture=null;
    saveLayout();
  }
});
document.getElementById("clearBtn").addEventListener("click",()=>{
  document.querySelectorAll(".furniture").forEach(x=>x.remove());
  selectedFurniture=null;
  try{localStorage.removeItem(LAYOUT_STORAGE_KEY)}catch(_){}
  document.getElementById("coachCard").classList.add("hidden");
});


document.getElementById("bringFrontBtn").addEventListener("click",()=>{
  if(!selectedFurniture) return;
  const items=[...document.querySelectorAll(".furniture")];
  const maxZ=Math.max(10,...items.map(x=>Number(x.style.zIndex)||0));
  selectedFurniture.style.zIndex=String(maxZ+1);
  saveLayout();
});

document.getElementById("sendBackBtn").addEventListener("click",()=>{
  if(!selectedFurniture) return;
  selectedFurniture.style.zIndex="1";
  saveLayout();
});

document.getElementById("coachBtn").addEventListener("click",()=>{
  const items=[...document.querySelectorAll(".furniture")];
  const count=items.length;
  let score=70+Math.min(16,count*2);
  const hasPlant=items.some(x=>x.dataset.type==="plant");
  const hasLamp=items.some(x=>x.dataset.type==="lamp");
  if(hasPlant) score+=3;
  if(hasLamp) score+=4;
  score=Math.min(94,score);
  document.getElementById("senseScore").textContent=score;
  const text = count<=3
    ? "家具が少ないぶん余白はきれい。照明や植物を1つ足すと、Pinterestの雰囲気に近づきます。"
    : "家具の量はちょうどいいです。中央に少し余白を残し、大きい家具を壁側に寄せると視線が奥まで抜けます。";
  document.getElementById("coachText").textContent=text;
  document.getElementById("lessonText").textContent=hasLamp
    ? "今日覚えたこと：低い位置の光で奥行きを作る"
    : "今日覚えたこと：中央の余白を残す";
  document.getElementById("coachCard").classList.remove("hidden");
});

["roomSize","roomShape","housing"].forEach(id=>{
  document.getElementById(id).addEventListener("change",saveRoomSettings);
});
restoreRoomSettings();

renderResults();
