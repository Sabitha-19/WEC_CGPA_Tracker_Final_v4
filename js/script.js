let selectedStream="",selectedDepartment="",selectedSemester=0;
let subjects=[],grades={};
let savedSemesters=JSON.parse(localStorage.getItem("savedSemesters"))||[];

const departments={
  engineering:["cse","ise","ece","eee","aa"],
  bcom:["bcom"]
};

const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id!=="start-page") document.getElementById("faq-section")?.classList.add("hidden");
}

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

function loadSubjects(){
  const path=`data/${selectedDepartment}_sem${selectedSemester}.json`;
  fetch(path)
    .then(r=>r.json())
    .then(d=>{subjects=d;renderSubjects();})
    .catch(()=>alert("JSON not found: "+path));
}

function renderSubjects(){
  const list=document.getElementById("subjects-list");
  list.innerHTML="";
  subjects.forEach(s=>{
    const div=document.createElement("div");
    div.innerHTML=`<b>${s.code}</b> ${s.name}<br>
      ${Object.keys(gradePoints).map(g=>`<button onclick="selectGrade('${s.code}','${g}',this)">${g}</button>`).join("")}`;
    list.appendChild(div);
  });
  showPage("subjects-page");
}

function selectGrade(code,g,btn){
  grades[code]=g;
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
}

document.getElementById("calculate-btn").onclick=()=>{
  let tc=0,tp=0;
  subjects.forEach(s=>{
    if(!grades[s.code]) return alert("Select all grades");
    tc+=s.credits;
    tp+=s.credits*gradePoints[grades[s.code]];
  });
  const gpa=(tp/tc).toFixed(2);
  const i=savedSemesters.findIndex(x=>x.semester===selectedSemester);
  i>=0?savedSemesters[i].gpa=gpa:savedSemesters.push({semester:selectedSemester,gpa});
  localStorage.setItem("savedSemesters",JSON.stringify(savedSemesters));
  const cgpa=(savedSemesters.reduce((a,b)=>a+ +b.gpa,0)/savedSemesters.length).toFixed(2);
  document.getElementById("cgpa-display").innerText="CGPA: "+cgpa;
  showPage("result-page");
};

function toggleFAQ(){
  showPage("start-page");
  document.getElementById("faq-section").classList.toggle("hidden");
}

/* ================= GRAPH ================= */
let semesterChart=null;

function openGraph(){
  showPage("graph-page");

  const data=Array(8).fill(null);
  savedSemesters.forEach(s=>{
    data[s.semester-1]=s.gpa;
  });

  const ctx=document.getElementById("semesterChart");

  if(semesterChart) semesterChart.destroy();

  semesterChart=new Chart(ctx,{
    type:"line",
    data:{
      labels:["S1","S2","S3","S4","S5","S6","S7","S8"],
      datasets:[{
        label:"Semester-wise CGPA",
        data:data,
        fill:true,
        tension:0.4,
        borderWidth:3
      }]
    },
    options:{
      responsive:true,
      scales:{
        y:{
          beginAtZero:true,
          max:10
        }
      }
    }
  });
}