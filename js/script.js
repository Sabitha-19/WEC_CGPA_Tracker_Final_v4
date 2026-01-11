// --- Global Variables ---
let selectedStream = '';
let selectedDept = '';
let selectedSem = '';
let subjects = [];
let semesterGrades = JSON.parse(localStorage.getItem('savedSemesters') || '{}');

// Store all subject JSON data here for instant access
let allSubjectsData = {};  

// --- Navigation ---
function showPage(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// --- Start Button ---
document.getElementById('start-btn').addEventListener('click', ()=> showPage('info-page'));

// --- Next Buttons ---
document.querySelectorAll('.next-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const next = btn.dataset.next;
    showPage(next);
  });
});

// --- Stream Selection ---
document.querySelectorAll('.stream-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    selectedStream = btn.dataset.stream;
    loadDepartments(selectedStream);
    showPage('department-page');
  });
});

// --- Load Departments ---
const departmentsList = {
  engineering: ["CSE","ISE","ECE","EEE","AA"],
  bcom: ["BCOM"]
};
function loadDepartments(stream){
  const container = document.getElementById('departments');
  container.innerHTML = '';
  departmentsList[stream].forEach(dept=>{
    const btn = document.createElement('button');
    btn.classList.add('btn-purple');
    btn.textContent = dept;
    btn.addEventListener('click', ()=>{
      selectedDept = dept;
      showPage('semester-page');
    });
    container.appendChild(btn);
  });
}

// --- Semester Selection ---
document.querySelectorAll('.semester-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    selectedSem = btn.dataset.sem;
    loadSubjects();
  });
});

// --- Preload All Subjects Data ---
async function preloadAllSubjects() {
  const deptArray = Object.values(departmentsList).flat();
  const semArray = [1,2,3,4,5,6,7,8];
  for(const dept of deptArray){
    allSubjectsData[dept] = {};
    for(const sem of semArray){
      try{
        const res = await fetch(`data/${dept.toLowerCase()}_sem${sem}.json`);
        if(res.ok){
          allSubjectsData[dept][sem] = await res.json();
        }
      }catch(err){ /* skip missing files */ }
    }
  }
}

// Call preload at the start
preloadAllSubjects();

// --- Load Subjects Dynamically ---
function loadSubjects(){
  subjects = allSubjectsData[selectedDept][selectedSem];
  if(!subjects){
    alert('Subjects data not found for this semester!');
    return;
  }
  generateGradeForm();
  showPage('grades-page');
}

// --- Generate Grade Form ---
const gradePoints = { S:10,A:9,B:8,C:7,D:6,E:5,F:0 };
function generateGradeForm(){
  const form = document.getElementById('grades-form');
  form.innerHTML = '';
  subjects.forEach((sub,idx)=>{
    const label = document.createElement('label');
    label.textContent = sub.name + ` (${sub.credits} credits)`;
    const select = document.createElement('select');
    select.name = idx;
    ['S','A','B','C','D','E','F'].forEach(g=>{
      const option = document.createElement('option');
      option.value = g;
      option.textContent = g;
      if(semesterGrades[selectedDept+'_'+selectedSem] && semesterGrades[selectedDept+'_'+selectedSem][sub.name] === g){
        option.selected = true;
      }
      select.appendChild(option);
    });
    label.appendChild(select);
    form.appendChild(label);
  });
}

// --- Save Semester ---
document.getElementById('save-semester').addEventListener('click', ()=>{
  const form = document.getElementById('grades-form');
  const grades = {};
  subjects.forEach((sub,idx)=>{
    grades[sub.name] = form[idx].value;
  });
  semesterGrades[selectedDept+'_'+selectedSem] = grades;
  localStorage.setItem('savedSemesters',JSON.stringify(semesterGrades));
  calculateResult();
});

// --- Reset Semester ---
document.getElementById('reset-semester').addEventListener('click', ()=>{
  if(semesterGrades[selectedDept+'_'+selectedSem]){
    delete semesterGrades[selectedDept+'_'+selectedSem];
    localStorage.setItem('savedSemesters',JSON.stringify(semesterGrades));
    generateGradeForm();
    alert('Semester reset successfully!');
  }
});

// --- Calculate GPA/CGPA instantly ---
function calculateResult(){
  // Semester GPA
  const grades = semesterGrades[selectedDept+'_'+selectedSem];
  let totalCredits=0,totalPoints=0;
  subjects.forEach(sub=>{
    const g = grades[sub.name];
    totalCredits += sub.credits;
    totalPoints += (gradePoints[g]||0)*sub.credits;
  });
  const gpa = (totalPoints/totalCredits).toFixed(2);

  // CGPA for all saved semesters
  let totalC=0, totalP=0;
  Object.keys(semesterGrades).forEach(key=>{
    const [dept, sem] = key.split('_');
    const subs = allSubjectsData[dept][sem];
    const gds = semesterGrades[key];
    subs.forEach(s=>{
      totalC += s.credits;
      totalP += (gradePoints[gds[s.name]]||0)*s.credits;
    });
  });
  const cgpa = (totalP/totalC).toFixed(2);
  const percent = (cgpa*9.5).toFixed(2);

  document.getElementById('gpa-display').textContent = `Semester GPA: ${gpa}`;
  document.getElementById('cgpa-display').textContent = `CGPA: ${cgpa} (${percent}%)`;

  drawChart();
  showPage('result-page');
}

// --- Draw Chart instantly ---
function drawChart(){
  const labels = [], data = [];
  Object.keys(semesterGrades).forEach(key=>{
    const [dept, sem] = key.split('_');
    const subs = allSubjectsData[dept][sem];
    const grades = semesterGrades[key];
    let totalC=0,totalP=0;
    subs.forEach(s=>{
      totalC += s.credits;
      totalP += (gradePoints[grades[s.name]]||0)*s.credits;
    });
    labels.push(key.replace('_',' Sem '));
    data.push((totalP/totalC).toFixed(2));
  });

  const ctx = document.getElementById('gpa-chart').getContext('2d');
  if(window.chartInstance) window.chartInstance.destroy(); // Destroy previous chart
  window.chartInstance = new Chart(ctx,{
    type:'bar',
    data:{
      labels:labels,
      datasets:[{
        label:'Semester GPA',
        data:data,
        backgroundColor:'rgba(142,45,226,0.7)',
        borderRadius:5
      }]
    },
    options:{
      responsive:true,
      scales:{y:{beginAtZero:true, max:10}}
    }
  });
}