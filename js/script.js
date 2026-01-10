const EIGHT_SEM_DEPTS = ["ise", "cse", "ece", "eee", "aa"];
const SIX_SEM_DEPTS = ["bcom"];

const state = {
  stream: null,
  dept: null,
  sem: null,
  grades: {}
};

const screens = ["screen-stream", "screen-dept", "screen-sem", "screen-subjects", "screen-result"];
let history = [];

function show(id) {
  screens.forEach(s => document.getElementById(s).classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function goBack() {
  history.pop();
  show(history.pop() || "screen-stream");
}

function selectStream(s) {
  state.stream = s;
  history.push("screen-stream");
  loadDepartments();
}

function loadDepartments() {
  const list = document.getElementById("deptList");
  list.innerHTML = "";

  const depts = state.stream === "engineering"
    ? ["ise","cse","ece","eee","aa"]
    : ["bcom"];

  depts.forEach(d => {
    const b = document.createElement("button");
    b.className = "grid-item-btn";
    b.textContent = d.toUpperCase();
    b.onclick = () => selectDept(d);
    list.appendChild(b);
  });

  show("screen-dept");
}

function selectDept(d) {
  state.dept = d;
  history.push("screen-dept");
  loadSemesters();
}

function loadSemesters() {
  const list = document.getElementById("semList");
  list.innerHTML = "";

  const max = EIGHT_SEM_DEPTS.includes(state.dept) ? 8 : 6;

  for (let i = 1; i <= max; i++) {
    const b = document.createElement("button");
    b.className = "grid-item-btn";
    b.textContent = "Semester " + i;
    b.onclick = () => selectSem(i);
    list.appendChild(b);
  }

  show("screen-sem");
}

async function selectSem(s) {
  state.sem = s;
  history.push("screen-sem");

  const res = await fetch(`data/${state.dept}_sem${s}.json`);
  const subjects = await res.json();

  const box = document.getElementById("subjects");
  box.innerHTML = "";
  state.grades = {};

  document.getElementById("title").textContent =
    `${state.dept.toUpperCase()} - Semester ${s}`;

  subjects.forEach(sub => {
    const card = document.createElement("div");
    card.className = "subject-card";
    card.innerHTML = `<strong>${sub.name}</strong>`;

    const row = document.createElement("div");
    row.className = "grade-row";

    ["S","A","B","C","D","E","F"].forEach((g, i) => {
      const pts = [10,9,8,7,6,5,0][i];
      const b = document.createElement("div");
      b.className = "g-box";
      b.textContent = g;
      b.onclick = () => {
        row.querySelectorAll(".g-box").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        state.grades[sub.code] = pts;
      };
      row.appendChild(b);
    });

    card.appendChild(row);
    box.appendChild(card);
  });

  show("screen-subjects");
}

function saveSemester() {
  const values = Object.values(state.grades);
  if (!values.length) return alert("Select grades");

  const gpa = values.reduce((a,b)=>a+b,0)/values.length;
  const saved = JSON.parse(localStorage.getItem("cgpa") || "[]");
  saved[state.sem-1] = gpa;
  localStorage.setItem("cgpa", JSON.stringify(saved));
  renderResult(saved);
}

function renderResult(data) {
  const cgpa = data.reduce((a,b)=>a+b,0)/data.length;
  document.getElementById("cgpa").textContent = cgpa.toFixed(2);

  const ctx = document.getElementById("graph").getContext("2d");
  ctx.clearRect(0,0,300,200);

  ctx.beginPath();
  data.forEach((v,i)=>{
    const x = i*40+20;
    const y = 180-v*15;
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });
  ctx.strokeStyle = "#6d28d9";
  ctx.stroke();

  show("screen-result");
}