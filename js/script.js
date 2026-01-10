let state = {
  stream: null,
  dept: null,
  sem: null,
  subjects: [],
  grades: {},
  gpaHistory: [],
  history: ["stream"]
};

const sections = ["stream","dept","sem","subjectsSec","result"];

function show(id){
  sections.forEach(s=>document.getElementById(s).classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  state.history.push(id);
}

function back(){
  state.history.pop();
  show(state.history.pop());
}

function selectStream(s){
  state.stream = s;
  loadDepartments();
}

function loadDepartments(){
  const list = document.getElementById("deptList");
  list.innerHTML = "";

  const depts = state.stream === "engineering"
    ? ["CSE","ISE","ECE","EEE","AA"]
    : ["BCOM"];

  depts.forEach(d=>{
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = d;
    b.onclick = ()=>{ state.dept=d; loadSemesters(); };
    list.appendChild(b);
  });

  show("dept");
}

function loadSemesters(){
  const list = document.getElementById("semList");
  list.innerHTML = "";

  for(let i=1;i<=8;i++){
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = "Semester "+i;
    b.onclick = ()=>{ state.sem=i; loadSubjects(); };
    list.appendChild(b);
  }
  show("sem");
}

function loadSubjects(){
  const path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;

  fetch(path)
    .then(r=>r.json())
    .then(data=>{
      state.subjects = data.subjects;
      renderSubjects();
      show("subjectsSec");
    })
    .catch(()=>alert("JSON error or file missing:\n"+path));
}

function renderSubjects(){
  const box = document.getElementById("subjects");
  box.innerHTML = "";
  document.getElementById("title").textContent =
    `${state.dept} - Semester ${state.sem}`;

  state.subjects.forEach((s,i)=>{
    const card = document.createElement("div");
    card.className="subject-card";
    card.innerHTML=`<b>${s.name}</b> (${s.credits} credits)`;

    const row=document.createElement("div");
    row.className="grade-row";

    ["S","A","B","C","D","E","F"].forEach((g,idx)=>{
      const pts=[10,9,8,7,6,5,0][idx];
      const b=document.createElement("div");
      b.className="g-box";
      b.textContent=g;
      b.onclick=()=>{
        row.querySelectorAll(".g-box").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        state.grades[s.code]=pts;
      };
      row.appendChild(b);
    });

    card.appendChild(row);
    box.appendChild(card);
  });
}

function calculateGPA(){
  let total=0, credits=0;
  for(const s of state.subjects){
    if(state.grades[s.code]==null){
      alert("Select all grades");
      return;
    }
    total+=state.grades[s.code]*s.credits;
    credits+=s.credits;
  }
  const gpa=(total/credits).toFixed(2);
  state.gpaHistory[state.sem-1]=parseFloat(gpa);
  document.getElementById("gpa").textContent=gpa;
  renderChart();
  show("result");
}

let chart;
function renderChart(){
  const ctx=document.getElementById("chart").getContext("2d");
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:"line",
    data:{
      labels:state.gpaHistory.map((_,i)=>"Sem "+(i+1)),
      datasets:[{
        label:"GPA",
        data:state.gpaHistory,
        borderColor:"#6d28d9",
        tension:.3
      }]
    },
    options:{ scales:{ y:{ min:0,max:10 } } }
  });
}