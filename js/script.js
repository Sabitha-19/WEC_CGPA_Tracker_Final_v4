// 🔥 Firebase config (YOURS)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "wec-cgpa-tracker.firebaseapp.com",
  databaseURL: "https://wec-cgpa-tracker-default-rtdb.firebaseio.com",
  projectId: "wec-cgpa-tracker",
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// Elements
const pages = document.querySelectorAll(".page");
const startBtn = document.getElementById("start-btn");
const departmentsDiv = document.getElementById("departments");
const semestersDiv = document.getElementById("semesters");
const subjectsList = document.getElementById("subjects-list");
const calculateBtn = document.getElementById("calculate-btn");
const savedList = document.getElementById("saved-list");

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginMsg = document.getElementById("login-msg");

// Data
const gradePoints = { S:10,A:9,B:8,C:7,D:6,E:5,F:0 };
let selectedDept="", selectedSem=0;
let subjects=[], grades={}, semesterCGPA={};

// Navigation
function show(id){
  pages.forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Login
document.getElementById("signup-btn").onclick=()=>{
  auth.createUserWithEmailAndPassword(email.value,password.value)
  .then(()=>loginMsg.textContent="Signup success");
};

document.getElementById("login-btn").onclick=()=>{
  auth.signInWithEmailAndPassword(email.value,password.value)
  .then(()=>{ show("start-page"); loadData(); });
};

// Stream
document.querySelectorAll(".stream-btn").forEach(b=>{
  b.onclick=()=>{
    selectedDept = b.dataset.stream==="bcom"?"bcom":"cse";
    showDepartments();
    show("department-page");
  };
});

// Departments
function showDepartments(){
  departmentsDiv.innerHTML="";
  ["cse"].forEach(d=>{
    const btn=document.createElement("button");
    btn.textContent=d.toUpperCase();
    btn.onclick=()=>{ selectedDept=d; showSemesters(); show("semester-page"); };
    departmentsDiv.appendChild(btn);
  });
}

// Semesters
function showSemesters(){
  semestersDiv.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("button");
    b.textContent="Semester "+i;
    b.onclick=()=>{ selectedSem=i; loadSubjects(); show("subjects-page"); };
    semestersDiv.appendChild(b);
  }
}

// Load subjects
async function loadSubjects(){
  subjectsList.innerHTML="";
  grades={};
  const res=await fetch(`data/${selectedDept}_sem${selectedSem}.json`);
  const data=await res.json();
  subjects=data.subjects;

  subjects.forEach(s=>{
    const div=document.createElement("div");
    div.className="subject";
    div.innerHTML=`<b>${s.code}</b> (${s.credits} cr)`;
    const g=document.createElement("div");
    g.className="grade-buttons";

    Object.keys(gradePoints).forEach(gr=>{
      const b=document.createElement("button");
      b.textContent=gr;
      b.onclick=()=>{ grades[s.code]=gr; };
      g.appendChild(b);
    });
    div.appendChild(g);
    subjectsList.appendChild(div);
  });
}

// Calculate CGPA
calculateBtn.onclick=()=>{
  let total=0,credits=0;
  subjects.forEach(s=>{
    total+=gradePoints[grades[s.code]]*s.credits;
    credits+=s.credits;
  });
  const cgpa=(total/credits).toFixed(2);

  document.getElementById("cgpa-display").textContent="CGPA: "+cgpa;
  document.getElementById("percentage-display").textContent=
    "Percentage: "+(cgpa*9.5).toFixed(2)+"%";

  saveSemester(cgpa);
};

// Save to Firebase
function saveSemester(cgpa){
  const uid=auth.currentUser.uid;
  semesterCGPA[selectedSem]=cgpa;
  db.ref("users/"+uid+"/semesters").set(semesterCGPA);
}

// Load saved
function loadData(){
  const uid=auth.currentUser.uid;
  db.ref("users/"+uid+"/semesters").once("value",s=>{
    semesterCGPA=s.val()||{};
    renderSaved();
    updateChart();
  });
}

// Saved list
function renderSaved(){
  savedList.innerHTML="";
  Object.keys(semesterCGPA).forEach(s=>{
    savedList.innerHTML+=`<p>Semester ${s}: ${semesterCGPA[s]}</p>`;
  });
}

// Chart
const ctx=document.getElementById("cgpaChart");
const chart=new Chart(ctx,{
  type:"line",
  data:{labels:[1,2,3,4,5,6,7,8],
    datasets:[{label:"CGPA",data:Array(8).fill(null)}]},
});

function updateChart(){
  chart.data.datasets[0].data=
    Array(8).fill(null).map((_,i)=>semesterCGPA[i+1]||null);
  chart.update();
}