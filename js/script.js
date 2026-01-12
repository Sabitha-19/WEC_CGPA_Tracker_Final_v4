// ===== Variables =====
const pages = document.querySelectorAll('.page');
const startBtn = document.getElementById('start-btn');
const streamsDiv = document.getElementById('streams');
const departmentsDiv = document.getElementById('departments');
const semestersDiv = document.getElementById('semesters');
const subjectsList = document.getElementById('subjects-list');
const calculateBtn = document.getElementById('calculate-btn');
const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');

const gpaDisplay = document.getElementById('gpa-display');
const cgpaDisplay = document.getElementById('cgpa-display');
const percentageDisplay = document.getElementById('percentage-display');
const encouragementDisplay = document.getElementById('encouragement');

const homeIcon = document.getElementById('home-icon');
const graphIcon = document.getElementById('graph-icon');
const saveIcon = document.getElementById('save-icon');

// ===== Constants =====
const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };
const encouragements = [
  { min:9, msg:"Excellent work! Keep it up!" },
  { min:8, msg:"Very good! You can reach the top!" },
  { min:7, msg:"Good! Focus on improving slightly." },
  { min:5, msg:"Average. Need more effort." },
  { min:0, msg:"Work harder! You can improve!" }
];
const departments = {
  engineering:["CSE","ISE","ECE","EEE","AA"],
  bcom:["BCOM"]
};

// ===== State =====
let selectedStream = '';
let selectedDepartment = '';
let selectedSemester = 0;
let subjects = [];
let grades = {};
let semesterGPAs = JSON.parse(localStorage.getItem('semesterGPAs')) || Array(8).fill(null);

// ===== Navigation =====
function showPage(id){
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

startBtn.addEventListener('click', () => showPage('stream-page'));
homeIcon.addEventListener('click', () => showPage('start-page'));
graphIcon.addEventListener('click', () => showPage('subjects-page'));

// Back Buttons
document.querySelectorAll('.back-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(document.getElementById('subjects-page').classList.contains('active')) showPage('semester-page');
    else if(document.getElementById('semester-page').classList.contains('active')) showPage('department-page');
    else if(document.getElementById('department-page').classList.contains('active')) showPage('stream-page');
    else showPage('start-page');
  });
});

// ===== STREAM BUTTONS =====
document.querySelectorAll('.stream-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.stream-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedStream = btn.dataset.stream.toLowerCase();
    showDepartments();
    showPage('department-page');
  });
});

// ===== DEPARTMENTS =====
function showDepartments(){
  departmentsDiv.innerHTML='';
  departments[selectedStream].forEach(dep=>{
    const b = document.createElement('button');
    b.textContent = dep;
    b.addEventListener('click',()=>{
      document.querySelectorAll('#departments button').forEach(btn=>btn.classList.remove('active'));
      b.classList.add('active');
      selectedDepartment = dep.toLowerCase();
      showSemesters();
      showPage('semester-page');
    });
    departmentsDiv.appendChild(b);
  });
}

// ===== SEMESTERS =====
function showSemesters(){
  semestersDiv.innerHTML='';
  for(let i=1;i<=8;i++){
    const b=document.createElement('button');
    b.textContent=`Semester ${i}`;
    b.addEventListener('click',()=>{
      document.querySelectorAll('#semesters button').forEach(btn=>btn.classList.remove('active'));
      b.classList.add('active');
      selectedSemester=i;
      loadSubjects();
      showPage('subjects-page');
    });
    semestersDiv.appendChild(b);
  }
}

// ===== LOAD SUBJECTS =====
async function loadSubjects(){
  subjectsList.innerHTML='';
  grades = {};
  try{
    const res = await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data = await res.json();
    subjects = data.subjects || [];

    subjects.forEach(s=>{
      const div = document.createElement('div');
      div.className = 'subject';
      div.innerHTML = `<strong>${s.code}</strong> - ${s.name} (${s.credits} cr)`;

      const gradeDiv = document.createElement('div');
      gradeDiv.className = 'grade-buttons';

      Object.keys(gradePoints).forEach(g=>{
        const btn = document.createElement('button');
        btn.textContent = g;
        btn.addEventListener('click',()=>{
          grades[s.code] = g;
          Array.from(gradeDiv.children).forEach(b=>b.classList.remove('selected'));
          btn.classList.add('selected');
        });
        gradeDiv.appendChild(btn);
      });

      div.appendChild(gradeDiv);
      subjectsList.appendChild(div);
    });

    // Load saved grades
    const saved = JSON.parse(localStorage.getItem(`${selectedDepartment}_sem${selectedSemester}`)) || {};
    Object.keys(saved).forEach(code=>{
      grades[code] = saved[code];
      document.querySelectorAll('.subject').forEach(div=>{
        if(div.innerText.includes(code)){
          div.querySelectorAll('button').forEach(b=>{
            if(b.textContent === saved[code]) b.classList.add('selected');
          });
        }
      });
    });

  }catch{
    subjectsList.innerHTML = "<p>Subjects not found!</p>";
  }
}

// ===== GPA & CGPA =====
calculateBtn.addEventListener('click',()=>{
  if(Object.keys(grades).length !== subjects.length){
    alert("Please select all grades");
    return;
  }

  let total = 0, credits = 0;
  subjects.forEach(s=>{
    total += gradePoints[grades[s.code]] * s.credits;
    credits += s.credits;
  });

  const gpa = (total/credits).toFixed(2);
  gpaDisplay.textContent = `GPA: ${gpa}`;

  // Save semester automatically
  semesterGPAs[selectedSemester-1] = parseFloat(gpa);
  localStorage.setItem('semesterGPAs', JSON.stringify(semesterGPAs));
  localStorage.setItem(`${selectedDepartment}_sem${selectedSemester}`, JSON.stringify(grades));

  const valid = semesterGPAs.filter(v=>v!==null);
  const cgpa = (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2);

  cgpaDisplay.textContent = `CGPA: ${cgpa}`;
  percentageDisplay.textContent = `Percentage: ${(cgpa*9.5).toFixed(2)}%`;

  encouragements.some(e=>{
    if(cgpa >= e.min){
      encouragementDisplay.textContent = e.msg;
      return true;
    }
  });

  updateChart();
});

// ===== EDIT & DELETE =====
editBtn.addEventListener('click', loadSubjects);

deleteBtn.addEventListener('click',()=>{
  localStorage.removeItem(`${selectedDepartment}_sem${selectedSemester}`);
  semesterGPAs[selectedSemester-1] = null;
  localStorage.setItem('semesterGPAs', JSON.stringify(semesterGPAs));
  subjectsList.innerHTML='';
  gpaDisplay.textContent='';
  cgpaDisplay.textContent='';
  percentageDisplay.textContent='';
  encouragementDisplay.textContent='';
  updateChart();
});

// ===== SAVE SEMESTER ICON =====
saveIcon.addEventListener('click',()=>{
  if(selectedDepartment && selectedSemester && Object.keys(grades).length === subjects.length){
    localStorage.setItem(`${selectedDepartment}_sem${selectedSemester}`, JSON.stringify(grades));
    semesterGPAs[selectedSemester-1] = parseFloat(gpaDisplay.textContent.split(': ')[1]);
    localStorage.setItem('semesterGPAs', JSON.stringify(semesterGPAs));
    alert(`Semester ${selectedSemester} saved! ✅`);
  } else {
    alert("Complete all grades before saving!");
  }
});

// ===== CHART =====
const ctx = document.getElementById('gpa-chart').getContext('2d');
const gpaChart = new Chart(ctx,{
  type:'line',
  data:{
    labels:['Sem1','Sem2','Sem3','Sem4','Sem5','Sem6','Sem7','Sem8'],
    datasets:[{
      label:'Semester GPA',
      data:semesterGPAs,
      borderColor:'rgba(106,17,203,1)',
      backgroundColor:'rgba(37,117,252,0.3)',
      fill:true,
      tension:0.3
    }]
  },
  options:{ scales:{ y:{ min:0,max:10 } } }
});

function updateChart(){
  gpaChart.data.datasets[0].data = semesterGPAs;
  gpaChart.update();
}