let state = {
  stream: null,
  dept: null,
  sem: null,
  subjects: [],
  saved: JSON.parse(localStorage.getItem("wec_saved")) || {}
};

const gradePoint = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

function hideAll() {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
}

function goHome() {
  hideAll();
  document.getElementById("stream").classList.remove("hidden");
}

function selectStream(stream) {
  state.stream = stream;
  hideAll();
  document.getElementById("department").classList.remove("hidden");

  const deptList = document.getElementById("deptList");
  deptList.innerHTML = "";

  const depts = stream === "engineering"
    ? ["ISE","CSE","ECE","EEE"]
    : ["BCom"];

  depts.forEach(d => {
    const btn = document.createElement("button");
    btn.textContent = d;
    btn.onclick = () => selectDept(d);
    deptList.appendChild(btn);
  });
}

function selectDept(dept) {
  state.dept = dept;
  hideAll();
  document.getElementById("semester").classList.remove("hidden");

  const semList = document.getElementById("semList");
  semList.innerHTML = "";

  for(let i=1;i<=8;i++){
    const b = document.createElement("button");
    b.textContent = "Semester " + i;
    b.onclick = () => loadSubjects(i);
    semList.appendChild(b);
  }
}

async function loadSubjects(sem) {
  state.sem = sem;
  hideAll();
  document.getElementById("subjectsSection").classList.remove("hidden");

  const path =
    state.stream === "engineering"
    ? `data/eng_${state.dept.toLowerCase()}_sem${sem}.json`
    : `data/bcom_sem${sem}.json`;

  const res = await fetch(path);
  const json = await res.json();
  state.subjects = json.subjects;

  renderSubjects();
}

function renderSubjects() {
  const container = document.getElementById("subjects");
  container.innerHTML = "";

  state.subjects.forEach(s => {
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `
      <b>${s.code}</b> - ${s.name} (${s.credits} credits)
      <div class="grade">
        ${Object.keys(gradePoint).map(g => `<span>${g}</span>`).join("")}
      </div>
    `;
    container.appendChild(div);

    div.querySelectorAll(".grade span").forEach(sp => {
      sp.onclick = () => {
        div.querySelectorAll("span").forEach(x => x.classList.remove("active"));
        sp.classList.add("active");
        s.grade = sp.textContent;
      };
    });
  });
}

function calculateGPA() {
  let total=0, weighted=0;
  for(const s of state.subjects){
    if(!s.grade) return alert("Select all grades");
    total += s.credits;
    weighted += gradePoint[s.grade]*s.credits;
  }
  const gpa = (weighted/total).toFixed(2);
  document.getElementById("credits").textContent = total;
  document.getElementById("gpa").textContent = gpa;
  document.getElementById("result").classList.remove("hidden");
}

function saveSemester() {
  const gpa = document.getElementById("gpa").textContent;
  if(!gpa) return;
  state.saved[`${state.dept}_Sem${state.sem}`] = parseFloat(gpa);
  localStorage.setItem("wec_saved", JSON.stringify(state.saved));
  alert("Semester saved");
}

function openGraph() {
  hideAll();
  document.getElementById("graph").classList.remove("hidden");

  const entries = Object.entries(state.saved)
    .sort((a,b)=>parseInt(a[0].match(/\d+/))-parseInt(b[0].match(/\d+/)));

  const ctx = document.getElementById("gpaChart");
  new Chart(ctx,{
    type:"line",
    data:{
      labels: entries.map(e=>e[0]),
      datasets:[{
        label:"GPA",
        data: entries.map(e=>e[1]),
        borderColor:"#5a5be7",
        fill:true
      }]
    },
    options:{scales:{y:{min:0,max:10}}}
  });
}

goHome();