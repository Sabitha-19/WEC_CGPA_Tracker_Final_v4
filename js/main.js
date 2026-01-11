// Grade points
const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

// Streams & Departments
const streams = { engineering:["CSE","ISE","ECE","EEE","AA"], bcom:["BCOM"] };

let state = { stream:null, dept:null, sem:null, grades:{}, gpaHistory:Array(8).fill(null) };
let chart;

document.getElementById('continueBtn').onclick = ()=>show('stream');
document.querySelectorAll('.back').forEach(b=>b.onclick = ()=>show(b.dataset.target));

function show(id){
  document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Streams
const streamDiv = document.getElementById('streamList');
streams.engineering.concat(streams.bcom).forEach(s=>{
  const btn = document.createElement('button');
  btn.textContent = s;
  btn.className='button-grid';
  btn.onclick = ()=>{
    state.stream = s.toLowerCase();
    loadDepartments(state.stream);
  };
  streamDiv.appendChild(btn);
});

// Departments
function loadDepartments(stream){
  const deptDiv = document.getElementById('deptList');
  deptDiv.innerHTML = '';
  streams[stream].forEach(d=>{
    const btn = document.createElement('button');
    btn.textContent = d;
    btn.onclick = ()=>{
      state.dept = d.toLowerCase();
      loadSemesters();
    };
    deptDiv.appendChild(btn);
  });
  show('department');
}

// Semesters
function loadSemesters(){
  const semDiv = document.getElementById('semList');
  semDiv.innerHTML = '';
  for(let i=1;i<=8;i++){
    const btn = document.createElement('button');
    btn.textContent = `Semester ${i}`;
    btn.onclick = ()=>{
      state.sem = i;
      loadSubjects();
    };
    semDiv.appendChild(btn);
  }
  show('semester');
}

// Load subjects from JSON
function loadSubjects(){
  const list = document.getElementById('subjectList');
  list.innerHTML = '';
  document.getElementById('semTitle').innerText = `Semester ${state.sem}`;

  const path = `data/${state.dept}_sem${state.sem}.json`;
  fetch(path)
    .then(res=>res.json())
    .then(subjects=>{
      state.grades = {};
      subjects.forEach((sub,i)=>{
        const card = document.createElement('div');
        card.className='subject-card';
        card.innerHTML = `<span>${sub.name} (${sub.credits} cr)</span>`;
        const btnDiv = document.createElement('div');
        btnDiv.className='grade-buttons';
        Object.keys(gradePoints).forEach(g=>{
          const gBtn = document.createElement('button');
          gBtn.textContent = g;
          gBtn.onclick = ()=>{
            state.grades[i]=gradePoints[g];
            btnDiv.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
            gBtn.classList.add('selected');
            calculateGPA();
          };
          btnDiv.appendChild(gBtn);
        });
        card.appendChild(btnDiv);
        list.appendChild(card);
      });
      show('subjects');
    })
    .catch(e=>{
      alert('Subject file not found!');
    });
}

// Calculate GPA + CGPA + encouragement
function calculateGPA(){
  const subs = Object.values(state.grades);
  if(subs.length==0 || subs.includes(undefined)) return;
  const credits = subs.length*3; // Assuming 3 credits each, adjust if needed
  const total = subs.reduce((a,b)=>a+b,0);
  const gpa = (total/subs.length).toFixed(2);
  state.gpaHistory[state.sem-1]=Number(gpa);
  document.getElementById('gpa').innerText = gpa;
  const cgpa = (state.gpaHistory.filter(x=>x!=null).reduce((a,b)=>a+b,0)/state.gpaHistory.filter(x=>x!=null).length).toFixed(2);
  document.getElementById('cgpa').innerText=cgpa;
  document.getElementById('percentage').innerText=(cgpa*9.5).toFixed(2)+'%';
  document.getElementById('encouragement').innerText = (gpa>=9)?"Excellent! Keep it up 💯":(gpa>=7)?"Good Job! 👍":"Keep Trying! 🔔";
  drawChart();
}