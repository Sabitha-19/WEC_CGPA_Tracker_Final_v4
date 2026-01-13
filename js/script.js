import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

/* 🔥 Firebase config (PASTE YOUR KEYS) */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/* ===== Pages ===== */
const pages=document.querySelectorAll(".page");
const show=id=>{
  pages.forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};

/* ===== Login ===== */
login-btn.onclick=()=>{
  signInWithEmailAndPassword(auth,email.value,password.value)
    .then(()=>{ loadUserData(); show("start-page"); })
    .catch(e=>login-msg.textContent=e.message);
};

signup-btn.onclick=()=>{
  createUserWithEmailAndPassword(auth,email.value,password.value)
    .then(()=>login-msg.textContent="Signup successful")
    .catch(e=>login-msg.textContent=e.message);
};

/* ===== Data ===== */
const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};
const encouragements=[
  {min:9,msg:"Excellent work!"},
  {min:8,msg:"Very good!"},
  {min:7,msg:"Good progress!"},
  {min:5,msg:"Keep improving!"},
  {min:0,msg:"You can do better!"}
];

let dept="",sem=0,subjects=[],grades={},semCGPA={};

/* ===== Navigation ===== */
start-btn.onclick=()=>show("stream-page");
home-icon.onclick=()=>show("start-page");
graph-icon.onclick=()=>show("graph-page");
saved-icon.onclick=()=>{ renderSaved(); show("saved-page"); };
document.querySelectorAll(".back-btn").forEach(b=>b.onclick=()=>show("start-page"));

/* ===== Stream & Dept ===== */
const departments={engineering:["CSE","ISE","ECE","EEE","AA"],bcom:["BCOM"]};

document.querySelectorAll(".stream-btn").forEach(b=>{
  b.onclick=()=>{
    dept=b.dataset.stream;
    departmentsDiv.innerHTML="";
    departments[dept].forEach(d=>{
      const btn=document.createElement("button");
      btn.textContent=d;
      btn.onclick=()=>{dept=d.toLowerCase(); showSemesters();};
      departmentsDiv.appendChild(btn);
    });
    show("department-page");
  };
});

function showSemesters(){
  semestersDiv.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("button");
    b.textContent=`Semester ${i}`;
    b.onclick=()=>{sem=i; loadSubjects(); show("subjects-page");};
    semestersDiv.appendChild(b);
  }
  show("semester-page");
}

/* ===== Load Subjects ===== */
async function loadSubjects(){
  subjectsList.innerHTML="";
  grades={};
  const res=await fetch(`data/${dept}_sem${sem}.json`);
  const data=await res.json();
  subjects=data.subjects;

  subjects.forEach(s=>{
    const div=document.createElement("div");
    div.className="subject";
    div.innerHTML=`${s.code} (${s.credits}cr)`;
    const g=document.createElement("div");
    g.className="grade-buttons";
    Object.keys(gradePoints).forEach(k=>{
      const b=document.createElement("button");
      b.textContent=k;
      b.onclick=()=>{grades[s.code]=k;};
      g.appendChild(b);
    });
    div.appendChild(g);
    subjectsList.appendChild(div);
  });
}

/* ===== Calculate & Save ===== */
calculate-btn.onclick=()=>{
  let total=0,credits=0;
  subjects.forEach(s=>{
    total+=gradePoints[grades[s.code]]*s.credits;
    credits+=s.credits;
  });
  const cgpa=(total/credits).toFixed(2);
  semCGPA[sem]=parseFloat(cgpa);

  cgpa-display.textContent=`CGPA: ${cgpa}`;
  percentage-display.textContent=`Percentage: ${(cgpa*9.5).toFixed(2)}%`;

  encouragements.some(e=>{
    if(cgpa>=e.min){ encouragement.textContent=e.msg; return true;}
  });

  saveToFirebase();
  updateChart();
};

/* ===== Firebase Save/Load ===== */
function saveToFirebase(){
  const uid=auth.currentUser.uid;
  set(ref(db,"users/"+uid+"/cgpa"),semCGPA);
}

function loadUserData(){
  const uid=auth.currentUser.uid;
  get(ref(db,"users/"+uid+"/cgpa")).then(s=>{
    semCGPA=s.val()||{};
    updateChart();
  });
}

/* ===== Chart ===== */
const chart=new Chart(cgpa-chart,{
  type:"line",
  data:{
    labels:["Sem1","Sem2","Sem3","Sem4","Sem5","Sem6","Sem7","Sem8"],
    datasets:[{label:"CGPA",data:[],fill:true}]
  }
});

function updateChart(){
  chart.data.datasets[0].data=
    Array.from({length:8},(_,i)=>semCGPA[i+1]||null);
  chart.update();
}

/* ===== Saved Page ===== */
function renderSaved(){
  saved-list.innerHTML="";
  Object.keys(semCGPA).forEach(s=>{
    const d=document.createElement("div");
    d.innerHTML=`Semester ${s} <b>${semCGPA[s]}</b>`;
    saved-list.appendChild(d);
  });
}