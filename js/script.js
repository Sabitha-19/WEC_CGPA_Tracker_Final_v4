const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

const departments = {
  engineering: ["CSE", "ISE", "ECE", "EEE", "AA"],
  bcom: ["BCOM"]
};

let state = {
  stream: null,
  dept: null,
  sem: null,
  subjects: [],
  grades: {},
  gpaHistory: Array(8).fill(null)
};

let chart;

/* ---------- UI HELPERS ---------- */
function show(id){
  document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/* ---------- STREAM ---------- */
function selectStream(s){
  state.stream = s;
  const d = document.getElementById("deptList");
  d.innerHTML = "";

  departments[s].forEach(dep=>{
    d.innerHTML += `<button onclick="selectDept('${dep}')">${dep}</button>`;
  });

  show("department");
}

/* ---------- DEPARTMENT ---------- */
function selectDept(dep){
  state.dept = dep;
  const s = document.getElementById("semList");
  s.innerHTML = "";

  for(let i=1;i<=8;i++){
    s.innerHTML += `<button onclick="selectSem(${i})">Semester ${i}</button>`;
  }

  show("semester");
}

/* ---------- SEMESTER ---------- */
async function selectSem(sem){
  state.sem = sem;
  state.grades = {};
  document.getElementById("semTitle").textContent = `Semester ${sem}`;

  await loadSubjects(state.dept, sem);
  show("subjects");
}

/* ---------- LOAD SUBJECTS FROM JSON ---------- */
async function loadSubjects(dept, sem) {
  const list = document.getElementById("subjectList");
  list.innerHTML = "Loading...";

  try {
    const res = await fetch(`data/${dept.toLowerCase()}_sem${sem}.json`);
    if (!res.ok) throw new Error("File not found");

    const data = await res.json();
    state.subjects = data.subjects;
    renderSubjects();

  } catch (err) {
    list.innerHTML = "";
    alert("Subjects not available for this semester");
    console.error(err);
  }
}

/* ---------- RENDER SUBJECTS ---------- */
function renderSubjects(){
  const list = document.getElementById("subjectList");
  list.innerHTML = "";

  state.subjects.forEach((sub, i) => {
    list.innerHTML += `
      <div class="card">
        <strong>${sub.code}</strong> – ${sub.name}
        <span>(${sub.credits} credits)</span>
        <select onchange="state.grades[${i}] = gradePoints[this.value]">
          <option value="">Grade</option>
          ${Object.keys(gradePoints).map(g => `<option value="${g}">${g}</option>`).join("")}
        </select>
      </div>
    `;
  });
}

/* ---------- GPA ---------- */
function calculateGPA(){
  let total = 0, credits = 0;

  state.subjects.forEach((s,i)=>{
    if(state.grades[i] == null){
      alert("Please select all grades");
      throw "";
    }
    total += state.grades[i] * s.credits;
    credits += s.credits;
  });

  const gpa = +(total / credits).toFixed(2);
  state.gpaHistory[state.sem - 1] = gpa;

  document.getElementById("gpa").textContent = gpa;
  document.getElementById("cgpa").textContent = calcCGPA();

  drawChart();
  show("result");
}

/* ---------- CGPA ---------- */
function calcCGPA(){
  const valid = state.gpaHistory.filter(x => x != null);
  return (valid.reduce((a,b)=>a+b,0) / valid.length).toFixed(2);
}

/* ---------- CHART ---------- */
function drawChart(){
  if(chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: state.gpaHistory.map((_,i)=>`Sem ${i+1}`),
      datasets: [{
        data: state.gpaHistory,
        borderColor: "#6d28d9",
        tension: 0.3
      }]
    },
    options: {
      scales: { y: { min: 0, max: 10 } }
    }
  });
}