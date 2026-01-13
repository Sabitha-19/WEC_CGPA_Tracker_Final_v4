// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ===== Elements =====
const pages = document.querySelectorAll('.page');
const startBtn = document.getElementById('start-btn');
const streamsDiv = document.getElementById('streams');
const departmentsDiv = document.getElementById('departments');
const semestersDiv = document.getElementById('semesters');
const subjectsList = document.getElementById('subjects-list');
const calculateBtn = document.getElementById('calculate-btn');
const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');
const cgpaDisplay = document.getElementById('cgpa-display');
const percentageDisplay = document.getElementById('percentage-display');
const encouragementDisplay = document.getElementById('encouragement');
const savedListDiv = document.getElementById('saved-list');

const homeIcon = document.getElementById('home-icon');
const graphIcon = document.getElementById('graph-icon');
const savedIcon = document.getElementById('saved-icon');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const loginMsg = document.getElementById('login-msg');

// ===== Constants =====
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

// ===== State =====
let selectedStream='',selectedDepartment='',selectedSemester=0,subjects=[],grades={},semesterCGPA={};

// ===== Chart.js =====
const ctx = document.getElementById('gpa-chart').getContext('2d');
const chart = new Chart(ctx,{
  type:'line',
  data:{
    labels:[...Array(maxSem).keys()].map(i=>`Sem ${i+1}`),
    datasets:[{
      label:'CGPA',
      data:Array(maxSem).fill(null),
      borderColor:'rgba(106,17,203,1)',
      backgroundColor:'rgba(37,117,252,0.3)',
      fill:true,
      tension:0.3
    }]
  },
  options:{scales:{y:{min:0,max:10}}}
});

// ===== Navigation =====
function show(id){pages.forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');}
startBtn?.addEventListener('click',()=>show('start-page'));
homeIcon.addEventListener('click',()=>show('start-page'));
graphIcon.addEventListener('click',()=>show('subjects-page'));
savedIcon.addEventListener('click',()=>{renderSaved();show('saved-page');});
document.querySelectorAll('.back-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(document.getElementById('subjects-page').classList.contains('active')) show('semester-page');
    else if(document.getElementById('semester-page').classList.contains('active')) show('department-page');
    else if(document.getElementById('department-page').classList.contains('active')) show('stream-page');
    else show('start-page');
  });
});

// ===== Signup/Login =====
signupBtn?.addEventListener('click',()=>{
  auth.createUserWithEmailAndPassword(emailInput.value,passwordInput.value)
    .then(()=>loginMsg.textContent="Signup successful!").catch(e=>loginMsg.textContent=e.message);
});
loginBtn?.addEventListener('click',()=>{
  auth.signInWithEmailAndPassword(emailInput.value,passwordInput.value)
    .then(()=>{loginMsg.textContent="Login successful!"; loadUserData(); show('start-page');})
    .catch(e=>loginMsg.textContent=e.message);
});

// ===== Stream Buttons =====
document.querySelectorAll('.stream-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.stream-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedStream = btn.dataset.stream.toLowerCase();
    showDepartments();
    show('department-page');
  });
});

// ===== Departments =====
function showDepartments(){
  departmentsDiv.innerHTML='';
  departments[selectedStream].forEach(dep=>{
    const b=document.createElement('button'); b.textContent=dep;
    b.addEventListener('click',()=>{
      document.querySelectorAll('#departments button').forEach(btn=>btn.classList.remove('active'));
      b.classList.add('active'); selectedDepartment=dep.toLowerCase();
      showSemesters(); show('semester-page');
    });
    departmentsDiv.appendChild(b);
  });
}

// ===== Semesters =====
function showSemesters(){
  semestersDiv.innerHTML='';
  for(let i=1;i<=maxSem;i++){
    const b=document.createElement('button'); b.textContent=`Semester ${i}`;
    b.addEventListener('click',()=>{
      document.querySelectorAll('#semesters button').forEach(btn=>btn.classList.remove('active'));
      b.classList.add('active'); selectedSemester=i; loadSubjects(); show('subjects-page');
    });
    semestersDiv.appendChild(b);
  }
}

// ===== Load Subjects =====
async function loadSubjects(){
  subjectsList.innerHTML=''; grades={};
  try{
    const res = await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data = await res.json();
    subjects = data.subjects || [];
    subjects.forEach(s=>{
      const div=document.createElement('div'); div.className='subject';
      div.innerHTML=`<strong>${s.code}</strong> - ${s.name} (${s.credits} cr)`;
      const gradeDiv=document.createElement('div'); gradeDiv.className='grade-buttons';
      Object.keys(gradePoints).forEach(g=>{
        const btn=document.createElement('button'); btn.textContent=g;
        btn.addEventListener('click',()=>{
          grades[s.code]=g;
          Array.from(gradeDiv.children).forEach(b=>b.classList.remove('selected'));
          btn.classList.add('selected');
        });
        gradeDiv.appendChild(btn);
      });
      div.appendChild(gradeDiv);
      subjectsList.appendChild(div);
    });

    // Load saved grades if any
    if(semesterCGPA[selectedSemester]?.grades){
      const saved = semesterCGPA[selectedSemester].grades;
      Object.keys(saved).forEach(code=>{
        document.querySelectorAll('.subject').forEach(div=>{
          if(div.innerText.includes(code)){
            div.querySelectorAll('button').forEach(b=>{
              if(b.textContent===saved[code]) b.classList.add('selected');
            });
          }
        });
      });
    }

  }catch{
    subjectsList.innerHTML="<p>Subjects not found!</p>";
  }
}

// ===== Calculate CGPA =====
calculateBtn?.addEventListener('click',()=>{
  if(Object.keys(grades).length!==subjects.length){alert("Select all grades"); return;}
  let total=0,credits=0;
  subjects.forEach(s=>{total+=gradePoints[grades[s.code]]*s.credits;credits+=s.credits;});
  const cgpa=(total/credits).toFixed(2);
  cgpaDisplay.textContent=`CGPA: ${cgpa}`;
  percentageDisplay.textContent=`Percentage: ${(cgpa*9.5).toFixed(2)}%`;
  encouragements.some(e=>{if(cgpa>=e.min){encouragementDisplay.textContent=e.msg;return true;}});
  saveSemesterCGPA(selectedSemester,cgpa,grades);
});

// ===== Save Semester to Firebase =====
function saveSemesterCGPA(sem,cgpa,grades){
  semesterCGPA[sem]={cgpa:parseFloat(cgpa),grades:{...grades}};
  const uid = auth.currentUser.uid;
  db.ref('users/'+uid+'/semesters').set(semesterCGPA);
  updateChart();
  renderSaved();
}

// ===== Update Chart.js =====
function updateChart(){
  chart.data.datasets[0].data=[...Array(maxSem).keys()].map(i=>semesterCGPA[i+1]?.cgpa||null);
  chart.update();
}

// ===== Load user data on login =====
function loadUserData(){
  const uid = auth.currentUser.uid;
  db.ref('users/'+uid+'/semesters').once('value').then(snapshot=>{
    semesterCGPA=snapshot.val()||{};
    updateChart();
  });
}

// ===== Saved Semesters Page =====
function renderSaved(){
  savedListDiv.innerHTML='';
  for(let i=1;i<=maxSem;i++){
    if(semesterCGPA[i]){
      const div=document.createElement('div'); div.className='saved-semester';
      div.innerHTML=`Semester ${i}: CGPA ${semesterCGPA[i].cgpa.toFixed(2)}
        <button onclick="editSemester(${i})">✏️ Edit</button>
        <button onclick="resetSemester(${i})">🗑️ Reset</button>`;
      savedListDiv.appendChild(div);
    }
  }
}

// ===== Edit / Reset =====
window.editSemester=(sem)=>{
  selectedSemester=sem;
  loadSubjects();
  show('subjects-page');
};

window.resetSemester=(sem)=>{
  delete semesterCGPA[sem];
  const uid = auth.currentUser.uid;
  db.ref('users/'+uid+'/semesters').set(semesterCGPA);
  updateChart();
  renderSaved();
  if(selectedSemester===sem){
    subjectsList.innerHTML=''; cgpaDisplay.textContent=''; percentageDisplay.textContent=''; encouragementDisplay.textContent='';
  }
};