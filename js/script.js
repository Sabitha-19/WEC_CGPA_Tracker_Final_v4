const pages = document.querySelectorAll(".page");
const startBtn = document.getElementById("start-btn");
const homeIcon = document.getElementById("home-icon");
const graphIcon = document.getElementById("graph-icon");
const saveIcon = document.getElementById("save-icon");
const faqIcon = document.getElementById("faq-icon");
const resetBtn = document.getElementById("reset-btn");

const departmentsDiv = document.getElementById("departments");
const semestersDiv = document.getElementById("semesters");
const subjectsList = document.getElementById("subjects-list");
const calculateBtn = document.getElementById("calculate-btn");

const gpaDisplay = document.getElementById("gpa-display");
const cgpaDisplay = document.getElementById("cgpa-display");
const percentageDisplay = document.getElementById("percentage-display");
const encouragementDisplay = document.getElementById("encouragement");

const savedList = document.getElementById("saved-list");
const finalCgpa = document.getElementById("final-cgpa");

const gradePoints = { S:10,A:9,B:8,C:7,D:6,E:5,F:0 };
const departmentsData = { engineering:["CSE","ECE","EEE","ISE","AA"], bcom:["BCom"] };

let selectedStream="", selectedDepartment="", selectedSemester=0;
let subjects=[], grades={}, semesterGPAs=JSON.parse(localStorage.getItem("semesterGPAs")) || [];

// NAVIGATION
function showPage(id){
  pages.forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
}
startBtn.onclick = ()=>showPage("stream-page");
homeIcon.onclick = ()=>showPage("start-page");
graphIcon.onclick = ()=>{ renderSaved(); showGraph(); showPage("graph-page"); };
saveIcon.onclick = ()=>{ renderSaved(); showPage("saved-page"); };
faqIcon.onclick = ()=>showPage("faq-page");

// STREAM
document.querySelectorAll(".stream-btn").forEach(btn=>{
  btn.onclick=()=>{
    selectedStream=btn.dataset.stream;
    loadDepartments();
    showPage("department-page");
  };
});

function loadDepartments(){
  departmentsDiv.innerHTML="";
  departmentsData[selectedStream].forEach(dep=>{
    const b=document.createElement("button");
    b.textContent=dep;
    b.onclick=()=>{
      selectedDepartment=dep.toLowerCase();
      loadSemesters();
      showPage("semester-page");
    };
    departmentsDiv.appendChild(b);
  });
}

function loadSemesters(){
  semestersDiv.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("button");
    b.textContent=`Semester ${i}`;
    b.onclick=()=>{
      selectedSemester=i;
      loadSubjects();
      showPage("subjects-page");
    };
    semestersDiv.appendChild(b);
  }
}

// LOAD SUBJECTS
async function loadSubjects(){
  subjectsList.innerHTML="Loading subjects...";
  grades={};
  try{
    const res=await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data=await res.json();
    subjects=data.subjects;
    subjectsList.innerHTML="";
    subjects.forEach(s=>{
      const div=document.createElement("div");
      div.className="subject";
      div.innerHTML=`${s.code} - ${s.name} (${s.credits} Cr)<br>`;
      Object.keys(gradePoints).forEach(g=>{
        const btn=document.createElement("button");
        btn.textContent=g;
        btn.className="grade-btn";
        btn.onclick=()=>{
          grades[s.code]=g;
          div.querySelectorAll("button").forEach(x=>x.classList.remove("active"));
          btn.classList.add("active");
        };
        div.appendChild(btn);
      });
      subjectsList.appendChild(div);
    });
  }catch(e){
    subjectsList.innerHTML="❌ Subjects file not found!";
    console.error(e);
  }
}

// CALCULATE
calculateBtn.onclick=()=>{
  if(Object.keys(grades).length<subjects.length){ alert("Select all grades"); return; }
  let total=0, credits=0;
  subjects.forEach(s=>{
    total+=gradePoints[grades[s.code]]*s.credits;
    credits+=s.credits;
  });
  const gpa=(total/credits).toFixed(2);
  semesterGPAs[selectedSemester-1]=Number(gpa);
  localStorage.setItem("semesterGPAs",JSON.stringify(semesterGPAs));

  const valid=semesterGPAs.filter(Boolean);
  const cgpa=(valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2);

  gpaDisplay.textContent=`GPA: ${gpa}`;
  cgpaDisplay.textContent=`CGPA: ${cgpa}`;
  percentageDisplay.textContent=`Percentage: ${(cgpa*9.5).toFixed(2)}%`;

  // Encouragement messages
  let msg="";
  if(cgpa>=9) msg="🌟 Outstanding!";
  else if(cgpa>=8) msg="💯 Excellent!";
  else if(cgpa>=7) msg="👍 Very Good!";
  else if(cgpa>=6) msg="🙂 Good!";
  else msg="📚 Keep Improving!";
  encouragementDisplay.textContent=msg;
}

// SAVE & RENDER
function renderSaved(){
  savedList.innerHTML="";
  const valid=semesterGPAs.filter(Boolean);
  semesterGPAs.forEach((g,i)=>{
    if(g){
      const d=document.createElement("div");
      d.className="saved-card";
      d.textContent=`Semester ${i+1}: GPA ${g}`;
      savedList.appendChild(d);
    }
  });
  if(valid.length){
    finalCgpa.textContent=`Final CGPA: ${(valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2)}`;
  } else savedList.innerHTML="<p>No semesters saved yet</p>";
}

// RESET SEMESTERS
resetBtn.onclick=()=>{
  if(confirm("🔒 Reset all semester data?")){
    localStorage.removeItem("semesterGPAs");
    semesterGPAs=[];
    renderSaved();
  }
}

// FAQ toggle
document.querySelectorAll(".faq-question").forEach(q=>{
  q.onclick=()=>q.parentElement.classList.toggle("active");
});

// CHART
let gpaChart;
function showGraph(){
  const data=semesterGPAs.map(g=>g||0);
  const labels=data.map((_,i)=>`Sem ${i+1}`);
  const ctx=document.getElementById("gpaChart").getContext("2d");
  if(gpaChart) gpaChart.destroy();
  gpaChart=new Chart(ctx,{
    type:"line",
    data:{
      labels:labels,
      datasets:[{
        label:"Semester GPA",
        data:data,
        borderColor:"#6a5cff",
        backgroundColor:"rgba(106,92,255,0.2)",
        fill:true,
        tension:0.4,
        pointBackgroundColor:"#9f7aea",
        pointRadius:6,
        pointHoverRadius:8
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{display:false},
        tooltip:{
          callbacks:{
            label:ctx=>`GPA: ${ctx.raw}`
          }
        }
      },
      scales:{ y:{min:0,max:10,ticks:{stepSize:1}}}
    }
  });
}