// ===== Grade Points =====
const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

// ===== Streams & Departments =====
const departments = {
  engineering: ["CSE","ISE","ECE","EEE","AA"],
  bcom: ["BCOM"]
};

let state = { stream:null, dept:null, sem:null, grades:{}, gpaHistory:Array(8).fill(null) };

// ===== UTILITIES =====
function show(id){
  document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ===== START BUTTON =====
document.getElementById("startBtn").onclick = ()=>show("stream");

// ===== STREAM =====
const streamDiv = document.getElementById("streamList");
departments.engineering.concat(departments.bcom).forEach(s=>{
  const btn=document.createElement("button");
  btn.textContent = s;
  btn.onclick = () => selectStream(s);
  streamDiv.appendChild(btn);
});
function selectStream(s){
  state.stream = (departments.engineering.includes(s)) ? "engineering":"bcom";
  selectDepartmentPage();
}

// ===== DEPARTMENT =====
function selectDepartmentPage(){
  const deptDiv = document.getElementById("deptList");
  deptDiv.innerHTML = "";
  departments[state.stream].forEach(dep=>{
    const btn = document.createElement("button");
    btn.textContent = dep;
    btn.onclick = () => selectDept(dep, btn);
    deptDiv.appendChild(btn);
  });
  show("department");
}
function selectDept(dep, btn){
  state.dept = dep;
  // Active button color
  document.querySelectorAll("#deptList button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  selectSemesterPage();
}

// ===== SEMESTER =====
function selectSemesterPage(){
  const semDiv = document.getElementById("semList");
  semDiv.innerHTML = "";
  for(let i=1;i<=8;i++){
    const btn = document.createElement("button");
    btn.textContent = "Semester " + i;
    btn.onclick = ()=>selectSem(i, btn);
    semDiv.appendChild(btn);
  }
  show("semester");
}
function selectSem(sem, btn){
  state.sem = sem;
  document.querySelectorAll("#semList button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  loadSubjects();
}

// ===== SUBJECTS =====
async function loadSubjects(){
  const list = document.getElementById("subjectList");
  list.innerHTML = "";
  document.getElementById("semTitle").innerText = "Semester " + state.sem;
  
  try{
    const filePath = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
    const res = await fetch(filePath);
    if(!res.ok) throw new Error("File not found");
    const subjects = await res.json();
    subjects.forEach((sub,i)=>{
      const card = document.createElement("div");
      card.className="card";
      card.innerHTML = `
        ${sub.name} (${sub.credits} credits)
        <select onchange="state.grades[${i}]=gradePoints[this.value]">
          <option value="">Grade</option>
          ${Object.keys(gradePoints).map(g=>`<option>${g}</option>`).join("")}
        </select>
      `;
      list.appendChild(card);
    });
    loadSavedGrades();
    show("subjects");
  }catch(e){
    alert("Subject file not found: " + e.message);
  }
}

// ===== CALCULATE GPA =====
document.getElementById("calcGPA").onclick = ()=>{
  const cards = document.querySelectorAll("#subjectList .card select");
  for(let i=0;i<cards.length;i++){
    if(!cards[i].value){ alert("Please select all grades!"); return; }
    state.grades[i]=gradePoints[cards[i].value];
  }

  const subjects = Object.values(state.grades);
  const creditsSum = cards.length > 0 ? Array.from(cards).reduce((a,c)=>a + parseInt(c.parentElement.textContent.match(/\d+/)[0]),0) : 1;
  let total=0;
  cards.forEach((c,i)=>{
    const credit = parseInt(c.parentElement.textContent.match(/\d+/)[0]);
    total += state.grades[i]*credit;
  });
  const gpa = +(total/creditsSum).toFixed(2);
  state.gpaHistory[state.sem-1] = gpa;
  saveSemesterData(); // auto-save
  document.getElementById("gpa").innerText = gpa;
  document.getElementById("cgpa").innerText = calcCGPA();
  document.getElementById("percentage").innerText = (calcCGPA()*9.5).toFixed(2) + "%";
  document.getElementById("encouragement").innerText = gpa>=8 ? "Excellent work! Keep it up 🎉" : gpa>=6 ? "Good effort! You can improve 👍" : "Focus more! You can do it 💪";
  drawChart();
  show("result");
}

// ===== CALCULATE CGPA =====
function calcCGPA(){
  const valid = state.gpaHistory.filter(x=>x!=null);
  if(valid.length===0) return 0;
  return +(valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2);
}

// ===== BACK BUTTONS =====
document.querySelectorAll(".back").forEach(b=>{
  b.onclick = ()=>show(b.dataset.target);
});