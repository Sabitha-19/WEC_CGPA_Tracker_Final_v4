// Sample data structure
const departments = {
  "Engineering": ["CSE", "ECE", "EEE", "MECH"],
  "Commerce": ["BCOM"]
};
const semesters = [1,2,3,4,5,6,7,8];
const subjectsData = {
  "CSE": {
    1: [{name:"Maths",credits:4},{name:"Physics",credits:3}],
    2: [{name:"Programming",credits:4},{name:"Chemistry",credits:3}]
  },
  "ECE": {1:[{name:"Maths",credits:4},{name:"Physics",credits:3}]},
  "EEE": {1:[{name:"Maths",credits:4},{name:"Physics",credits:3}]},
  "MECH": {1:[{name:"Maths",credits:4},{name:"Physics",credits:3}]},
  "BCOM": {1:[{name:"Accounts",credits:4},{name:"Economics",credits:3}]}
};
const gradePoints = {S:10,A:9,B:8,C:7,D:6,E:5,F:0};
let current = {stream:null,dept:null,sem:null};
let selectedGrades = {};

// Show page
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Stream Buttons
const streamContainer = document.getElementById('stream-buttons');
for(let s in departments){
  let btn = document.createElement('button');
  btn.textContent = s;
  btn.onclick = ()=>{
    current.stream = s;
    showDepartments();
  };
  streamContainer.appendChild(btn);
}

// Department Buttons
function showDepartments(){
  showPage('department-page');
  const deptContainer = document.getElementById('department-buttons');
  deptContainer.innerHTML = '';
  departments[current.stream].forEach(d=>{
    let btn = document.createElement('button');
    btn.textContent = d;
    btn.onclick = ()=>{
      current.dept = d;
      showSemesters();
    };
    deptContainer.appendChild(btn);
  });
}

// Semester Buttons
function showSemesters(){
  showPage('semester-page');
  const semContainer = document.getElementById('semester-buttons');
  semContainer.innerHTML = '';
  semesters.forEach(s=>{
    let btn = document.createElement('button');
    btn.textContent = "Semester " + s;
    btn.onclick = ()=>{
      current.sem = s;
      showSubjects();
    };
    semContainer.appendChild(btn);
  });
}

// Show Subjects
function showSubjects(){
  showPage('subjects-page');
  selectedGrades = {};
  const list = document.getElementById('subjects-list');
  list.innerHTML = '';
  const subjects = subjectsData[current.dept][current.sem];
  subjects.forEach((sub,i)=>{
    let div = document.createElement('div');
    div.className = 'subject';
    div.innerHTML = `<span>${sub.name} (${sub.credits} cr)</span>
    <span class="grade-buttons" id="sub-${i}"></span>`;
    list.appendChild(div);
    const gradeContainer = div.querySelector('.grade-buttons');
    ['S','A','B','C','D','E','F'].forEach(g=>{
      let b = document.createElement('button');
      b.textContent = g;
      b.onclick = ()=>{
        selectedGrades[sub.name] = g;
        Array.from(gradeContainer.children).forEach(btn=>btn.classList.remove('selected'));
        b.classList.add('selected');
      };
      gradeContainer.appendChild(b);
    });
  });
}

// Calculate GPA
function calculateGPA(){
  const subjects = subjectsData[current.dept][current.sem];
  let totalCredits = 0, totalPoints = 0;
  subjects.forEach(sub=>{
    let grade = selectedGrades[sub.name];
    if(grade){
      totalCredits += sub.credits;
      totalPoints += sub.credits*gradePoints[grade];
    }
  });
  if(totalCredits===0){alert("Select grades for all subjects"); return;}
  let gpa = (totalPoints/totalCredits).toFixed(2);
  document.getElementById('results').innerHTML = `GPA: ${gpa} 🌟`;
  saveSemester(current.dept,current.sem,gpa);
  updateChart();
}

// Reset Subjects
function resetSubjects(){
  selectedGrades = {};
  showSubjects();
}

// Local Storage
function saveSemester(dept,sem,gpa){
  let data = JSON.parse(localStorage.getItem('semesters')||'{}');
  if(!data[dept]) data[dept]={};
  data[dept][sem]=gpa;
  localStorage.setItem('semesters',JSON.stringify(data));
}

// Chart.js
let ctx = document.getElementById('gpaChart').getContext('2d');
let gpaChart = new Chart(ctx,{
  type:'line',
  data:{
    labels:semesters.map(s=>"Sem "+s),
    datasets:[{label:'GPA',data:[],borderColor:'#3b2cff',fill:false,tension:0.1}]
  },
  options:{responsive:true,scales:{y:{min:0,max:10}}}
});

function updateChart(){
  let data = JSON.parse(localStorage.getItem('semesters')||'{}');
  let deptData = data[current.dept]||{};
  gpaChart.data.datasets[0].data = semesters.map(s=>deptData[s]||null);
  gpaChart.update();
}