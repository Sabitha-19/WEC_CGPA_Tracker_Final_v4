let historyStack = [];
let stream, department, semester;
let subjects = [];
let selectedGrades = {};

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

function goTo(id){
  document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  historyStack.push(id);
}

function goBack(){
  historyStack.pop();
  const prev = historyStack.pop() || "page-home";
  goTo(prev);
}

function goHome(){
  historyStack=[];
  goTo("page-home");
}

function selectStream(s){
  stream=s;
  goTo("page-department");
  loadDepartments();
}

function loadDepartments(){
  const depts = stream==="bcom" ? ["bcom"] : ["cse","ise","ece","eee","aa"];
  const box=document.getElementById("departmentButtons");
  box.innerHTML="";
  depts.forEach(d=>{
    const b=document.createElement("button");
    b.textContent=d.toUpperCase();
    b.onclick=()=>selectDepartment(d,b);
    box.appendChild(b);
  });
}

function selectDepartment(d,btn){
  department=d;
  setActive(btn);
  goTo("page-semester");
  loadSemesters();
}

function loadSemesters(){
  const box=document.getElementById("semesterButtons");
  box.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("button");
    b.textContent="Semester "+i;
    b.onclick=()=>selectSemester(i,b);
    box.appendChild(b);
  }
}

function selectSemester(s,btn){
  semester=s;
  setActive(btn);
  loadSubjects();
}

function setActive(btn){
  document.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
}

function loadSubjects(){
  const path=`data/${department}_sem${semester}.json`;
  fetch(path)
    .then(r=>r.json())
    .then(data=>{
      subjects=data.subjects;
      renderSubjects();
      goTo("page-subjects");
    })
    .catch(()=>{
      alert("Subject file not found: "+path);
    });
}

function renderSubjects(){
  document.getElementById("subjectTitle").innerText=
    department.toUpperCase()+" Semester "+semester;
  const box=document.getElementById("subjects");
  box.innerHTML="";
  selectedGrades={};

  subjects.forEach(s=>{
    const div=document.createElement("div");
    div.className="subject";
    div.innerHTML=`<strong>${s.name}</strong> (${s.credits} credits)`;
    const g=document.createElement("div");
    g.className="grades";

    Object.keys(gradePoints).forEach(gr=>{
      const b=document.createElement("button");
      b.textContent=gr;
      b.onclick=()=>{
        selectedGrades[s.code]=gr;
        calculateGPA();
      };
      g.appendChild(b);
    });
    div.appendChild(g);
    box.appendChild(div);
  });
}

function calculateGPA(){
  let total=0,credits=0;
  subjects.forEach(s=>{
    if(selectedGrades[s.code]){
      total+=gradePoints[selectedGrades[s.code]]*s.credits;
      credits+=s.credits;
    }
  });
  const gpa=credits? (total/credits).toFixed(2):"0.00";
  document.getElementById("gpa").innerText=gpa;

  document.getElementById("message").innerText=
    gpa>=9?"Excellent 🌟":gpa>=7?"Good 👍":"Keep improving 💪";
}