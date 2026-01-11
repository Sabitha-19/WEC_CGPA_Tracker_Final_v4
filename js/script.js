let state = {
  stream: "",
  dept: "",
  sem: "",
  gpas: []
};

const gradeMap = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
}

function selectStream(stream) {
  state.stream = stream;
  loadDepartments();
  showSection("department");
}

function loadDepartments() {
  const depts = ["cse","ise","ece","eee","aa"];
  const box = document.getElementById("deptButtons");
  box.innerHTML = "";

  depts.forEach(d => {
    const btn = document.createElement("button");
    btn.textContent = d.toUpperCase();
    btn.onclick = () => {
      state.dept = d;
      loadSemesters();
    };
    box.appendChild(btn);
  });
}

function loadSemesters() {
  const max = state.stream === "engineering" ? 8 : 6;
  const box = document.getElementById("semButtons");
  box.innerHTML = "";

  for(let i=1;i<=max;i++){
    const btn = document.createElement("button");
    btn.textContent = "Semester " + i;
    btn.onclick = () => {
      state.sem = i;
      loadSubjects();
    };
    box.appendChild(btn);
  }

  showSection("semester");
}

async function loadSubjects() {
  const file = `data/${state.stream==="bcom"?"bcom":state.dept}_sem${state.sem}.json`;
  const res = await fetch(file);
  const subjects = await res.json();

  const box = document.getElementById("subjects");
  box.innerHTML = "";

  subjects.forEach(s => {
    const row = document.createElement("div");
    row.className = "subject";
    row.innerHTML = `
      <span>${s.name}</span>
      <select>
        ${Object.keys(gradeMap).map(g=>`<option>${g}</option>`).join("")}
      </select>`;
    box.appendChild(row);
  });

  showSection("grades");
}

function calculateGPA() {
  let total = 0, count = 0;

  document.querySelectorAll("select").forEach(sel => {
    total += gradeMap[sel.value];
    count++;
  });

  const gpa = (total / count).toFixed(2);
  document.getElementById("gpa").textContent = gpa;
  showSection("result");
}

function saveSemester() {
  state.gpas.push(parseFloat(document.getElementById("gpa").textContent));
  alert("Semester GPA saved");
}

let chart;
function drawChart() {
  showSection("graphSection");
  const ctx = document.getElementById("chart");

  if(chart) chart.destroy();

  chart = new Chart(ctx,{
    type:"line",
    data:{
      labels: state.gpas.map((_,i)=>`Sem ${i+1}`),
      datasets:[{
        data: state.gpas,
        borderColor:"#5a4fcf",
        tension:0.3
      }]
    }
  });
}