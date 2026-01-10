let state = {
  stream: null,
  dept: null,
  sem: null,
  subjects: [],
  history: ["stream"]
};

let saved = JSON.parse(localStorage.getItem("wec_saved")) || {};
let chart;

function show(id){
  document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if(state.history[state.history.length-1]!==id) state.history.push(id);
}

function goBack(){
  if(state.history.length>1){
    state.history.pop();
    show(state.history[state.history.length-1]);
  }
}

function goHome(){
  state.history=["stream"];
  show("stream");
}

function selectStream(s){
  state.stream=s;
  loadDepartments();
  show("department");
}

function loadDepartments(){
  const list=document.getElementById("deptList");
  list.innerHTML="";

  const depts = state.stream==="engineering"
    ? ["ISE","CSE","ECE","EEE","ME","AA"]
    : ["BCOM"];

  depts.forEach(d=>{
    const b=document.createElement("button");
    b.textContent=d;
    b.onclick=()=>{state.dept=d; loadSem(); show("semester");};
    list.appendChild(b);
  });
}

function loadSem(){
  const list=document.getElementById("semList");
  list.innerHTML="";
  const max=state.stream==="engineering"?8:6;
  for(let i=1;i<=max;i++){
    const b=document.createElement("button");
    b.textContent="Semester "+i;
    b.onclick=()=>{state.sem=i; loadSubjects();};
    list.appendChild(b);
  }
}

function loadSubjects(){
  const file=`data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
  fetch(file)
  .then(r=>r.json())
  .then(j=>{
    state.subjects=j.subjects;
    renderSubjects();
    show("subjectsSection");
  })
  .catch(()=>alert("Subjects not found: "+file));
}

function renderSubjects(){
  const c=document.getElementById("subjects");
  c.innerHTML="";
  state.subjects.forEach((s,i)=>{
    const d=document.createElement("div");
    d.className="subject";
    d.innerHTML=`<b>${s.name}</b> (${s.credits})
    <div class="grade">
      ${["S","A","B","C","D","E","F"].map(g=>`<span onclick="setGrade(${i},'${g}',this)">${g}</span>`).join("")}
    </div>`;
    c.appendChild(d);
  });
}

function setGrade(i,g,el){
  state.subjects[i].selected=g;
  el.parentElement.querySelectorAll("span").forEach(x=>x.classList.remove("active"));
  el.classList.add("active");
}

function calculateGPA(){
  const pts={S:10,A:9,B:8,C:7,D:6,E:5,F:0};
  let sum=0,cred=0;
  for(const s of state.subjects){
    if(!s.selected){alert("Select all grades");return;}
    sum+=pts[s.selected]*s.credits;
    cred+=s.credits;
  }
  const gpa=(sum/cred).toFixed(2);
  document.getElementById("gpa").textContent=gpa;
  saved[`${state.dept}-Sem${state.sem}`]=gpa;
  localStorage.setItem("wec_saved",JSON.stringify(saved));
  show("result");
}

function saveSemester(){
  alert("Semester saved successfully!");
}

function openGraph(){
  show("graph");
  const labels=Object.keys(saved);
  const data=Object.values(saved);
  if(!labels.length) return;

  if(chart) chart.destroy();
  chart=new Chart(document.getElementById("gpaChart"),{
    type:"line",
    data:{labels,datasets:[{data,label:"GPA",borderColor:"#4f46e5",tension:0.4}]},
    options:{scales:{y:{min:0,max:10}}}
  });
}

function convert(){
  const v=parseFloat(document.getElementById("cgpaInput").value);
  document.getElementById("percent").textContent=
    isNaN(v)?"Invalid":`Percentage: ${(v*10).toFixed(1)}%`;
}