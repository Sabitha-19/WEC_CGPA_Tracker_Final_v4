// =================== Data ===================
const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };
const subjectsData = {
  1:[{name:"Maths",credits:4},{name:"Physics",credits:3}],
  2:[{name:"Chemistry",credits:3},{name:"English",credits:2}],
  // Add all your semesters and subjects here
};

let selectedSemester = null;
let semesterGPAs = JSON.parse(localStorage.getItem('semesterGPAs')) || Array(8).fill(null);

// =================== Navigation ===================
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('start-btn').addEventListener('click',()=>showPage('semester-page'));
document.getElementById('back-sem').addEventListener('click',()=>showPage('home-page'));
document.getElementById('back-to-sem').addEventListener('click',()=>showPage('semester-page'));
document.querySelectorAll('.back-btn').forEach(btn=>btn.addEventListener('click',()=>showPage('home-page')));

// =================== Semester Buttons ===================
const semestersDiv = document.getElementById('semesters');
for(let i=1;i<=8;i++){
  const b=document.createElement('button'); b.textContent=`Semester ${i}`;
  b.addEventListener('click',()=>{
    selectedSemester=i;
    loadSubjects();
    showPage('subjects-page');
  });
  semestersDiv.appendChild(b);
}

// =================== Load Subjects ===================
const subjectsListDiv = document.getElementById('subjects-list');
function loadSubjects(){
  subjectsListDiv.innerHTML='';
  const subjects = subjectsData[selectedSemester];
  subjects.forEach((sub,index)=>{
    const div=document.createElement('div');
    div.innerHTML=`${sub.name} (${sub.credits} cr)
      <select id="grade-${index}">
        ${Object.keys(gradePoints).map(g=>`<option value="${g}">${g}</option>`).join('')}
      </select>`;
    subjectsListDiv.appendChild(div);
  });
}

// =================== GPA Calculation ===================
document.getElementById('calculate-gpa').addEventListener('click',()=>{
  const subjects = subjectsData[selectedSemester];
  let totalPoints=0, totalCredits=0;
  subjects.forEach((sub,index)=>{
    const grade=document.getElementById(`grade-${index}`).value;
    totalPoints += gradePoints[grade]*sub.credits;
    totalCredits += sub.credits;
  });
  const gpa = (totalPoints/totalCredits).toFixed(2);
  semesterGPAs[selectedSemester-1] = parseFloat(gpa);
  localStorage.setItem('semesterGPAs',JSON.stringify(semesterGPAs));
  displayResults();
  renderChart();
});

// =================== Display Results ===================
function displayResults(){
  const gpa = semesterGPAs[selectedSemester-1];
  const cgpa = (semesterGPAs.filter(g=>g!==null).reduce((a,b)=>a+b,0)/semesterGPAs.filter(g=>g!==null).length).toFixed(2);
  document.getElementById('gpa').textContent=`GPA: ${gpa}`;
  document.getElementById('cgpa').textContent=`CGPA: ${cgpa}`;
  document.getElementById('percentage').textContent=`Percentage: ${(cgpa*9.5).toFixed(2)}%`;
  document.getElementById('advice').textContent = gpa>=8 ? "Excellent! Keep it up." : "Good! Focus on improving slightly.";
}

// =================== Chart ===================
let chart=null;
function renderChart(){
  const ctx = document.getElementById('gpaChart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx,{
    type:'line',
    data:{
      labels:['Sem1','Sem2','Sem3','Sem4','Sem5','Sem6','Sem7','Sem8'],
      datasets:[{ label:'Semester GPA', data:semesterGPAs, borderColor:'#6a11cb', backgroundColor:'#aabbff66', fill:true }]
    },
    options:{ responsive:true, scales:{ y:{ min:0, max:10 } } }
  });
}

// =================== Floating Buttons ===================
const faqBtn = document.getElementById('faq-btn');
const savedBtn = document.getElementById('saved-btn');
const savedList = document.getElementById('saved-list');

faqBtn.addEventListener('click',()=>showPage('faq-page'));
savedBtn.addEventListener('click',()=>{
  showPage('saved-page');
  renderSavedSemesters();
});

// Render Saved Semesters
function renderSavedSemesters(){
  savedList.innerHTML='';
  semesterGPAs.forEach((gpa,i)=>{
    if(gpa!==null && gpa!==undefined){
      const div=document.createElement('div'); div.className='saved-item';
      div.innerHTML=`<span>Semester ${i+1}:</span> <span>GPA: ${gpa}</span>`;
      const delBtn=document.createElement('button'); delBtn.textContent='Delete';
      delBtn.addEventListener('click',()=>{
        semesterGPAs[i]=null;
        localStorage.setItem('semesterGPAs',JSON.stringify(semesterGPAs));
        renderSavedSemesters();
        renderChart();
      });
      div.appendChild(delBtn);
      savedList.appendChild(div);
    }
  });
}

// FAQ Click
document.querySelectorAll('.faq-item .question').forEach(q=>{
  q.addEventListener('click',()=>alert("This is a placeholder answer. You can add the real answer here."));
});