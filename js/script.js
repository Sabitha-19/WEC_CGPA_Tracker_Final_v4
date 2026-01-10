// ---------- Constants ----------
const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };
const gradeColors = { S:"#4ade80", A:"#22d3ee", B:"#facc15", C:"#f97316", D:"#f43f5e", E:"#a78bfa", F:"#000000" };
const departments = { engineering:["CSE","ISE","ECE","EEE","AA"], bcom:["BCOM"] };

// ---------- State ----------
let state = {
  stream:null,
  dept:null,
  sem:null,
  subjects:[],
  grades:{},
  gpaHistory:Array(8).fill(null)
};

let chart = null;

// ---------- Section Navigation ----------
function show(id){
  document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ---------- Stream Selection ----------
function selectStream(stream){
  state.stream = stream;
  state.dept = null;
  state.sem = null;
  state.subjects = [];
  state.grades = {};

  const deptList = document.getElementById("departmentList");
  deptList.innerHTML = "";
  departments[stream].forEach(dep=>{
    const btn = document.createElement("button");
    btn.textContent = dep;
    btn.onclick = ()=> selectDept(dep);
    deptList.appendChild(btn);
  });
  show("departmentSection");
}

// ---------- Department Selection ----------
function selectDept(dept){
  state.dept = dept;
  state.sem = null;
  state.subjects = [];
  state.grades = {};

  const semList = document.getElementById("semesterList");
  semList.innerHTML = "";
  const maxSem = state.stream === "engineering" ? 8 : 8; // BCOM 8 sem also if you have data
  for(let i=1;i<=maxSem;i++){
    const btn = document.createElement("button");
    btn.textContent = `Semester ${i}`;
    btn.onclick = ()=> selectSem(i);
    semList.appendChild(btn);
  }
  show("semesterSection");
}

// ---------- Semester Selection ----------
async function selectSem(sem){
  state.sem = sem;
  state.subjects = [];
  state.grades = {};

  const semTitle = document.getElementById("semHeader");
  semTitle.textContent = `${state.dept} - Semester ${sem}`;

  const container = document.getElementById("subjects");
  container.innerHTML = "";

  try{
    const res = await fetch(`data/${state.dept.toLowerCase()}_sem${sem}.json`);
    if(!res.ok) throw new Error("File not found");
    const data = await res.json();
    state.subjects = data.subjects;

    state.subjects.forEach((sub, i)=>{
      const card = document.createElement("div");
      card.className = "subject-card";
      card.innerHTML = `
        <div><b>${sub.name}</b> (${sub.credits} credits)</div>
        <div class="grade-row">
          ${Object.keys(gradePoints).map(g=>{
            return `<div class="g-box" style="background:#ddd; color:#fff; cursor:pointer;" 
            onclick="setGrade(${i},'${g}',this)">${g}</div>`;
          }).join("")}
        </div>
      `;
      container.appendChild(card);
    });

    show("subjectsSection");
  }catch(err){
    alert("Subjects not found for this semester");
    console.error(err);
  }
}

// ---------- Set Grade ----------
function setGrade(i, g, el){
  state.grades[i] = gradePoints[g];
  // update cube colours
  const boxes = el.parentElement.querySelectorAll(".g-box");
  boxes.forEach(b=>{
    b.style.background = "#ddd";
  });
  el.style.background = gradeColors[g] || "#7c3aed";
}

// ---------- Calculate GPA ----------
function calculateGPA(){
  if(state.subjects.length === 0){
    alert("No subjects loaded!");
    return;
  }
  let total=0, credits=0;
  for(let i=0;i<state.subjects.length;i++){
    if(state.grades[i]===undefined){
      alert("Select grades for all subjects!");
      return;
    }
    total += state.grades[i]*state.subjects[i].credits;
    credits += state.subjects[i].credits;
  }
  const gpa = +(total/credits).toFixed(2);
  state.gpaHistory[state.sem-1] = gpa;

  document.getElementById("gpa").textContent = gpa;
  document.getElementById("cgpaResult").textContent = calcCGPA();
  drawGraph();
  show("resultSection");
}

// ---------- Calculate CGPA ----------
function calcCGPA(){
  const valid = state.gpaHistory.filter(x=>x!=null);
  if(valid.length===0) return 0;
  return (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2);
}

// ---------- Draw Graph ----------
function drawGraph(){
  const ctx = document.getElementById("graph").getContext("2d");
  if(chart) chart.destroy();
  chart = new Chart(ctx,{
    type:"line",
    data:{
      labels:state.gpaHistory.map((_,i)=>`Sem ${i+1}`),
      datasets:[{
        label:"GPA",
        data:state.gpaHistory,
        borderColor:"#7c3aed",
        borderWidth:3,
        fill:false,
        pointBackgroundColor:"#7c3aed"
      }]
    },
    options:{scales:{y:{min:0,max:10}}}
  });
}

// ---------- CGPA to % ----------
function convertToPercentage(){
  const cgpa = parseFloat(document.getElementById("cgpaInput").value);
  if(isNaN(cgpa)){ alert("Enter valid CGPA"); return; }
  document.getElementById("percentResult").textContent = `${(cgpa*9.5).toFixed(2)}%`;
}