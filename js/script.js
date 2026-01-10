// ---------- STATE ----------
let state = {
  stream: null,
  dept: null,
  sem: null,
  subjects: [],
  grades: {},
  history: ["welcomeSection"]
};

// Load saved data from LocalStorage
const savedData = JSON.parse(localStorage.getItem("wecCGPA")) || {};
if(savedData.stream) state.stream = savedData.stream;
if(savedData.dept) state.dept = savedData.dept;
if(savedData.sem) state.sem = savedData.sem;
if(savedData.grades) state.grades = savedData.grades;
if(savedData.gpaHistory) state.gpaHistory = savedData.gpaHistory;
else state.gpaHistory = [];

// ---------- UTILITY ----------
function saveState() {
  localStorage.setItem("wecCGPA", JSON.stringify({
    stream: state.stream,
    dept: state.dept,
    sem: state.sem,
    grades: state.grades,
    gpaHistory: state.gpaHistory
  }));
}

function showSection(id) {
  document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  if(state.history[state.history.length-1] !== id) state.history.push(id);
}

// ---------- NAVIGATION ----------
document.querySelectorAll(".back-btn").forEach(btn => {
  btn.onclick = () => {
    if(state.history.length > 1){
      state.history.pop();
      showSection(state.history[state.history.length-1]);
    }
  };
});

document.getElementById("homeBtn").onclick = () => {
  state.history = ["welcomeSection"];
  showSection("welcomeSection");
};

document.getElementById("graphBtn").onclick = () => {
  renderGraph();
  showSection("resultSection");
};

document.getElementById("saveBtn").onclick = () => {
  alert("All semester GPA saved automatically!");
};

// ---------- STREAM SELECTION ----------
document.querySelectorAll(".stream-btn").forEach(btn => {
  btn.onclick = () => {
    state.stream = btn.dataset.stream;
    loadDepartments();
    showSection("departmentSection");
    saveState();
  };
});

// ---------- LOAD DEPARTMENTS ----------
function loadDepartments() {
  const list = document.getElementById("departmentList");
  list.innerHTML = "";

  let depts = [];
  if(state.stream === "engineering") depts = ["ISE", "CSE", "ECE", "EEE", "AA"];
  else if(state.stream === "bcom") depts = ["BCom_General", "BCom_CS"];

  depts.forEach(d => {
    const b = document.createElement("button");
    b.className = "grid-item-btn";
    if(state.dept === d) b.classList.add("active");
    b.textContent = d.replace('_',' ');
    b.onclick = () => {
      state.dept = d;
      saveState();
      loadSemesters();
      showSection("semesterSection");
    };
    list.appendChild(b);
  });
}

// ---------- LOAD SEMESTERS ----------
function loadSemesters() {
  const list = document.getElementById("semesterList");
  list.innerHTML = "";

  const maxSem = (state.stream === "engineering") ? 8 : 6;

  for(let i=1; i<=maxSem; i++){
    const b = document.createElement("button");
    b.className = "grid-item-btn";
    if(state.sem === i) b.classList.add("active");
    b.textContent = `Semester ${i}`;
    b.onclick = () => {
      state.sem = i;
      saveState();
      loadSubjects();
    };
    list.appendChild(b);
  }
}

// ---------- LOAD SUBJECTS ----------
function loadSubjects() {
  const deptName = state.dept.toLowerCase().replace(' ','');
  const path = `data/${deptName}_sem${state.sem}.json`;

  fetch(path)
    .then(r => r.json())
    .then(data => {
      state.subjects = data.subjects;
      renderSubjects();
      showSection("subjectsSection");
    })
    .catch(() => alert(`JSON file not found: ${path}`));
}

// ---------- RENDER SUBJECTS ----------
function renderSubjects() {
  const container = document.getElementById("subjects");
  container.innerHTML = "";

  state.subjects.forEach((s, idx) => {
    const selectedGrade = state.grades[s.code] || '';
    const div = document.createElement("div");
    div.className = "subject-card";
    div.innerHTML = `
      <div><b>${s.name}</b> (${s.credits} Credits)</div>
      <div class="grade-row">
        ${['S','A','B','C','D','E','F'].map(g => {
          const pts = {'S':10,'A':9,'B':8,'C':7,'D':6,'E':5,'F':0}[g];
          const active = state.grades[s.code]===pts ? 'active' : '';
          return `<div class="g-box ${active}" onclick="setGrade(${idx},'${g}',this)">${g}</div>`;
        }).join('')}
      </div>
    `;
    container.appendChild(div);
  });
}

// ---------- SET GRADE ----------
function setGrade(i, g, el){
  const gradePts = {'S':10,'A':9,'B':8,'C':7,'D':6,'E':5,'F':0};
  state.grades[state.subjects[i].code] = gradePts[g];
  el.parentElement.querySelectorAll('.g-box').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  saveState();
}

// ---------- CALCULATE GPA ----------
document.getElementById("calculateGPA").onclick = () => {
  if(!state.subjects.length) return;
  let totalPts = 0, totalCredits = 0;
  for(let s of state.subjects){
    if(state.grades[s.code] === undefined){
      alert(`Select grades for all subjects!`);
      return;
    }
    totalPts += s.credits * state.grades[s.code];
    totalCredits += s.credits;
  }
  const gpa = (totalPts / totalCredits).toFixed(2);
  // Save GPA in history
  state.gpaHistory[state.sem-1] = parseFloat(gpa);
  saveState();
  document.getElementById("gpa").textContent = gpa;
  renderGraph();
  showSection("resultSection");
};

// ---------- CGPA GRAPH ----------
let chartInstance = null;
function renderGraph(){
  const ctx = document.getElementById("graph").getContext("2d");
  const labels = state.gpaHistory.map((_, i) => `Sem ${i+1}`);
  const data = state.gpaHistory.map(g => g || 0);

  if(chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Semester GPA',
        data: data,
        fill: false,
        borderColor: '#6d28d9',
        backgroundColor: '#6d28d9',
        tension: 0.2
      }]
    },
    options: {
      scales: {
        y: { min:0, max:10 }
      }
    }
  });
}

// ---------- CGPA to Percentage ----------
function convertToPercentage(){
  const val = parseFloat(document.getElementById("cgpaInput").value);
  if(isNaN(val)){
    document.getElementById("percentResult").textContent = "Enter a valid CGPA!";
    return;
  }
  const percent = (val*10).toFixed(1);
  document.getElementById("percentResult").innerHTML = `Percentage: <b>${percent}%</b>`;
}

// ---------- INIT ----------
if(state.stream) loadDepartments();
if(state.sem) loadSemesters();
if(state.dept && state.sem) loadSubjects();