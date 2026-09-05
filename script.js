const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");
const searchInput = document.getElementById("searchInput");
const themeBtn = document.getElementById("themeBtn");
const themeSelect = document.getElementById("themeSelect");

let currentTool = "";

const tools = {
calculator:{name:"آلة حاسبة متطورة",description:"عمليات حسابية مع سجل النتائج"},
scientific:{name:"حاسبة علمية",description:"الدوال الرياضية والحسابات العلمية"},
number:{name:"محول الأنظمة",description:"تحويل بين Binary و Decimal و Octal و Hex"},
password:{name:"مولد كلمات المرور",description:"إنشاء كلمات مرور قوية وآمنة"},
strength:{name:"فحص كلمة المرور",description:"تحليل قوة كلمة المرور"},
word:{name:"عداد النصوص",description:"حساب الكلمات والحروف والأسطر"},
json:{name:"JSON Formatter",description:"تنسيق والتحقق من JSON"},
base64:{name:"Base64",description:"ترميز وفك ترميز النصوص"},
url:{name:"URL Encoder",description:"ترميز وفك ترميز النصوص"},
color:{name:"محول الألوان",description:"تحويل HEX و RGB"},
uuid:{name:"UUID Generator",description:"إنشاء UUID جديد"},
random:{name:"مولد الأرقام",description:"إنشاء أرقام عشوائية"}
};

function showPage(id){
pages.forEach(page=>page.classList.remove("active"));

const page=document.getElementById(id);

if(!page)return;

page.classList.add("active");

navButtons.forEach(btn=>{
btn.classList.toggle("active",btn.dataset.page===id);
});

if(id==="favoritesPage")renderFavorites();
if(id==="recentPage")renderRecent();
if(id==="settingsPage")updateStats();

window.scrollTo(0,0);
}

navButtons.forEach(btn=>{
btn.onclick=()=>showPage(btn.dataset.page);
});

function showToast(message){
const toast=document.getElementById("toast");

toast.textContent=message;
toast.classList.add("show");

setTimeout(()=>{
toast.classList.remove("show");
},2500);
}

async function copyText(text){
if(!text)return;

try{
await navigator.clipboard.writeText(text);
showToast("تم النسخ بنجاح 📋");
}catch{
showToast("تعذر النسخ");
}
}

function openTool(tool){
if(!tools[tool])return;

currentTool=tool;

document.getElementById("toolTitle").textContent=tools[tool].name;
document.getElementById("toolDescription").textContent=tools[tool].description;

addRecent(tool);
updateFavoriteButton();
renderTool(tool);
showPage("toolPage");
}

document.querySelectorAll("[data-tool]").forEach(button=>{
button.onclick=()=>openTool(button.dataset.tool);
});

document.getElementById("backBtn").onclick=()=>{
showPage("homePage");
};

function getCalcHistory(){
return JSON.parse(localStorage.getItem("calcHistory")||"[]");
}

function saveCalcHistory(expression,result){
let history=getCalcHistory();

history.unshift({
expression,
result
});

history=history.slice(0,10);

localStorage.setItem("calcHistory",JSON.stringify(history));
}

function renderTool(tool){

const content=document.getElementById("toolContent");

if(tool==="calculator"){

content.innerHTML=`
<div class="calculator">

<input class="calc-display" id="calcDisplay" readonly placeholder="0">

<div class="calc-grid">

<button class="calc-btn danger" data-calc="clear">C</button>
<button class="calc-btn operator" data-calc="(">(</button>
<button class="calc-btn operator" data-calc=")">)</button>
<button class="calc-btn operator" data-calc="/">÷</button>

<button class="calc-btn" data-calc="7">7</button>
<button class="calc-btn" data-calc="8">8</button>
<button class="calc-btn" data-calc="9">9</button>
<button class="calc-btn operator" data-calc="*">×</button>

<button class="calc-btn" data-calc="4">4</button>
<button class="calc-btn" data-calc="5">5</button>
<button class="calc-btn" data-calc="6">6</button>
<button class="calc-btn operator" data-calc="-">−</button>

<button class="calc-btn" data-calc="1">1</button>
<button class="calc-btn" data-calc="2">2</button>
<button class="calc-btn" data-calc="3">3</button>
<button class="calc-btn operator" data-calc="+">+</button>

<button class="calc-btn" data-calc="0">0</button>
<button class="calc-btn" data-calc=".">.</button>
<button class="calc-btn" data-calc="back">⌫</button>
<button class="calc-btn equal" data-calc="=">=</button>

</div>

<div class="calc-history">
<h3>🕘 سجل العمليات</h3>
<div id="calcHistory"></div>
</div>

</div>
`;

let expression="";

const display=document.getElementById("calcDisplay");

function updateDisplay(){
display.value=expression
.replace(/\*/g,"×")
.replace(/\//g,"÷");
}

function renderHistory(){

const history=getCalcHistory();
const container=document.getElementById("calcHistory");

if(!history.length){
container.innerHTML="<p>لا توجد عمليات بعد.</p>";
return;
}

container.innerHTML=history.map(item=>`
<div class="history-item">
${item.expression} = ${item.result}
</div>
`).join("");

}

document.querySelectorAll("[data-calc]").forEach(btn=>{

btn.onclick=()=>{

const value=btn.dataset.calc;

if(value==="clear"){
expression="";
updateDisplay();
return;
}

if(value==="back"){
expression=expression.slice(0,-1);
updateDisplay();
return;
}

if(value==="="){

if(!expression)return;

try{

if(!/^[0-9+\-*/().]+$/.test(expression)){
throw new Error();
}

const result=Function(`"use strict";return (${expression})`)();

if(!Number.isFinite(result))throw new Error();

saveCalcHistory(expression,result);

expression=String(result);

updateDisplay();

renderHistory();

}catch{
showToast("عملية غير صحيحة");
}

return;
}

expression+=value;

updateDisplay();

};

});

renderHistory();

}

if(tool==="scientific"){

content.innerHTML=`
<div class="tool-box">

<div class="tool-form">

<input type="number" id="scientificInput" placeholder="أدخل رقمًا">

<div class="scientific-grid">

<button class="secondary-btn" data-scientific="sin">sin</button>
<button class="secondary-btn" data-scientific="cos">cos</button>
<button class="secondary-btn" data-scientific="tan">tan</button>

<button class="secondary-btn" data-scientific="sqrt">√</button>
<button class="secondary-btn" data-scientific="square">x²</button>
<button class="secondary-btn" data-scientific="log">log</button>

</div>

<div class="result-box" id="scientificResult">
أدخل رقمًا ثم اختر العملية
</div>

</div>

</div>
`;

document.querySelectorAll("[data-scientific]").forEach(btn=>{

btn.onclick=()=>{

const input=Number(document.getElementById("scientificInput").value);

if(!Number.isFinite(input)){
showToast("أدخل رقمًا صحيحًا");
return;
}

const operation=btn.dataset.scientific;

let result;

if(operation==="sin")result=Math.sin(input*Math.PI/180);
if(operation==="cos")result=Math.cos(input*Math.PI/180);
if(operation==="tan")result=Math.tan(input*Math.PI/180);
if(operation==="sqrt")result=Math.sqrt(input);
if(operation==="square")result=input**2;
if(operation==="log")result=Math.log10(input);

document.getElementById("scientificResult").textContent=result;

};

});

}

if(tool==="number"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<input id="numberInput" placeholder="أدخل الرقم">

<select id="numberBase">
<option value="2">Binary</option>
<option value="8">Octal</option>
<option value="10" selected>Decimal</option>
<option value="16">Hexadecimal</option>
</select>

<button class="primary-btn" id="convertBtn">تحويل</button>

<div class="result-grid">

<div class="result-item"><strong>Binary</strong><span id="binary">-</span></div>
<div class="result-item"><strong>Decimal</strong><span id="decimal">-</span></div>
<div class="result-item"><strong>Octal</strong><span id="octal">-</span></div>
<div class="result-item"><strong>Hexadecimal</strong><span id="hex">-</span></div>

</div>

</div>
</div>
`;

document.getElementById("convertBtn").onclick=()=>{

const input=document.getElementById("numberInput").value.trim();
const base=Number(document.getElementById("numberBase").value);

const patterns={
2:/^[01]+$/,
8:/^[0-7]+$/,
10:/^[0-9]+$/,
16:/^[0-9a-fA-F]+$/
};

if(!input||!patterns[base].test(input)){
showToast("الرقم غير صالح");
return;
}

const number=parseInt(input,base);

document.getElementById("binary").textContent=number.toString(2);
document.getElementById("decimal").textContent=number.toString(10);
document.getElementById("octal").textContent=number.toString(8);
document.getElementById("hex").textContent=number.toString(16).toUpperCase();

};

}

if(tool==="password"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<select id="passwordLength">
<option value="8">8 أحرف</option>
<option value="12" selected>12 حرفًا</option>
<option value="16">16 حرفًا</option>
<option value="20">20 حرفًا</option>
<option value="32">32 حرفًا</option>
</select>

<button class="primary-btn" id="generatePassword">إنشاء كلمة مرور</button>

<div class="result-box" id="passwordResult">اضغط على إنشاء</div>

<button class="secondary-btn" id="copyPassword">📋 نسخ</button>

</div>
</div>
`;

document.getElementById("generatePassword").onclick=()=>{

const length=Number(document.getElementById("passwordLength").value);

const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const random=new Uint32Array(length);

crypto.getRandomValues(random);

let password="";

random.forEach(value=>{
password+=chars[value%chars.length];
});

document.getElementById("passwordResult").textContent=password;

};

document.getElementById("copyPassword").onclick=()=>{
copyText(document.getElementById("passwordResult").textContent);
};

}

if(tool==="strength"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<input type="password" id="strengthInput" placeholder="أدخل كلمة المرور">

<div class="result-box" id="strengthResult">
أدخل كلمة المرور للفحص
</div>

</div>
</div>
`;

document.getElementById("strengthInput").oninput=e=>{

const password=e.target.value;

let score=0;

if(password.length>=8)score++;
if(password.length>=12)score++;
if(/[A-Z]/.test(password))score++;
if(/[a-z]/.test(password))score++;
if(/[0-9]/.test(password))score++;
if(/[^A-Za-z0-9]/.test(password))score++;

let result="ضعيفة جدًا 🔴";

if(score>=3)result="متوسطة 🟡";
if(score>=5)result="قوية 🟢";
if(score===6)result="قوية جدًا 🔥";

if(!password)result="أدخل كلمة المرور للفحص";

document.getElementById("strengthResult").textContent=result;

};

}

if(tool==="word"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<textarea id="wordInput" placeholder="اكتب النص هنا..."></textarea>

<div class="result-grid">

<div class="result-item"><strong>الكلمات</strong><span id="wordCount">0</span></div>
<div class="result-item"><strong>الحروف</strong><span id="charCount">0</span></div>
<div class="result-item"><strong>الأسطر</strong><span id="lineCount">0</span></div>
<div class="result-item"><strong>بدون مسافات</strong><span id="noSpaceCount">0</span></div>

</div>

</div>
</div>
`;

document.getElementById("wordInput").oninput=e=>{

const text=e.target.value;

document.getElementById("wordCount").textContent=
text.trim()?text.trim().split(/\s+/).length:0;

document.getElementById("charCount").textContent=text.length;

document.getElementById("lineCount").textContent=
text?text.split("\n").length:0;

document.getElementById("noSpaceCount").textContent=
text.replace(/\s/g,"").length;

};

}

if(tool==="json"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<textarea id="jsonInput" placeholder='{"name":"Ahmed"}'></textarea>

<button class="primary-btn" id="formatJson">تنسيق JSON</button>
<button class="secondary-btn" id="minifyJson">ضغط JSON</button>

<textarea id="jsonOutput" readonly placeholder="النتيجة"></textarea>

<button class="secondary-btn" id="copyJson">📋 نسخ</button>

</div>
</div>
`;

document.getElementById("formatJson").onclick=()=>{

try{

const data=JSON.parse(document.getElementById("jsonInput").value);

document.getElementById("jsonOutput").value=
JSON.stringify(data,null,4);

showToast("JSON صحيح ✓");

}catch{
showToast("JSON غير صحيح");
}

};

document.getElementById("minifyJson").onclick=()=>{

try{

const data=JSON.parse(document.getElementById("jsonInput").value);

document.getElementById("jsonOutput").value=
JSON.stringify(data);

}catch{
showToast("JSON غير صحيح");
}

};

document.getElementById("copyJson").onclick=()=>{
copyText(document.getElementById("jsonOutput").value);
};

}

if(tool==="base64"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<textarea id="baseInput" placeholder="أدخل النص"></textarea>

<button class="primary-btn" id="encodeBase">Encode</button>
<button class="secondary-btn" id="decodeBase">Decode</button>

<textarea id="baseOutput" readonly placeholder="النتيجة"></textarea>

<button class="secondary-btn" id="copyBase">📋 نسخ</button>

</div>
</div>
`;

document.getElementById("encodeBase").onclick=()=>{

try{

const text=document.getElementById("baseInput").value;

document.getElementById("baseOutput").value=
btoa(unescape(encodeURIComponent(text)));

}catch{
showToast("حدث خطأ");
}

};

document.getElementById("decodeBase").onclick=()=>{

try{

const text=document.getElementById("baseInput").value;

document.getElementById("baseOutput").value=
decodeURIComponent(escape(atob(text)));

}catch{
showToast("النص غير صالح");
}

};

document.getElementById("copyBase").onclick=()=>{
copyText(document.getElementById("baseOutput").value);
};

}

if(tool==="url"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<textarea id="urlInput" placeholder="أدخل النص أو الرابط"></textarea>

<button class="primary-btn" id="encodeUrl">Encode</button>
<button class="secondary-btn" id="decodeUrl">Decode</button>

<textarea id="urlOutput" readonly placeholder="النتيجة"></textarea>

<button class="secondary-btn" id="copyUrl">📋 نسخ</button>

</div>
</div>
`;

document.getElementById("encodeUrl").onclick=()=>{
document.getElementById("urlOutput").value=
encodeURIComponent(document.getElementById("urlInput").value);
};

document.getElementById("decodeUrl").onclick=()=>{

try{

document.getElementById("urlOutput").value=
decodeURIComponent(document.getElementById("urlInput").value);

}catch{
showToast("النص غير صالح");
}

};

document.getElementById("copyUrl").onclick=()=>{
copyText(document.getElementById("urlOutput").value);
};

}

if(tool==="color"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<input id="colorInput" placeholder="#2563EB">

<button class="primary-btn" id="convertColor">تحويل</button>

<div class="result-box" id="colorResult">
أدخل لون HEX
</div>

</div>
</div>
`;

document.getElementById("convertColor").onclick=()=>{

let hex=document.getElementById("colorInput").value
.trim()
.replace("#","");

if(!/^[0-9A-Fa-f]{6}$/.test(hex)){
showToast("أدخل HEX صحيح");
return;
}

const r=parseInt(hex.substring(0,2),16);
const g=parseInt(hex.substring(2,4),16);
const b=parseInt(hex.substring(4,6),16);

document.getElementById("colorResult").innerHTML=`
<div style="height:70px;border-radius:14px;background:#${hex};margin-bottom:15px"></div>
HEX: #${hex.toUpperCase()}<br>
RGB: rgb(${r}, ${g}, ${b})
`;

};

}

if(tool==="uuid"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<button class="primary-btn" id="generateUuid">إنشاء UUID</button>

<div class="result-box" id="uuidResult">
اضغط على إنشاء
</div>

<button class="secondary-btn" id="copyUuid">📋 نسخ</button>

</div>
</div>
`;

document.getElementById("generateUuid").onclick=()=>{

document.getElementById("uuidResult").textContent=
crypto.randomUUID();

};

document.getElementById("copyUuid").onclick=()=>{
copyText(document.getElementById("uuidResult").textContent);
};

}

if(tool==="random"){

content.innerHTML=`
<div class="tool-box">
<div class="tool-form">

<input type="number" id="minRandom" value="1">
<input type="number" id="maxRandom" value="100">

<button class="primary-btn" id="generateRandom">إنشاء رقم</button>

<div class="result-box" id="randomResult">🎲</div>

</div>
</div>
`;

document.getElementById("generateRandom").onclick=()=>{

const min=Number(document.getElementById("minRandom").value);
const max=Number(document.getElementById("maxRandom").value);

if(!Number.isFinite(min)||!Number.isFinite(max)||min>max){
showToast("أدخل نطاقًا صحيحًا");
return;
}

const random=Math.floor(Math.random()*(max-min+1))+min;

document.getElementById("randomResult").textContent=random;

};

}

}

function getRecent(){
return JSON.parse(localStorage.getItem("recentTools")||"[]");
}

function addRecent(tool){

let recent=getRecent();

recent=recent.filter(item=>item!==tool);

recent.unshift(tool);

recent=recent.slice(0,10);

localStorage.setItem("recentTools",JSON.stringify(recent));

const total=Number(localStorage.getItem("totalUsage")||0);

localStorage.setItem("totalUsage",total+1);
}

function createToolCard(tool){

const button=document.createElement("button");

button.className="tool-card";

button.innerHTML=`
<div class="tool-icon">🧰</div>
<div>
<h3>${tools[tool].name}</h3>
<p>${tools[tool].description}</p>
</div>
<span>←</span>
`;

button.onclick=()=>openTool(tool);

return button;
}

function renderRecent(){

const container=document.getElementById("recentList");

const recent=getRecent();

container.innerHTML="";

if(!recent.length){
container.innerHTML="<p>لم تستخدم أي أداة بعد.</p>";
return;
}

recent.forEach(tool=>{
if(tools[tool]){
container.appendChild(createToolCard(tool));
}
});

}

document.getElementById("clearRecent").onclick=()=>{

localStorage.removeItem("recentTools");

renderRecent();

showToast("تم مسح السجل");
};

function getFavorites(){
return JSON.parse(localStorage.getItem("favorites")||"[]");
}

function updateFavoriteButton(){

const favorites=getFavorites();

document.getElementById("favoriteBtn").textContent=
favorites.includes(currentTool)?"★":"☆";
}

document.getElementById("favoriteBtn").onclick=()=>{

if(!currentTool)return;

let favorites=getFavorites();

if(favorites.includes(currentTool)){

favorites=favorites.filter(tool=>tool!==currentTool);

showToast("تمت الإزالة من المفضلة");

}else{

favorites.push(currentTool);

showToast("تمت الإضافة إلى المفضلة ⭐");

}

localStorage.setItem("favorites",JSON.stringify(favorites));

updateFavoriteButton();

};

function renderFavorites(){

const container=document.getElementById("favoritesList");

const favorites=getFavorites();

container.innerHTML="";

if(!favorites.length){

container.innerHTML="<p>لا توجد أدوات في المفضلة حتى الآن ⭐</p>";

return;
}

favorites.forEach(tool=>{
if(tools[tool]){
container.appendChild(createToolCard(tool));
}
});

}

document.getElementById("shareBtn").onclick=async()=>{

if(!currentTool)return;

try{

if(navigator.share){

await navigator.share({
title:tools[currentTool].name,
text:tools[currentTool].description,
url:location.href
});

}else{

copyText(location.href);

}

}catch{}

};

function applyTheme(mode){

document.body.classList.remove("dark");

if(mode==="dark"){
document.body.classList.add("dark");
}

if(mode==="auto"&&window.matchMedia("(prefers-color-scheme:dark)").matches){
document.body.classList.add("dark");
}

themeBtn.textContent=
document.body.classList.contains("dark")?"☀️":"🌙";
}

function setTheme(mode){

localStorage.setItem("theme",mode);

themeSelect.value=mode;

applyTheme(mode);
}

themeBtn.onclick=()=>{

const isDark=document.body.classList.contains("dark");

setTheme(isDark?"light":"dark");
};

themeSelect.onchange=()=>{

setTheme(themeSelect.value);

showToast("تم تغيير المظهر 🎨");
};

const savedTheme=localStorage.getItem("theme")||"auto";

setTheme(savedTheme);

function updateStats(){

const total=Number(localStorage.getItem("totalUsage")||0);

document.getElementById("statsText").textContent=
`استخدمت الأدوات ${total} مرة. لديك ${getFavorites().length} أدوات في المفضلة.`;
}

document.getElementById("resetData").onclick=()=>{

if(!confirm("هل تريد حذف جميع البيانات؟"))return;

localStorage.clear();

showToast("تم حذف البيانات");

setTimeout(()=>{
location.reload();
},800);
};

function updateToolsCount(){

document.getElementById("toolsCount").textContent=
`${Object.keys(tools).length} أداة`;

}

updateToolsCount();

if(searchInput){

searchInput.addEventListener("input",()=>{

const value=searchInput.value.toLowerCase();

document.querySelectorAll(".tool-card[data-tool]").forEach(card=>{

const text=card.textContent.toLowerCase();

card.style.display=text.includes(value)?"flex":"none";

});

});

}

document.querySelectorAll(".category").forEach(button=>{

button.onclick=()=>{

document.querySelectorAll(".category").forEach(btn=>{
btn.classList.remove("active");
});

button.classList.add("active");

const category=button.dataset.category;

document.querySelectorAll(".tool-card[data-category]").forEach(card=>{

const show=category==="all"||card.dataset.category===category;

card.style.display=show?"flex":"none";

});

};

});

if("serviceWorker" in navigator){

window.addEventListener("load",()=>{

navigator.serviceWorker.register("service-worker.js")
.catch(()=>{});

});

  }
