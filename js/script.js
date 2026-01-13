import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);

// DOM Elements
const pages = document.querySelectorAll('.page');
const startBtn = document.getElementById('start-btn');
const streamsDiv = document.getElementById('streams');
const departmentsDiv = document.getElementById('departments');
const semestersDiv = document.getElementById('semesters');
const subjectsList = document.getElementById('subjects-list');
const calculateBtn = document.getElementById('calculate-btn');
const gpaDisplay = document.getElementById('gpa-display');
const cgpaDisplay = document.getElementById('cgpa-display');
const percentageDisplay = document.getElementById('percentage-display');
const encouragementDisplay = document.getElementById('encouragement');
const homeIcon = document.getElementById('home-icon');
const graphIcon = document.getElementById('graph-icon');
const saveIcon = document.getElementById('save-icon');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const loginMsg = document.getElementById('login-msg');

const gradePoints = {S:10,A:9,B:8,C:7,D:6,E:5,F:0};
const encouragements = [
  {min:9,msg:"Excellent work! Keep it up!"},
  {min:8,msg:"Very good! You can reach the top!"},
  {min:7,msg:"Good! Focus on improving slightly."},
  {min:5,msg:"Average. Need more effort."},
  {min:0,msg:"Work harder! You can improve!"}
];

const departments = {engineering:["CSE","ISE","ECE","EEE","AA"],bcom:["BCOM"]};
const maxSem = 8;

// State
let selectedStream='', selectedDepartment='', selectedSemester=0;
let subjects=[], grades={}, semesterCGPA={};

// Chart.js
const ctx = document.getElementById('gpa-chart').getContext('2d');
const chart = new Chart(ctx,{
  type:'line',
  data:{ labels:[...Array(maxSem).keys()].map(i=>`Sem ${i+1}`), datasets:[{label:'CGPA', data:Array(maxSem).fill(null), borderColor:'rgba(106,17,203,1)', backgroundColor:'rgba(37,117,252,0.3)', fill:true, tension:0.3}] },
  options:{ scales:{y:{min:0,max:10}} }
});

// Functions
function show(id){ pages.forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active'); }
startBtn?.addEventListener('click',()=>show('stream-page'));
homeIcon.addEventListener('click',()=>show('start-page'));
graphIcon.addEventListener('click',()=>show('graph-page'));

// Stream Buttons
document.querySelectorAll('.stream-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    selectedStream = btn.dataset.stream.toLowerCase();
    departmentsDiv.innerHTML='';
    departments[selectedStream].forEach(dep=>{
      const b=document.createElement('button'); b.textContent=dep;
      b.addEventListener('click',()=>{
        selectedDepartment = dep.toLowerCase();
        semestersDiv.innerHTML='';
        for(let i=1;i<=maxSem;i++){
          const sb=document.createElement('button'); sb.textContent=`Semester ${i}`;
          sb.addEventListener('click',()=>{ selectedSemester=i; loadSubjects(); show('subjects-page'); });
          semestersDiv.appendChild(sb);
        }
        show('semester-page');
      });
      departmentsDiv.appendChild(b);
    });
    show('department-page');
  });
});

// Load Subjects
async function loadSubjects(){
  subjectsList.innerHTML=''; grades={};
  try{
    const res = await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data = await res.json(); subjects=data.subjects;
    subjects.forEach(s=>{
      const div=document.createElement('div'); div.className='subject';
      div.innerHTML=`<span>${s.code} - ${s.name} (${s.credits}cr)</span>`;
      const gradeDiv=document.createElement('div'); gradeDiv.className='grade-buttons';
      Object.keys(gradePoints).forEach(g=>{
        const btn=document.createElement('button'); btn.textContent=g;
        btn.addEventListener('click',()=>{ grades[s.code]=g; Array.from(gradeDiv.children).forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); });
        gradeDiv.appendChild(btn);
      });
      div.appendChild(gradeDiv); subjectsList.appendChild(div);
    });
  }catch{ subjectsList.innerHTML="<p>Subjects not found!</p>"; }
}

// Calculate CGPA
calculateBtn.addEventListener('click',()=>{
  if(Object.keys(grades).length!==subjects.length){ alert("Select all grades"); return; }
  let total=0,credits=0;
  subjects.forEach(s)=>{ total+=gradePoints[grades[s.code]]*s.credits; credits+=s.credits; });
  const cgpa=(total/credits).toFixed(2);
  cgpaDisplay.textContent=`CGPA: ${cgpa}`;
  percentageDisplay.textContent=`Percentage: ${(cgpa*9.5).toFixed(2)}%`;
  for(const e of encouragements){ if(cgpa>=e.min){ encouragementDisplay.textContent=e.msg; break; } }
  updateChart();
});

// Save Semester to Firebase
saveIcon.addEventListener('click',()=>{
  if(!grades || Object.keys(grades).length===0){ alert("Enter grades first"); return; }
  const uid = auth.currentUser.uid;
  set(ref(db,'users/'+uid+'/semesters/sem'+selectedSemester),{
    grades,
    cgpa: parseFloat(cgpaDisplay.textContent.split(' ')[1])
  });
  alert('Semester saved successfully!');
  loadUserData();
});

// Load user data
function loadUserData(){
  const uid = auth.currentUser.uid;
  get(child(ref(db), 'users/'+uid+'/semesters')).then(snapshot=>{
    semesterCGPA = snapshot.val() || {};
    chart.data.datasets[0].data=[...Array(maxSem).keys()].map(i=>semesterCGPA['sem'+(i+1)]?.cgpa||null);
    chart.update();
  });
}

// Firebase Signup/Login
signupBtn?.addEventListener('click',()=>{
  createUserWithEmailAndPassword(auth,emailInput.value,passwordInput.value)
    .then(()=>loginMsg.textContent="Signup successful!")
    .catch(e=>loginMsg.textContent=e.message);
});
loginBtn?.addEventListener('click',()=>{
  signInWithEmailAndPassword(auth,emailInput.value,passwordInput.value)
    .then(()=>{ loginMsg.textContent="Login successful!"; loadUserData(); show('start-page'); })
    .catch(e=>loginMsg.textContent=e.message);
});