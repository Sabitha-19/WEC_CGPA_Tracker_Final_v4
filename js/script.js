let selectedStream = "";
let selectedDepartment = "";
let selectedSemester = 0;
let subjects = [];
let grades = {};
let savedSemesters = JSON.parse(localStorage.getItem("savedSemesters")) || [];
let semesterChart;

const departments = {
  engineering: ["cse","ise","ece","eee","aa"],
  bcom: ["bcom"]
};

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function selectStream(stream, btn){
  selectedStream = stream;
  document.querySelectorAll(".cube-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  showDepartments();
  showPage("department-page");
}

function showDepartments(){
  const grid = document.getElementById("department-grid");
  grid.innerHTML = "";
  departments[selectedStream].forEach(d=>{
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.innerText = d.toUpperCase();
    b.onclick = ()=>selectDepartment(d,b);
    grid.appendChild(b);
  });
}

function selectDepartment(dep,btn){
  selectedDepartment = dep;
  document.querySelectorAll("#department-grid button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  showSemesters();
  showPage("semester-page");
}

function showSemesters(){
  const grid = document.getElementById("semester-grid");
  grid.innerHTML = "";
  for(let i=1;i<=8;i++){
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.innerText = "Semester "+i;
    b.onclick = ()=>selectSemester(i,b);
    grid.appendChild(b);
  }
}

function selectSemester(sem,btn){
  selectedSemester = sem;
  document.querySelectorAll("#semester-grid button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  loadSubjects();
}

function loadSubjects(){
  grades = {};
  const list = document.getElementById("subjects-list");
  list.innerHTML = "Loading subjects...";

  const file = `data/${selectedDepartment}_sem${selectedSemester}.json`;
  console.log(file);

  fetch(file)
    .then(res=>res.json())
    .then(data=>{
      subjects = data;
      list.innerHTML = "";
      subjects.forEach(s=>{
        const div = document.createElement("div");
        div.className = "subject";
        div.innerHTML = `
          <strong>${s.code}</strong> - ${s.name} (${s.credits} cr)
          <div class="grade-buttons">
            ${Object.keys(gradePoints).map(g =>
              `<button onclick="selectGrade('${s.code}','${g}',this)">${g}</button>`
            ).join("")}
          </div>`;
        list.appendChild(div);
      });
      showPage("subjects-page");
    })
    .catch(()=>{
      alert("Subjects file missing:\n"+file);
    });
}

function selectGrade(code,grade,btn){
  grades[code]=grade;
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
}

document.getElementById("calculate-btn").onclick = ()=>{
  let tc=0,tp=0;
  subjects.forEach(s=>{
    if(!grades[s.code]) return alert("Select all grades");
    tc+=s.credits;
    tp+=s.credits*gradePoints[grades[s.code]];
  });
  const gpa=(tp/tc).toFixed(2);
  savedSemesters.push({semester:selectedSemester,gpa:Number(gpa)});
  localStorage.setItem("savedSemesters",JSON.stringify(savedSemesters));
  document.getElementById("gpa-display").innerText="GPA: "+gpa;
  document.getElementById("cgpa-display").innerText="CGPA: "+gpa;
  document.getElementById("percentage-display").innerText="Percentage: "+(gpa*9.5).toFixed(2)+"%";
  document.getElementById("encouragement").innerText="Good job 👏";
  showPage("result-page");
};

function openGraph(){
  showPage("graph-page");
  const data = Array(8).fill(null);
  savedSemesters.forEach(s=>data[s.semester-1]=s.gpa);

  const ctx=document.getElementById("semesterChart");
  if(semesterChart) semesterChart.destroy();

  semesterChart=new Chart(ctx,{
    type:"line",
    data:{labels:["S1","S2","S3","S4","S5","S6","S7","S8"],
      datasets:[{
        data,
        borderColor:"#6a11cb",
        backgroundColor:"rgba(106,17,203,0.3)",
        fill:true,
        tension:0.4,
        pointRadius:6,
        pointBorderWidth:3
      }]}
  });
}

function showSaved(){
  showPage("saved-page");
  const list=document.getElementById("saved-list");
  list.innerHTML="";
  savedSemesters.forEach(s=>{
    list.innerHTML+=`<div class="subject">Semester ${s.semester} - GPA ${s.gpa}</div>`;
  });
}