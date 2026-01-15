// GLOBAL STATE
let selectedStream = "";
let selectedDepartment = "";
let selectedSemester = "";
let grades = {};
let savedSemesters = JSON.parse(localStorage.getItem("savedSemesters")) || [];
let semesterChart = null;

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

// =====================
// PAGE NAVIGATION
// =====================
function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// HEADER ICONS
document.getElementById("home-icon")?.addEventListener("click", ()=> showPage("start-page"));
document.getElementById("graph-icon")?.addEventListener("click", ()=> { showPage("graph-page"); renderSemesterGraph(); });

// =====================
// START BUTTON
// =====================
document.getElementById("start-btn")?.addEventListener("click", ()=> {
  showPage("stream-page");
});

// =====================
// STREAM BUTTONS
document.querySelectorAll(".stream-btn").forEach(btn => {
  btn.addEventListener("click", ()=> {
    document.querySelectorAll(".stream-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    selectedStream = btn.dataset.stream;
    loadDepartments();
    showPage("department-page");
  });
});

// =====================
// LOAD DEPARTMENTS
// =====================
function loadDepartments(){
  const deptDiv = document.getElementById("departments");
  deptDiv.innerHTML = "";
  let departments = [];
  if(selectedStream === "engineering") departments = ["cse","ece","eee","ise","aa"];
  else if(selectedStream === "bcom") departments = ["bcom"];
  
  departments.forEach(dept=>{
    const btn = document.createElement("button");
    btn.className = "department-btn";
    btn.textContent = dept.toUpperCase();
    btn.dataset.department = dept;
    btn.onclick = ()=> {
      document.querySelectorAll(".department-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      selectedDepartment = dept;
      loadSemesters();
      showPage("semester-page");
    };
    deptDiv.appendChild(btn);
  });
}

// =====================
// LOAD SEMESTERS
// =====================
function loadSemesters(){
  const semDiv = document.getElementById("semesters");
  semDiv.innerHTML = "";
  let maxSem = (selectedDepartment === "bcom") ? 6 : 8;

  for(let i=1;i<=maxSem;i++){
    const btn = document.createElement("button");
    btn.className = "semester-btn";
    btn.textContent = `Semester ${i}`;
    btn.dataset.semester = i;
    btn.onclick = ()=>{
      document.querySelectorAll(".semester-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      selectedSemester = i;
      loadSubjects();
    };
    semDiv.appendChild(btn);
  }
}

// =====================
// LOAD SUBJECTS
// =====================
function loadSubjects(){
  const list = document.getElementById("subjects-list");
  list.innerHTML = "";
  grades = {};
  const filePath = `data/${selectedDepartment}_sem${selectedSemester}.json`;
  
  fetch(filePath)
    .then(res=>{ if(!res.ok) throw new Error("File not found"); return res.json(); })
    .then(subjects=>{
      subjects.forEach(sub=>{
        const div = document.createElement("div");
        div.className="subject";
        div.innerHTML = `
          <div><strong>${sub.code}</strong><br>${sub.name} (${sub.credits} credits)</div>
          <div class="grade-buttons">
            ${Object.keys(gradePoints).map(g=>`<button onclick="selectGrade('${sub.code}','${g}',this)">${g}</button>`).join("")}
          </div>
        `;
        list.appendChild(div);
      });
      showPage("subjects-page");
    })
    .catch(err=>{
      alert("❌ Subjects file missing:\n"+filePath);
      console.error(err);
    });
}

// =====================
// SELECT GRADE
// =====================
function selectGrade(code, grade, btn){
  grades[code] = grade;
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
  btn.classList.add("selected");
}

// =====================
// CALCULATE GPA
// =====================
document.getElementById("calculate-btn")?.addEventListener("click", ()=>{
  let totalCredits=0,totalPoints=0;
  document.querySelectorAll(".subject").forEach(sub=>{
    const code = sub.querySelector("strong").innerText;
    const credits = parseInt(sub.innerHTML.match(/\((\d+) credits\)/)[1]);
    if(grades[code]){
      totalCredits+=credits;
      totalPoints+=credits*gradePoints[grades[code]];
    }
  });

  if(totalCredits===0){ alert("Select all grades"); return; }

  const gpa = (totalPoints/totalCredits).toFixed(2);
  const percent = (gpa*9.5).toFixed(2);

  document.getElementById("cgpa-display").innerText = `CGPA: ${gpa}`;
  document.getElementById("percentage-display").innerText = `Percentage: ${percent}%`;
  document.getElementById("encouragement").innerText = gpa>=8?"Excellent 💜":gpa>=6?"Good Job 👍":"Keep Going 🌱";

  savedSemesters.push({semester:selectedSemester,gpa:gpa});
  localStorage.setItem("savedSemesters",JSON.stringify(savedSemesters));
});

// =====================
// GRAPH CODE (UNCHANGED)
// =====================
function renderSemesterGraph(){
  let semesterData = Array(8).fill(null);
  savedSemesters.forEach(s=>{ semesterData[parseInt(s.semester)-1]=parseFloat(s.gpa); });

  const ctx=document.getElementById("semesterChart").getContext("2d");
  if(semesterChart) semesterChart.destroy();

  semesterChart = new Chart(ctx,{
    type:'line',
    data:{ labels:['Sem1','Sem2','Sem3','Sem4','Sem5','Sem6','Sem7','Sem8'], datasets:[{
      label:'Semester GPA',
      data:semesterData,
      borderColor:'#6a11cb',
      backgroundColor:'rgba(106,17,203,0.25)',
      fill:true,
      tension:0.4,
      pointRadius:6,
      pointHoverRadius:7,
      pointBackgroundColor:'#fff',
      pointBorderColor:'#6a11cb',
      pointBorderWidth:3
    }]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{ legend:{ labels:{ boxWidth:30, color:'#555', font:{size:14} } } },
      scales:{
        y:{ min:0, max:10, ticks:{ stepSize:2, color:'#666' }, grid:{ color:'rgba(0,0,0,0.08)' } },
        x:{ ticks:{ color:'#666' }, grid:{ display:false } }
      }
    }
  });
}