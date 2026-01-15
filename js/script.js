let selectedStream = '', selectedDepartment = '', selectedSemester = 0;
let grades = {}, subjects = [];
let savedSemesters = JSON.parse(localStorage.getItem('savedSemesters')) || [];
let semesterChart;

const departments = {engineering:["CSE","ISE","ECE","EEE","AA"],bcom:["BCOM"]};
const gradePoints = {S:10,A:9,B:8,C:7,D:6,E:5,F:0};
const encouragements = [
  { min:9, msg:"Excellent work! Keep it up!" },
  { min:8, msg:"Very good! You can reach the top!" },
  { min:7, msg:"Good! Focus on improving slightly." },
  { min:5, msg:"Average. Need more effort." },
  { min:0, msg:"Work harder! You can improve!" }
];

function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');}
function goBack(){
  if(document.getElementById('subjects-page').classList.contains('active')) showPage('semester-page');
  else if(document.getElementById('semester-page').classList.contains('active')) showPage('department-page');
  else if(document.getElementById('department-page').classList.contains('active')) showPage('stream-page');
  else showPage('start-page');
}

document.getElementById('start-btn').addEventListener('click',()=>showPage('stream-page'));

function selectStream(stream){
  selectedStream = stream;
  document.querySelectorAll('.cube-btn').forEach(b=>b.classList.remove('active'));
  event.target.classList.add('active');
  showDepartments(); showPage('department-page');
}

function showDepartments(){
  const deptGrid = document.getElementById('department-grid'); deptGrid.innerHTML='';
  departments[selectedStream].forEach(dep=>{
    const btn=document.createElement('button'); btn.className='cube-btn'; btn.innerText=dep;
    btn.onclick=()=>selectDepartment(dep.toLowerCase());
    deptGrid.appendChild(btn);
  });
}

function selectDepartment(dep){
  selectedDepartment=dep;
  document.querySelectorAll('#department-grid .cube-btn').forEach(b=>b.classList.remove('active'));
  event.target.classList.add('active');
  showSemesters(); showPage('semester-page');
}

function showSemesters(){
  const semGrid=document.getElementById('semester-grid'); semGrid.innerHTML='';
  for(let i=1;i<=8;i++){
    const btn=document.createElement('button'); btn.className='cube-btn'; btn.innerText='Semester '+i;
    btn.onclick=()=>selectSemester(i); semGrid.appendChild(btn);
  }
}

function selectSemester(sem){
  selectedSemester=sem;
  document.querySelectorAll('#semester-grid .cube-btn').forEach(b=>b.classList.remove('active'));
  event.target.classList.add('active'); loadSubjects();
}

function loadSubjects(){
  const list=document.getElementById('subjects-list'); list.innerHTML=''; grades={};
  const filePath=`data/${selectedDepartment}_sem${selectedSemester}.json`;
  fetch(filePath).then(res=>{if(!res.ok)throw new Error('File not found');return res.json();})
  .then(data=>{subjects=data.subjects||data;
    subjects.forEach(sub=>{
      const div=document.createElement('div'); div.className='subject';
      div.innerHTML=`<div><strong>${sub.code}</strong><br>${sub.name} (${sub.credits} credits)</div>
        <div class="grade-buttons">${Object.keys(gradePoints).map(g=>`<button onclick="selectGrade('${sub.code}','${g}',this)">${g}</button>`).join('')}</div>`;
      list.appendChild(div);
    });
    showPage('subjects-page');
  }).catch(err=>{alert("Subjects file missing!\n"+filePath);console.error(err);});
}

function selectGrade(code,grade,btn){grades[code]=grade; btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');}

document.getElementById('calculate-btn').addEventListener('click',()=>{
  let totalCredits=0,totalPoints=0;
  for(let sub of subjects){if(!grades[sub.code]){alert("Please select all grades!"); return;}
    totalCredits+=sub.credits; totalPoints+=sub.credits*gradePoints[grades[sub.code]];
  }
  const gpa=(totalPoints/totalCredits).toFixed(2);
  const cgpa=gpa;
  const percentage=(cgpa*9.5).toFixed(2);
  document.getElementById('gpa-display').innerText="GPA: "+gpa;
  document.getElementById('cgpa-display').innerText="CGPA: "+cgpa;
  document.getElementById('percentage-display').innerText="Percentage: "+percentage+"%";
  for(let e of encouragements){if(cgpa>=e.min){document.getElementById('encouragement').innerText=e.msg;break;}}
  showPage('result-page');
});

function saveSemester(){
  savedSemesters.push({department:selectedDepartment,semester:selectedSemester,gpa:document.getElementById('gpa-display').innerText.split(": ")[1]});
  localStorage.setItem('savedSemesters',JSON.stringify(savedSemesters));
  alert("Semester saved 💾");
}

function openGraph(){
  showPage('graph-page');
  const semesterData=Array(8).fill(null); savedSemesters.forEach(s=>semesterData[s.semester-1]=parseFloat(s.gpa));
  const ctx=document.getElementById('semesterChart').getContext('2d'); if(semesterChart) semesterChart.destroy();
  semesterChart=new Chart(ctx,{type:'line',data:{labels:['Sem1','Sem2','Sem3','Sem4','Sem5','Sem6','Sem7','Sem8'],datasets:[{label:'Semester GPA',data:semesterData,borderColor:'#6a11cb',backgroundColor:'rgba(106,17,203,0.25)',fill:true,tension:0.4,pointRadius:6,pointHoverRadius:7,pointBackgroundColor:'#fff',pointBorderColor:'#6a11cb',pointBorderWidth:3} ]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{min:0,max:10,ticks:{stepSize:2,color:'#666'},grid:{color:'rgba(0,0,0,0.08)'}},x:{ticks:{color:'#666'},grid:{display:false}}}}});
}
