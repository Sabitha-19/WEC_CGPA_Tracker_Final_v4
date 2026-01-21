let selectedStream="", selectedDepartment="", selectedSemester=0;
let subjects=[], grades={};

let savedSemesters = JSON.parse(localStorage.getItem("savedSemesters")) || [];
let semesterChart = null;

const departments = {
  engineering:["cse","ise","ece","eee","aa"],
  bcom:["bcom"]
};

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

/* PAGE NAVIGATION */
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* STREAM / DEPARTMENT / SEMESTER */
function selectStream(s,btn){
  selectedStream=s;
  document.querySelectorAll(".cube-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  showDepartments();
  showPage("department-page");
}

function showDepartments(){
  const grid=document.getElementById("department-grid");
  grid.innerHTML="";
  departments[selectedStream].forEach(d=>{
    const b=document.createElement("button");
    b.className="cube-btn";
    b.textContent=d.toUpperCase();
    b.onclick=()=>selectDepartment(d,b);
    grid.appendChild(b);
  });
}

function selectDepartment(d,btn){
  selectedDepartment=d;
  document.querySelectorAll("#department-grid button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  showSemesters();
  showPage("semester-page");
}

function showSemesters(){
  const grid=document.getElementById("semester-grid");
  grid.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("button");
    b.className="cube-btn";
    b.textContent="Semester "+i;
    b.onclick=()=>selectSemester(i,b);
    grid.appendChild(b);
  }
}

function selectSemester(s,btn){
  selectedSemester=s;
  document.querySelectorAll("#semester-grid button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  loadSubjects();
}

/* LOAD SUBJECTS FROM JSON */
function loadSubjects(){
  grades={};
  fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`)
    .then(r=>r.json())
    .then(d=>{
      subjects=d;
      renderSubjects();
    })
    .catch(()=>alert("Subjects file not found"));
}

/* RENDER SUBJECTS */
function renderSubjects(){
  const list=document.getElementById("subjects-list");
  list.innerHTML="";

  subjects.forEach(s=>{
    const div=document.createElement("div");
    div.className="subject";
    div.innerHTML=`
      <b>${s.code}</b> ${s.name} (${s.credits})
      <div class="grade-buttons">
        ${Object.keys(gradePoints).map(g=>`
          <button class="${grades[s.code]===g?'active':''}"
            onclick="selectGrade('${s.code}','${g}',this)">
            ${g}
          </button>
        `).join("")}
      </div>`;
    list.appendChild(div);
  });

  showPage("subjects-page");
}

function selectGrade(code,grade,btn){
  grades[code]=grade;
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
}

/* CALCULATE CGPA */
document.getElementById("calculate-btn").onclick=()=>{
  let tc=0,tp=0;

  for(let s of subjects){
    if(!grades[s.code]) return alert("Select all grades");
    tc+=s.credits;
    tp+=s.credits * gradePoints[grades[s.code]];
  }

  const gpa=(tp/tc).toFixed(2);
  savedSemesters.push({semester:selectedSemester,gpa});
  localStorage.setItem("savedSemesters",JSON.stringify(savedSemesters));

  document.getElementById("cgpa-display").innerText="CGPA : "+gpa;
  document.getElementById("percentage-display").innerText="Percentage : "+(gpa*9.5).toFixed(2)+"%";
  showPage("result-page");
};

/* GRAPH */
function openGraph(){
  showPage("graph-page");
  const data=Array(8).fill(null);
  savedSemesters.forEach(s=>data[s.semester-1]=s.gpa);

  if(semesterChart) semesterChart.destroy();
  semesterChart=new Chart(document.getElementById("semesterChart"),{
    type:"line",
    data:{labels:["S1","S2","S3","S4","S5","S6","S7","S8"],
      datasets:[{data,fill:true,tension:0.4}]},
    options:{scales:{y:{min:0,max:10}}}
  });
}

/* SAVED */
function showSaved(){
  showPage("saved-page");
  const list=document.getElementById("saved-list");
  list.innerHTML="";
  savedSemesters.forEach(s=>{
    list.innerHTML+=`<div class="subject">Semester ${s.semester} : ${s.gpa}</div>`;
  });
}

/* FAQ */
function toggleFAQ(){
  document.getElementById("faq-section").classList.toggle("hidden");
}