const $ = (id) => document.getElementById(id);
const pages = [...document.querySelectorAll(".page")];
const navButtons = [...document.querySelectorAll(".nav-btn")];
const searchInput = $("searchInput");
const themeBtn = $("themeBtn");
const themeSelect = $("themeSelect");
let currentTool = "";
let toastTimer;

const tools = {
  calculator:{name:"آلة حاسبة متطورة",description:"حسابات وذاكرة وسجل ودوال علمية وهندسة وإحصاء ومالية وتحويل",icon:"🧮"},
  scientific:{name:"حاسبة علمية",description:"الدوال المثلثية والجذور والأسس واللوغاريتمات",icon:"📐"},
  number:{name:"محول الأنظمة",description:"تحويل بين Binary و Decimal و Octal و Hex",icon:"🔢"},
  password:{name:"مولد كلمات المرور",description:"إنشاء كلمات مرور عشوائية باستخدام مولد آمن",icon:"🔐"},
  strength:{name:"فحص كلمة المرور",description:"تقدير إرشادي لقوة كلمة المرور دون إرسالها",icon:"🛡️"},
  word:{name:"عداد النصوص",description:"حساب الكلمات والحروف والأسطر",icon:"📝"},
  json:{name:"JSON Formatter",description:"تنسيق وضغط والتحقق من JSON",icon:"{}"},
  base64:{name:"Base64",description:"ترميز وفك ترميز النصوص العربية والإنجليزية",icon:"🔄"},
  url:{name:"URL Encoder",description:"ترميز وفك ترميز النصوص والروابط",icon:"🔗"},
  color:{name:"محول الألوان",description:"تحويل HEX إلى RGB ومعاينة اللون",icon:"🎨"},
  uuid:{name:"UUID Generator",description:"إنشاء معرفات UUID",icon:"🆔"},
  random:{name:"مولد الأرقام",description:"إنشاء أرقام عشوائية ضمن نطاق محدد",icon:"🎲"}
};
const getArray = (key) => {
  try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
  catch { return []; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
async function copyText(text) {
  if (!text) return showToast("لا يوجد نص لنسخه");
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(String(text));
    else {
      const area = document.createElement("textarea");
      area.value = String(text);
      area.style.position = "fixed"; area.style.opacity = "0";
      document.body.appendChild(area); area.select();
      const ok = document.execCommand("copy"); area.remove();
      if (!ok) throw new Error("copy failed");
    }
    showToast("تم النسخ بنجاح 📋");
  } catch { showToast("تعذر النسخ؛ حدّد النص وانسخه يدويًا"); }
}
function showPage(id) {
  pages.forEach(page => page.classList.toggle("active", page.id === id));
  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.page === id));
  if (id === "favoritesPage") renderFavorites();
  if (id === "recentPage") renderRecent();
  if (id === "settingsPage") updateStats();
  window.scrollTo({top:0, behavior:"instant"});
}
navButtons.forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.page)));

function addRecent(tool) {
  const recent = getArray("recentTools").filter(item => item !== tool);
  recent.unshift(tool);
  save("recentTools", recent.slice(0, 12));
  localStorage.setItem("totalUsage", String((Number(localStorage.getItem("totalUsage")) || 0) + 1));
}
function getFavorites() { return getArray("favorites").filter(tool => tools[tool]); }
function updateFavoriteButton() { $("favoriteBtn").textContent = getFavorites().includes(currentTool) ? "★" : "☆"; }
function openTool(tool) {
  if (!tools[tool]) return;
  currentTool = tool;
  $("toolTitle").textContent = tools[tool].name;
  $("toolDescription").textContent = tools[tool].description;
  addRecent(tool); updateFavoriteButton(); renderTool(tool); showPage("toolPage");
}
document.querySelectorAll("[data-tool]").forEach(button => button.addEventListener("click", () => openTool(button.dataset.tool)));
$("backBtn").addEventListener("click", () => showPage("homePage"));
$("favoriteBtn").addEventListener("click", () => {
  if (!currentTool) return;
  let favorites = getFavorites();
  if (favorites.includes(currentTool)) {
    favorites = favorites.filter(item => item !== currentTool);
    showToast("أزيلت الأداة من المفضلة");
  } else { favorites.push(currentTool); showToast("أضيفت الأداة إلى المفضلة ⭐"); }
  save("favorites", favorites); updateFavoriteButton();
});
$("shareBtn").addEventListener("click", async () => {
  if (!currentTool) return;
  const data = {title:tools[currentTool].name, text:tools[currentTool].description, url:location.href};
  try { if (navigator.share) await navigator.share(data); else await copyText(location.href); } catch {}
});

function createToolCard(tool) {
  const button = document.createElement("button");
  button.className = "tool-card";
  button.innerHTML = `<div class="tool-icon"></div><div><h3></h3><p></p></div><span>←</span>`;
  button.querySelector(".tool-icon").textContent = tools[tool].icon;
  button.querySelector("h3").textContent = tools[tool].name;
  button.querySelector("p").textContent = tools[tool].description;
  button.addEventListener("click", () => openTool(tool));
  return button;
}
function renderList(containerId, list, emptyText) {
  const container = $(containerId); container.replaceChildren();
  const valid = list.filter(tool => tools[tool]);
  if (!valid.length) { const p = document.createElement("p"); p.className = "empty"; p.textContent = emptyText; container.appendChild(p); return; }
  valid.forEach(tool => container.appendChild(createToolCard(tool)));
}
function renderFavorites() { renderList("favoritesList", getFavorites(), "لا توجد أدوات في المفضلة حتى الآن ⭐"); }
function renderRecent() { renderList("recentList", getArray("recentTools"), "لم تستخدم أي أداة بعد."); }
$("clearRecent").addEventListener("click", () => {
  localStorage.removeItem("recentTools"); renderRecent(); showToast("تم مسح سجل الاستخدام");
});

function applyTheme(mode) {
  const dark = mode === "dark" || (mode === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.body.classList.toggle("dark", dark);
  themeBtn.textContent = dark ? "☀️" : "🌙";
  if (themeSelect) themeSelect.value = mode;
}
function setTheme(mode) { localStorage.setItem("theme", mode); applyTheme(mode); }
themeBtn.addEventListener("click", () => setTheme(document.body.classList.contains("dark") ? "light" : "dark"));
themeSelect.addEventListener("change", () => { setTheme(themeSelect.value); showToast("تم تغيير المظهر"); });
if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => { if ((localStorage.getItem("theme") || "auto") === "auto") applyTheme("auto"); });
setTheme(localStorage.getItem("theme") || "auto");

function updateStats() {
  $("statsText").textContent = `استخدمت الأدوات ${Number(localStorage.getItem("totalUsage")) || 0} مرة. لديك ${getFavorites().length} أدوات في المفضلة.`;
}
function vibrationEnabled() { return localStorage.getItem("vibration") !== "false"; }
function updateVibrationButton() { $("vibrationToggle").textContent = vibrationEnabled() ? "تشغيل" : "إيقاف"; }
$("vibrationToggle").addEventListener("click", () => {
  localStorage.setItem("vibration", String(!vibrationEnabled())); updateVibrationButton();
  showToast(vibrationEnabled() ? "تم تشغيل الاهتزاز" : "تم إيقاف الاهتزاز");
});
document.addEventListener("click", event => {
  if (event.target.closest("button") && vibrationEnabled() && navigator.vibrate) navigator.vibrate(10);
});
$("resetData").addEventListener("click", () => {
  if (!confirm("سيتم حذف بيانات Ahmed Tools المحلية فقط. هل تريد المتابعة؟")) return;
  ["calcHistory","calcMemory","recentTools","totalUsage","favorites","theme","vibration","calculatorHistory","calculatorMemory"].forEach(key => localStorage.removeItem(key));
  showToast("تم حذف بيانات التطبيق");
  setTimeout(() => location.reload(), 500);
});
updateVibrationButton();

function filterTools() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  let shown = 0;
  document.querySelectorAll("#allTools .tool-card").forEach(card => {
    const match = card.textContent.toLocaleLowerCase().includes(query);
    card.style.display = match ? "flex" : "none";
    if (match) shown++;
  });
  $("noSearchResults").classList.toggle("hidden", shown !== 0);
}
searchInput.addEventListener("input", filterTools);
document.querySelectorAll(".category").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".category").forEach(item => item.classList.toggle("active", item === button));
  const category = button.dataset.category;
  document.querySelectorAll("#allTools .tool-card").forEach(card => {
    const matchesCategory = category === "all" || card.dataset.category === category;
    const matchesSearch = card.textContent.toLocaleLowerCase().includes(searchInput.value.trim().toLocaleLowerCase());
    card.style.display = matchesCategory && matchesSearch ? "flex" : "none";
  });
  const shown = [...document.querySelectorAll("#allTools .tool-card")].some(card => card.style.display !== "none");
  $("noSearchResults").classList.toggle("hidden", shown);
}));
$("toolsCount").textContent = `${Object.keys(tools).length} أداة`;

function renderTool(tool) {
  const content = $("toolContent"); content.replaceChildren();
  if (tool === "calculator") renderAdvancedCalculator(content);
  if (tool === "scientific") renderScientificTool(content);
  if (tool === "number") renderNumberTool(content);
  if (tool === "password") renderPasswordTool(content);
  if (tool === "strength") renderStrengthTool(content);
  if (tool === "word") renderWordTool(content);
  if (tool === "json") renderJsonTool(content);
  if (tool === "base64") renderBase64Tool(content);
  if (tool === "url") renderUrlTool(content);
  if (tool === "color") renderColorTool(content);
  if (tool === "uuid") renderUuidTool(content);
  if (tool === "random") renderRandomTool(content);
}
function element(tag, attrs={}, text="") {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key,value]) => {
    if (key === "class") node.className = value;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  });
  if (text !== "") node.textContent = text;
  return node;
}
function boxForm(content) {
  const box = element("div", {class:"tool-box"});
  const form = element("div", {class:"tool-form"});
  box.appendChild(form); content.appendChild(box); return form;
}
function resultBox(parent, id, text="") {
  const result = element("div", {class:"result-box", id}, text); parent.appendChild(result); return result;
}

/* الآلة الحاسبة المتكاملة */
function renderAdvancedCalculator(content) {
  const tabs = element("div", {class:"calc-tabs"});
  const pane = element("div", {});
  const tabDefs = [
    ["calculator","🧮 الحاسبة"],["scientific","🔬 العلمية"],["geometry","📐 الهندسة"],
    ["statistics","📊 الإحصاء"],["finance","💰 المالية"],["converter","🔄 التحويل"],["history","📜 السجل"],["settings","⚙️ الإعدادات"]
  ];
  tabDefs.forEach(([id,label], index) => {
    const button = element("button", {class:index===0?"active":""}, label);
    button.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach(b => b.classList.toggle("active", b===button));
      pane.querySelectorAll(".calc-page").forEach(p => p.classList.toggle("active", p.dataset.calcPage===id));
      if (id==="history") drawCalcHistory();
    });
    tabs.appendChild(button);
  });
  content.append(tabs,pane);
  tabDefs.forEach(([id]) => {
    const section = element("section", {class:`calc-page${id==="calculator"?" active":""}`, "data-calc-page":id});
    pane.appendChild(section);
  });
  const getPane = id => pane.querySelector(`[data-calc-page="${id}"]`);

  const main = getPane("calculator");
  const calc = element("div", {class:"calculator"});
  const screen = element("div", {class:"calc-screen"});
  screen.append(element("div",{class:"calc-expression",id:"calcExpression"}), element("div",{class:"calc-result",id:"calcResult"},"0"));
  calc.appendChild(screen);
  const buttons = element("div",{class:"calc-buttons"});
  const keys = [
    ["MC","memory"],["MR","memory"],["M+","memory"],["M-","memory"],
    ["AC","clear"],["DEL","special"],["±","special"],["%","special"],
    ["÷","operator"],["(", ""],[")",""],["π",""],
    ["×","operator"],["7",""],["8",""],["9",""],
    ["−","operator"],["4",""],["5",""],["6",""],
    ["+","operator"],["1",""],["2",""],["3",""],
    ["=","operator"],["0",""],[".",""],["e",""]
  ];
  keys.forEach(([label,kind]) => {
    const b = element("button",{class:kind},label);
    b.addEventListener("click", () => calculatorKey(label));
    buttons.appendChild(b);
  });
  calc.appendChild(buttons); main.appendChild(calc);
  let expression = "";
  let memory = Number(localStorage.getItem("calcMemory")) || 0;
  let justCalculated = false;
  const history = () => getArray("calcHistory");
  function screenUpdate(preview=false) {
    $("calcExpression").textContent = expression;
    if (!expression) $("calcResult").textContent = "0";
    else if (preview) {
      try { const value = evaluateExpression(expression); $("calcResult").textContent = Number.isFinite(value) ? formatNumber(value) : expression; }
      catch { $("calcResult").textContent = expression; }
    } else $("calcResult").textContent = expression;
  }
  function addCalcHistory(exp, value) {
    const items = history();
    items.unshift({exp, result:String(value), time:new Date().toLocaleString("ar")});
    save("calcHistory",items.slice(0,100));
    drawCalcHistory();
  }
  function calculatorKey(key) {
    if (key==="MC") { memory=0; localStorage.setItem("calcMemory","0"); showToast("تم مسح الذاكرة"); return; }
    if (key==="MR") { expression += String(memory); justCalculated=false; screenUpdate(true); return; }
    if (key==="M+" || key==="M-") {
      try { const value=evaluateExpression(expression); memory += key==="M+"?value:-value; localStorage.setItem("calcMemory",String(memory)); showToast("تم تحديث الذاكرة"); }
      catch { showToast("أدخل عملية صحيحة أولًا"); } return;
    }
    if (key==="AC") { expression=""; justCalculated=false; screenUpdate(); return; }
    if (key==="DEL") { expression=expression.slice(0,-1); justCalculated=false; screenUpdate(true); return; }
    if (key==="=") {
      if (!expression.trim()) return;
      try {
        const original=expression; const value=evaluateExpression(expression);
        if (!Number.isFinite(value)) throw new Error();
        const formatted=formatNumber(value); addCalcHistory(original,formatted);
        expression=String(value); justCalculated=true; screenUpdate();
        $("calcResult").textContent=formatted;
      } catch { $("calcResult").textContent="خطأ في العملية"; showToast("تحقق من العملية الحسابية"); }
      return;
    }
    if (key==="±") {
      const match=expression.match(/(\d+(?:\.\d+)?|\.\d+)$/);
      if (match) {
        const start=match.index, token=match[0];
        const before=expression.slice(0,start);
        expression = before.endsWith("-") && (before.length===1 || /[+\-*/(]$/.test(before.slice(0,-1))) ? before.slice(0,-1)+token : before+"(-"+token+")";
      } else if (expression) expression = "-("+expression+")";
      screenUpdate(true); return;
    }
    if (key==="%") {
      const match=expression.match(/(\d+(?:\.\d+)?|\.\d+)$/);
      if (match) expression=expression.slice(0,match.index)+String(Number(match[0])/100);
      screenUpdate(true); return;
    }
    const map={"÷":"/","×":"*","−":"-","π":"PI","e":"E"};
    const value=map[key] || key;
    if (justCalculated && /^(?:\d|\.|PI|E)$/.test(value)) expression="";
    justCalculated=false;
    expression += value;
    screenUpdate(true);
  }
  function drawCalcHistory() {
    const section=getPane("history"); section.replaceChildren();
    const card=element("div",{class:"calc-card"});
    card.appendChild(element("h3",{},"📜 سجل العمليات"));
    const search=element("input",{type:"search",placeholder:"البحث في السجل","aria-label":"البحث في السجل"});
    const clear=element("button",{class:"main"},"مسح السجل بالكامل");
    const list=element("div",{});
    card.append(search,clear,list); section.appendChild(card);
    function render() {
      list.replaceChildren();
      const query=search.value.trim().toLocaleLowerCase();
      const entries=history().filter(item=>`${item.exp} ${item.result} ${item.time||""}`.toLocaleLowerCase().includes(query));
      if (!entries.length) { list.appendChild(element("p",{class:"info"},"لا توجد عمليات")); return; }
      entries.forEach(item=>{
        const row=element("div",{class:"history-item"});
        const txt=element("div",{class:"history-text"},`${item.exp} = ${item.result}`);
        txt.title="اضغط لاستخدام النتيجة";
        txt.addEventListener("click",()=>{expression=String(item.result);screenUpdate();tabs.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("active",i===0));pane.querySelectorAll(".calc-page").forEach(p=>p.classList.toggle("active",p.dataset.calcPage==="calculator"));});
        const del=element("button",{class:"delete-history"},"حذف");
        del.addEventListener("click",()=>{save("calcHistory",history().filter(x=>x!==item));render();});
        row.append(txt,del);list.appendChild(row);
      });
    }
    search.addEventListener("input",render);
    clear.addEventListener("click",()=>{if(confirm("هل تريد مسح سجل العمليات؟")){localStorage.removeItem("calcHistory");render();}});
    render();
  }
  function buildCalcScientific() {
    const section=getPane("scientific"); const card=element("div",{class:"calc-card"});
    card.appendChild(element("h3",{},"🔬 الحاسبة العلمية"));
    const input=element("input",{type:"number",id:"calcSciInput",placeholder:"أدخل رقمًا"});
    const mode=element("select",{id:"calcAngleMode"});
    mode.append(element("option",{value:"DEG"},"DEG - درجات"),element("option",{value:"RAD"},"RAD - راديان"));
    const grid=element("div",{class:"scientific-grid"});
    const ops=[["sin","sin"],["cos","cos"],["tan","tan"],["asin","sin⁻¹"],["acos","cos⁻¹"],["atan","tan⁻¹"],["log","log"],["ln","ln"],["sqrt","√"],["cbrt","∛"],["square","x²"],["cube","x³"],["power10","10ˣ"],["exp","eˣ"],["inverse","1/x"],["abs","|x|"],["factorial","n!"],["ceil","⌈x⌉"],["floor","⌊x⌋"],["round","round"],["pi","π"],["e","e"]];
    const answer=element("div",{class:"answer"},"النتيجة تظهر هنا");
    ops.forEach(([op,label])=>{const b=element("button",{},label);b.addEventListener("click",()=>{const raw=input.value;const x=Number(raw);if(!raw.trim() && !["pi","e"].includes(op)){answer.textContent="أدخل رقمًا صحيحًا";return;}const rad=mode.value==="DEG"?x*Math.PI/180:x;let r;switch(op){case"sin":r=Math.sin(rad);break;case"cos":r=Math.cos(rad);break;case"tan":r=Math.tan(rad);break;case"asin":r=Math.asin(x)*(mode.value==="DEG"?180/Math.PI:1);break;case"acos":r=Math.acos(x)*(mode.value==="DEG"?180/Math.PI:1);break;case"atan":r=Math.atan(x)*(mode.value==="DEG"?180/Math.PI:1);break;case"log":r=Math.log10(x);break;case"ln":r=Math.log(x);break;case"sqrt":r=Math.sqrt(x);break;case"cbrt":r=Math.cbrt(x);break;case"square":r=x*x;break;case"cube":r=x**3;break;case"power10":r=10**x;break;case"exp":r=Math.exp(x);break;case"inverse":r=1/x;break;case"abs":r=Math.abs(x);break;case"factorial":if(x<0||!Number.isInteger(x)||x>170){answer.textContent="يجب أن يكون عددًا صحيحًا من 0 إلى 170";return;}r=1;for(let i=2;i<=x;i++)r*=i;break;case"ceil":r=Math.ceil(x);break;case"floor":r=Math.floor(x);break;case"round":r=Math.round(x);break;case"pi":r=Math.PI;break;case"e":r=Math.E;break;}answer.textContent=Number.isFinite(r)?formatNumber(r):"النتيجة غير معرفة ضمن الأعداد الحقيقية";});grid.appendChild(b);});
    card.append(input,mode,grid,answer);section.appendChild(card);
  }
  buildCalcScientific();

  function buildGeometry() {
    const section=getPane("geometry"),card=element("div",{class:"calc-card"});
    card.appendChild(element("h3",{},"📐 حاسبة الهندسة"));
    const shape=element("select",{id:"calcShape"});
    [["circle","دائرة"],["square","مربع"],["rectangle","مستطيل"],["triangle","مثلث (قاعدة وارتفاع)"],["cube","مكعب"],["sphere","كرة"],["cylinder","أسطوانة"],["cone","مخروط"]].forEach(([v,t])=>shape.appendChild(element("option",{value:v},t)));
    const a=element("input",{type:"number",min:"0",step:"any",placeholder:"نصف القطر / الطول / الضلع"});
    const b=element("input",{type:"number",min:"0",step:"any",placeholder:"العرض / الارتفاع"});
    const ans=element("div",{class:"answer"},"أدخل الأبعاد ثم اضغط احسب");
    const btn=element("button",{class:"main"},"احسب");
    btn.addEventListener("click",()=>{if(a.value.trim()===""||Number(a.value)<0||!Number.isFinite(Number(a.value))){ans.textContent="أدخل قيمة أولى غير سالبة";return;}const x=Number(a.value),y=Number(b.value);let area,perimeter,volume;switch(shape.value){case"circle":area=Math.PI*x*x;perimeter=2*Math.PI*x;break;case"square":area=x*x;perimeter=4*x;break;case"rectangle":case"triangle":if(!b.value.trim()||y<0){ans.textContent="أدخل القيمة الثانية";return;}area=shape.value==="rectangle"?x*y:x*y/2;perimeter=shape.value==="rectangle"?2*(x+y):undefined;break;case"cube":area=6*x*x;volume=x**3;break;case"sphere":area=4*Math.PI*x*x;volume=4/3*Math.PI*x**3;break;case"cylinder":case"cone":if(!b.value.trim()||y<0){ans.textContent="أدخل الارتفاع";return;}volume=shape.value==="cylinder"?Math.PI*x*x*y:Math.PI*x*x*y/3;area=shape.value==="cylinder"?2*Math.PI*x*(x+y):Math.PI*x*(x+Math.sqrt(x*x+y*y));break;}ans.textContent=volume!==undefined?`الحجم: ${formatNumber(volume)}\nالمساحة السطحية: ${formatNumber(area)}`:`المساحة: ${formatNumber(area)}${perimeter!==undefined?`\nالمحيط: ${formatNumber(perimeter)}`:""}`;});
    card.append(shape,a,b,btn,ans);section.appendChild(card);
  }
  buildGeometry();

  function buildStatistics() {
    const section=getPane("statistics"),card=element("div",{class:"calc-card"});
    card.appendChild(element("h3",{},"📊 الإحصاء"));
    const input=element("textarea",{placeholder:"أدخل الأرقام مفصولة بفاصلة أو مسافة",rows:"4"});
    const ans=element("div",{class:"answer"},"أدخل مجموعة أرقام");
    const btn=element("button",{class:"main"},"احسب الإحصاءات");
    btn.addEventListener("click",()=>{const raw=input.value.trim();const nums=raw?raw.split(/[,،;\s]+/).filter(Boolean).map(Number):[];if(!nums.length||nums.some(n=>!Number.isFinite(n))){ans.textContent="تأكد من إدخال أرقام صحيحة فقط";return;}const sum=nums.reduce((a,b)=>a+b,0),mean=sum/nums.length,sorted=[...nums].sort((a,b)=>a-b),mid=Math.floor(sorted.length/2),median=sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;const freq=new Map();nums.forEach(n=>freq.set(n,(freq.get(n)||0)+1));const maxFreq=Math.max(...freq.values());const modes=[...freq].filter(([,f])=>f===maxFreq).map(([n])=>n);const variance=nums.reduce((t,n)=>t+(n-mean)**2,0)/nums.length;ans.textContent=`عدد القيم: ${nums.length}\nالمجموع: ${formatNumber(sum)}\nالمتوسط: ${formatNumber(mean)}\nالوسيط: ${formatNumber(median)}\nالمنوال: ${maxFreq===1?"لا يوجد":modes.join(", ")}\nالأصغر: ${Math.min(...nums)}\nالأكبر: ${Math.max(...nums)}\nالتباين السكاني: ${formatNumber(variance)}\nالانحراف المعياري السكاني: ${formatNumber(Math.sqrt(variance))}`;});
    card.append(input,btn,ans);section.appendChild(card);
  }
  buildStatistics();

  function buildFinance() {
    const section=getPane("finance");
    const definitions=[
      {title:"💰 الفائدة المركبة",fields:[["principal","المبلغ الأصلي"],["rate","الفائدة السنوية %"],["years","عدد السنوات"],["periods","مرات التركيب سنويًا","1"]],run:v=>{const [p,r,y,n]=v;if(p<0||y<0||r<=-100||n<=0||!Number.isInteger(n))throw Error("تحقق من المبلغ والفائدة والسنوات وعدد مرات التركيب");const amount=p*(1+r/100/n)**(n*y);return `المبلغ النهائي: ${formatNumber(amount)}\nالفائدة: ${formatNumber(amount-p)}`;}},
      {title:"💳 حاسبة القرض",fields:[["loan","مبلغ القرض"],["loanRate","الفائدة السنوية %"],["loanYears","مدة القرض بالسنوات"]],run:v=>{const [p,annual,y]=v;if(p<0||annual<0||y<=0)throw Error("أدخل قيمًا صحيحة غير سالبة ومدة أكبر من صفر");const r=annual/1200,m=y*12,payment=r===0?p/m:p*r*(1+r)**m/((1+r)**m-1),total=payment*m;return `القسط الشهري: ${formatNumber(payment)}\nإجمالي المدفوع: ${formatNumber(total)}\nإجمالي الفائدة: ${formatNumber(total-p)}`;}},
      {title:"🏷️ الخصم والضريبة",fields:[["price","السعر"],["discount","الخصم %","0"],["tax","الضريبة %","0"]],run:v=>{const [p,d,t]=v;if(p<0||d<0||d>100||t<0)throw Error("السعر غير سالب والخصم بين 0 و100 والضريبة غير سالبة");const after=p*(1-d/100),final=after*(1+t/100);return `بعد الخصم: ${formatNumber(after)}\nالسعر النهائي: ${formatNumber(final)}\nقيمة الخصم: ${formatNumber(p-after)}\nقيمة الضريبة: ${formatNumber(final-after)}`;}}
    ];
    definitions.forEach(def=>{const card=element("div",{class:"calc-card"});card.appendChild(element("h3",{},def.title));const inputs=def.fields.map(([id,placeholder,value])=>{const i=element("input",{type:"number",step:"any",placeholder,value:value??""});i.setAttribute("aria-label",placeholder);return i;});const ans=element("div",{class:"answer"},"أدخل البيانات ثم اضغط احسب");const btn=element("button",{class:"main"},"احسب");btn.addEventListener("click",()=>{try{if(inputs.some(i=>!i.value.trim()))throw Error("أكمل جميع الحقول");const vals=inputs.map(i=>Number(i.value));if(vals.some(v=>!Number.isFinite(v)))throw Error("تحقق من الأرقام");ans.textContent=def.run(vals);}catch(e){ans.textContent=e.message||"تعذر الحساب";}});card.append(...inputs,btn,ans);section.appendChild(card);});
  }
  buildFinance();

  function buildConverter() {
    const section=getPane("converter"),card=element("div",{class:"calc-card"});
    card.appendChild(element("h3",{},"🔄 تحويل الوحدات"));
    const value=element("input",{type:"number",step:"any",placeholder:"القيمة"});
    const type=element("select",{});
    const options=[["km","كيلومتر → ميل"],["mile","ميل → كيلومتر"],["kg","كيلوجرام → رطل"],["lb","رطل → كيلوجرام"],["m","متر → قدم"],["ft","قدم → متر"],["c","مئوية → فهرنهايت"],["f","فهرنهايت → مئوية"],["liter","لتر → جالون أمريكي"],["gallon","جالون أمريكي → لتر"],["hour","ساعة → دقيقة"],["minute","دقيقة → ثانية"],["day","يوم → ساعة"],["byte","بايت → كيلوبايت (1024)"],["kb","كيلوبايت → ميجابايت (1024)"],["mb","ميجابايت → جيجابايت (1024)"]];
    options.forEach(([v,t])=>type.appendChild(element("option",{value:v},t)));
    const ans=element("div",{class:"answer"},"أدخل القيمة");
    const btn=element("button",{class:"main"},"تحويل");
    btn.addEventListener("click",()=>{if(!value.value.trim()||!Number.isFinite(Number(value.value))){ans.textContent="أدخل قيمة صحيحة";return;}const x=Number(value.value);const fn={km:x=>x*.621371,mile:x=>x*1.609344,kg:x=>x*2.2046226218,lb:x=>x*.45359237,m:x=>x*3.280839895,ft:x=>x*.3048,c:x=>x*9/5+32,f:x=>(x-32)*5/9,liter:x=>x*.2641720524,gallon:x=>x*3.785411784,hour:x=>x*60,minute:x=>x*60,day:x=>x*24,byte:x=>x/1024,kb:x=>x/1024,mb:x=>x/1024};ans.textContent=formatNumber(fn[type.value](x));});
    card.append(value,type,btn,ans);section.appendChild(card);
  }
  buildConverter();
  const settings=getPane("settings"),settingsCard=element("div",{class:"calc-card"});
  settingsCard.appendChild(element("h3",{},"⚙️ إعدادات الحاسبة"));
  const darkRow=element("button",{class:"secondary-btn"},"تغيير الوضع الداكن");darkRow.addEventListener("click",()=>setTheme(document.body.classList.contains("dark")?"light":"dark"));
  const color=element("input",{type:"color",value:localStorage.getItem("calcAccent")||"#ff9800","aria-label":"لون الحاسبة"});
  color.addEventListener("input",()=>{document.documentElement.style.setProperty("--calc-accent",color.value);document.querySelectorAll(".calc-buttons .operator,.calc-tabs button.active").forEach(el=>el.style.backgroundColor=color.value);localStorage.setItem("calcAccent",color.value);});
  settingsCard.append(darkRow,element("p",{class:"info"},"لون الحاسبة"),color,element("p",{class:"info"},"المطور: أحمد علي نور · طالب بجامعة الملك فيصل بتشاد"));settings.appendChild(settingsCard);
  if(localStorage.getItem("calcAccent")){document.documentElement.style.setProperty("--calc-accent",localStorage.getItem("calcAccent"));}
  screenUpdate();
}

function formatNumber(number) {
  if (!Number.isFinite(number)) return "غير معرّف";
  const rounded = Number(number.toPrecision(12));
  return String(rounded);
}
function evaluateExpression(source) {
  if (typeof source !== "string" || source.length > 250) throw new Error("Expression too long");
  let expr = source.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-").replaceAll("π","PI").replace(/\bE\b/g,"Math.E").replace(/\bPI\b/g,"Math.PI").replace(/\^/g,"**");
  expr = expr.replace(/Math\.E/g,"2.718281828459045").replace(/Math\.PI/g,"3.141592653589793");
  if (!/^[0-9+\-*/().\s]*$/.test(expr) || !expr.trim()) throw new Error("Invalid expression");
  if (/\*\*\s*\*\*|\/\s*\/|\/\/|\/\*|\*\//.test(expr)) throw new Error("Invalid operator");
  const result = Function('"use strict";return ('+expr+')')();
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("Invalid result");
  return result;
}

/* الأدوات الأخرى */
function renderScientificTool(content) {
  const form=boxForm(content),input=element("input",{type:"number",step:"any",placeholder:"أدخل رقمًا"}),mode=element("select",{}),answer=resultBox(form,"scientificResult","أدخل رقمًا ثم اختر العملية");
  mode.append(element("option",{value:"DEG"},"درجات DEG"),element("option",{value:"RAD"},"راديان RAD"));
  const grid=element("div",{class:"scientific-grid"});
  [["sin","sin"],["cos","cos"],["tan","tan"],["sqrt","√"],["square","x²"],["cube","x³"],["log","log"],["ln","ln"],["abs","|x|"]].forEach(([op,label])=>{const b=element("button",{class:"secondary-btn"},label);b.addEventListener("click",()=>{if(!input.value.trim()){showToast("أدخل رقمًا");return;}const x=Number(input.value),a=mode.value==="DEG"?x*Math.PI/180:x;const r={sin:()=>Math.sin(a),cos:()=>Math.cos(a),tan:()=>Math.tan(a),sqrt:()=>Math.sqrt(x),square:()=>x*x,cube:()=>x**3,log:()=>Math.log10(x),ln:()=>Math.log(x),abs:()=>Math.abs(x)}[op]();answer.textContent=Number.isFinite(r)?formatNumber(r):"النتيجة غير معرفة";});grid.appendChild(b);});
  form.append(input,mode,grid,answer);
}
function renderNumberTool(content) {
  const form=boxForm(content),input=element("input",{placeholder:"أدخل الرقم دون فواصل"}),base=element("select",{}),button=element("button",{class:"primary-btn"},"تحويل"),grid=element("div",{class:"result-grid"});
  [["2","Binary"],["8","Octal"],["10","Decimal"],["16","Hexadecimal"]].forEach(([v,t])=>base.appendChild(element("option",{value:v},t)));base.value="10";
  const outputs={};[["binary","Binary"],["decimal","Decimal"],["octal","Octal"],["hex","Hexadecimal"]].forEach(([key,label])=>{const item=element("div",{class:"result-item"});item.append(element("strong",{},label),element("span",{}, "-"));outputs[key]=item.querySelector("span");grid.appendChild(item);});
  button.addEventListener("click",()=>{const raw=input.value.trim(),b=Number(base.value),patterns={2:/^[+-]?[01]+$/,8:/^[+-]?[0-7]+$/,10:/^[+-]?\d+$/,16:/^[+-]?[0-9a-f]+$/i};if(!raw||!patterns[b].test(raw)){showToast("الرقم لا يطابق النظام المختار");return;}try{const negative=raw.startsWith("-"),digits=raw.replace(/^[+-]/,"");let value;if(b===10)value=BigInt(raw);else{const prefix=b===2?"0b":b===8?"0o":"0x";value=BigInt((negative?"-":"")+prefix+digits); }outputs.binary.textContent=value.toString(2);outputs.decimal.textContent=value.toString(10);outputs.octal.textContent=value.toString(8);outputs.hex.textContent=value.toString(16).toUpperCase();}catch{showToast("تعذر تحويل الرقم");}});
  form.append(input,base,button,grid);
}
function renderPasswordTool(content) {
  const form=boxForm(content),length=element("select",{}),checks=element("div",{class:"calc-grid"}),result=resultBox(form,"passwordResult","اضغط على إنشاء"),generate=element("button",{class:"primary-btn"},"إنشاء كلمة مرور"),copy=element("button",{class:"secondary-btn"},"📋 نسخ");
  [[12,"12 حرفًا"],[16,"16 حرفًا"],[20,"20 حرفًا"],[24,"24 حرفًا"],[32,"32 حرفًا"],[48,"48 حرفًا"]].forEach(([v,t])=>length.appendChild(element("option",{value:v},t)));length.value="16";
  const groups=[["lower","أحرف صغيرة",true],["upper","أحرف كبيرة",true],["digits","أرقام",true],["symbols","رموز",true]];
  const boxes={};groups.forEach(([id,label,checked])=>{const wrap=element("label",{});const input=element("input",{type:"checkbox",checked:String(checked)});input.checked=checked;wrap.append(input,document.createTextNode(" "+label));boxes[id]=input;checks.appendChild(wrap);});
  generate.addEventListener("click",()=>{const chars=[];if(boxes.lower.checked)chars.push("abcdefghijklmnopqrstuvwxyz");if(boxes.upper.checked)chars.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");if(boxes.digits.checked)chars.push("0123456789");if(boxes.symbols.checked)chars.push("!@#$%^&*()-_=+[]{}");if(!chars.length){showToast("اختر نوعًا واحدًا على الأقل");return;}if(!crypto.getRandomValues){showToast("المتصفح لا يدعم التوليد الآمن");return;}const pool=chars.join(""),n=Number(length.value);let password="";const random=new Uint32Array(n);crypto.getRandomValues(random);groups.forEach(([id],i)=>{if(boxes[id].checked&&password.length<n){const set=chars[groups.filter(([gid])=>boxes[gid].checked).indexOf(groups.find(g=>g[0]===id))];if(set){const arr=new Uint32Array(1);crypto.getRandomValues(arr);password+=set[arr[0]%set.length];}}});const bytes=new Uint32Array(n);crypto.getRandomValues(bytes);while(password.length<n)password+=pool[bytes[password.length]%pool.length];password=password.split("").sort(()=>Math.random()-.5).join("");result.textContent=password;});
  copy.addEventListener("click",()=>copyText(result.textContent));form.append(length,checks,generate,result,copy);
}
function renderStrengthTool(content) {
  const form=boxForm(content),input=element("input",{type:"password",placeholder:"اكتب كلمة اختبارية"}),show=element("button",{class:"secondary-btn"},"إظهار/إخفاء"),result=resultBox(form,"strengthResult","أدخل كلمة مرور للفحص");
  show.addEventListener("click",()=>input.type=input.type==="password"?"text":"password");
  input.addEventListener("input",()=>{const p=input.value;let score=0;if(p.length>=8)score++;if(p.length>=12)score++;if(/[a-z]/.test(p))score++;if(/[A-Z]/.test(p))score++;if(/\d/.test(p))score++;if(/[^\w]/.test(p))score++;if(!p)result.textContent="أدخل كلمة مرور للفحص";else if(p.length<8||score<=2)result.textContent="ضعيفة 🔴";else if(score<=4)result.textContent="متوسطة 🟡";else result.textContent="قوية مبدئيًا 🟢";});
  form.append(input,show,result,element("p",{class:"info"},"هذا فحص إرشادي مبسط وليس ضمانًا لأمان كلمة المرور. لا تُدخل كلمة مرورك الحقيقية."));
}
function renderWordTool(content) {
  const form=boxForm(content),input=element("textarea",{placeholder:"اكتب النص هنا..."}),grid=element("div",{class:"result-grid"}),values={};
  [["words","الكلمات"],["chars","الحروف"],["lines","الأسطر"],["nospace","بدون مسافات"]].forEach(([id,label])=>{const item=element("div",{class:"result-item"});item.append(element("strong",{},label),element("span",{}, "0"));values[id]=item.querySelector("span");grid.appendChild(item);});
  input.addEventListener("input",()=>{const t=input.value;values.words.textContent=t.trim()?t.trim().split(/\s+/u).length:0;values.chars.textContent=Array.from(t).length;values.lines.textContent=t?t.split(/\r\n|\r|\n/).length:0;values.nospace.textContent=Array.from(t.replace(/\s/gu,"")).length;});
  form.append(input,grid,element("button",{class:"secondary-btn",onclick:()=>copyText(input.value)},"📋 نسخ النص"));
}
function renderJsonTool(content) {
  const form=boxForm(content),input=element("textarea",{placeholder:'{"name":"Ahmed"}'}),output=element("textarea",{placeholder:"النتيجة",readonly:"readonly"}),format=element("button",{class:"primary-btn"},"تنسيق JSON"),minify=element("button",{class:"secondary-btn"},"ضغط JSON"),copy=element("button",{class:"secondary-btn"},"📋 نسخ");
  format.addEventListener("click",()=>{try{output.value=JSON.stringify(JSON.parse(input.value),null,2);showToast("JSON صحيح ✓");}catch{showToast("JSON غير صحيح؛ تحقق من الفواصل وعلامات الاقتباس");}});
  minify.addEventListener("click",()=>{try{output.value=JSON.stringify(JSON.parse(input.value));showToast("تم ضغط JSON");}catch{showToast("JSON غير صحيح");}});
  copy.addEventListener("click",()=>copyText(output.value));form.append(input,format,minify,output,copy);
}
function renderBase64Tool(content) {
  const form=boxForm(content),input=element("textarea",{placeholder:"أدخل النص"}),output=element("textarea",{placeholder:"النتيجة",readonly:"readonly"}),encode=element("button",{class:"primary-btn"},"ترميز Encode"),decode=element("button",{class:"secondary-btn"},"فك الترميز Decode"),copy=element("button",{class:"secondary-btn"},"📋 نسخ");
  encode.addEventListener("click",()=>{try{output.value=btoa(Array.from(new TextEncoder().encode(input.value),b=>String.fromCharCode(b)).join(""));}catch{showToast("تعذر الترميز");}});
  decode.addEventListener("click",()=>{try{const binary=atob(input.value.trim());const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));output.value=new TextDecoder("utf-8",{fatal:true}).decode(bytes);}catch{showToast("Base64 غير صالح أو لا يحتوي UTF-8 صحيحًا");}});
  copy.addEventListener("click",()=>copyText(output.value));form.append(input,encode,decode,output,copy);
}
function renderUrlTool(content) {
  const form=boxForm(content),input=element("textarea",{placeholder:"أدخل النص أو الرابط"}),output=element("textarea",{placeholder:"النتيجة",readonly:"readonly"}),encode=element("button",{class:"primary-btn"},"ترميز Encode"),decode=element("button",{class:"secondary-btn"},"فك الترميز Decode"),copy=element("button",{class:"secondary-btn"},"📋 نسخ");
  encode.addEventListener("click",()=>output.value=encodeURIComponent(input.value));
  decode.addEventListener("click",()=>{try{output.value=decodeURIComponent(input.value);}catch{showToast("ترميز URL غير صالح");}});
  copy.addEventListener("click",()=>copyText(output.value));form.append(input,encode,decode,output,copy);
}
function renderColorTool(content) {
  const form=boxForm(content),input=element("input",{placeholder:"#2563EB"}),button=element("button",{class:"primary-btn"},"تحويل"),result=resultBox(form,"colorResult","أدخل لون HEX");
  button.addEventListener("click",()=>{let hex=input.value.trim().replace(/^#/,"");if(!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)){showToast("أدخل HEX صحيحًا مثل #2563EB");return;}if(hex.length===3)hex=hex.split("").map(c=>c+c).join("");const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);result.replaceChildren();const swatch=element("div",{});swatch.style.cssText=`height:70px;border-radius:14px;background:#${hex};margin-bottom:12px`;result.append(swatch,document.createTextNode(`HEX: #${hex.toUpperCase()} · RGB: rgb(${r}, ${g}, ${b})`));});
  form.append(input,button,result);
}
function renderUuidTool(content) {
  const form=boxForm(content),button=element("button",{class:"primary-btn"},"إنشاء UUID"),result=resultBox(form,"uuidResult","اضغط على إنشاء"),copy=element("button",{class:"secondary-btn"},"📋 نسخ");
  button.addEventListener("click",()=>{if(crypto.randomUUID)result.textContent=crypto.randomUUID();else{const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const h=[...bytes].map(b=>b.toString(16).padStart(2,"0")).join("");result.textContent=`${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}});
  copy.addEventListener("click",()=>copyText(result.textContent));form.append(button,result,copy);
}
function renderRandomTool(content) {
  const form=boxForm(content),min=element("input",{type:"number",value:"1",placeholder:"الحد الأدنى"}),max=element("input",{type:"number",value:"100",placeholder:"الحد الأعلى"}),button=element("button",{class:"primary-btn"},"إنشاء رقم"),result=resultBox(form,"randomResult","🎲");
  button.addEventListener("click",()=>{if(!min.value.trim()||!max.value.trim()){showToast("أدخل الحدين");return;}const a=Number(min.value),b=Number(max.value);if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a>b){showToast("أدخل عددين صحيحين آمنين والحد الأدنى لا يتجاوز الأعلى");return;}const span=b-a+1;if(span>4294967296){showToast("النطاق كبير جدًا");return;}const limit=Math.floor(4294967296/span)*span;const buf=new Uint32Array(1);let n;do{crypto.getRandomValues(buf);n=buf[0];}while(n>=limit);result.textContent=String(a+(n%span));});
  form.append(min,max,button,result);
}

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => showToast("تعذر تفعيل العمل دون إنترنت؛ تحقق من استضافة HTTPS"));
  });
const screenProtection = (() => {
  let overlay = null;
  let protectedState = false;

  function createOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "screenProtectionOverlay";
    overlay.setAttribute("aria-hidden", "true");

    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f172a",
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
      textAlign: "center",
      padding: "24px",
      boxSizing: "border-box"
    });

    const message = document.createElement("div");
    message.textContent = "🔒 Ahmed Tools محمي";

    Object.assign(message.style, {
      fontSize: "22px",
      fontWeight: "bold"
    });

    overlay.appendChild(message);

    if (document.body) {
      document.body.appendChild(overlay);
    }

    return overlay;
  }

  function showProtection() {
    protectedState = true;

    if (document.body) {
      createOverlay().style.display = "flex";
    }
  }

  function hideProtection() {
    if (document.visibilityState !== "visible") return;

    protectedState = false;

    if (overlay) {
      overlay.style.display = "none";
    }
  }

  function updateProtection() {
    if (document.visibilityState === "hidden") {
      showProtection();
    } else {
      hideProtection();
    }
  }

  function initialize() {
    createOverlay();
    updateProtection();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }

  document.addEventListener("visibilitychange", updateProtection);

  window.addEventListener("pagehide", showProtection);

  window.addEventListener("pageshow", () => {
    if (document.visibilityState === "visible") {
      hideProtection();
    } else {
      showProtection();
    }
  });

  window.addEventListener("blur", () => {
    showProtection();
  });

  window.addEventListener("focus", () => {
    if (document.visibilityState === "visible") {
      hideProtection();
    }
  });

  return {
    updateProtection,
    showProtection,
    hideProtection,
    get isProtected() {
      return protectedState;
    }
  };
})();
      }
