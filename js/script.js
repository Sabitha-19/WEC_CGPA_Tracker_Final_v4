const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };
let selectedStream="", selectedDept="", selectedSem="", subjects=[], screenHistory=[];

/* --- NAVIGATION --- */
function goTo(id){
  const active = document.querySelector(".screen.active");
  if(active) screenHistory.push(active.id);
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const newScreen = document.getElementById(id);
  newScreen.classList.add("active");

  renderNavButton(newScreen);
}

function goBack(){
  if(screenHistory.length===0) return;
  const prev = screenHistory.pop();
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const newScreen = document.getElementById(prev);
  newScreen.classList.add("active");

  renderNavButton(newScreen);
}

/* --- DYNAMIC NAV BUTTON --- */
function renderNavButton(screen){
  // Remove any existing nav button
  const existing = screen.querySelector(".nav-btn");
  if(existing) existing.remove();

  // Don't show back button on start page
  if(screen.id === "page-start") return;

  // Create nav button container
  const navBtn = document.createElement("div");
  navBtn.className = "nav-btn";

  // Back button
  const backBtn = document.createElement("button");
  backBtn.className = "btn-secondary";
  backBtn.innerText = "← Back";
  backBtn.onclick = goBack;
  navBtn.appendChild(backBtn);

  // Edit button (only show on result page)
  if(screen.id === "page-result"){
    const editBtn = document.createElement("button");
    editBtn.className = "btn-primary";
    editBtn.innerText = "Edit Semester";
    editBtn.onclick = editSemester;
    navBtn.appendChild(editBtn);
  }

  screen.appendChild(navBtn);
}

/* --- STREAM --- */
function selectStream(stream){
  selectedStream = stream;
  const deptList = document.getElementById("deptList");
  deptList.innerHTML = "";
  let depts = stream==="engineering"?["cse","ise","ece","eee","aa"]:["bcom"];
  depts.forEach(d=>{
    deptList.innerHTML += `<div class="card option" onclick="selectDept('${d}')">${d.toUpperCase()}</div>`;
  });
  goTo("page-dept");
}

/* --- DEPARTMENT --- */
function selectDept(dept){
  selectedDept = dept;
  const semList = document.getElementById("semList");
  semList.innerHTML = "";
  for(let i=1;i<=8;i++) semList.innerHTML += `<div class="card option" onclick="selectSem(${i})">Semester ${i}</div>`;
  goTo("page-sem");
}

/* --- SEMESTER --- */
async function selectSem(sem){
  selectedSem = sem;
  const filePath = `data/${selectedDept}_sem${sem}.json`;
  try{
    const res = await fetch(filePath);
    subjects = await res.json();
    renderSubjects();
    goTo("page-grades-ref");
  }catch(err){ alert("Data file not found for this semester"); }
}

/* --- SUBJECTS --- */
function renderSubjects(){
  const list = document.getElementById("subjectList");
  list.innerHTML = "";
  subjects.forEach(sub=>{
    list.innerHTML += `<div class="subject-row"><span>${sub.name} (${sub.credits})</span>
      <select id="${sub.name}">${Object.keys(gradePoints).map(g=>`<option value="${g}">${g}</option>`).join("")}</select>
    </div>`;
  });
  loadSavedGrades();
}

/* --- CALCULATE GPA --- */
function calculateGPA(){
  let totalCredits=0,totalPoints=0,grades={};
  subjects.forEach(sub=>{
    const grade=document.getElementById(sub.name).value;
    grades[sub.name]=grade;
    totalCredits+=sub.credits;
    totalPoints+=sub.credits*gradePoints[grade];
  });
  const gpa=(totalPoints/totalCredits).toFixed(2);

  let data=JSON.parse(localStorage.getItem("wecData"))||{};
  if(!data[selectedDept]) data[selectedDept]={};
  data[selectedDept][selectedSem]={gpa,grades};
  localStorage.setItem("wecData",JSON.stringify(data));
  showResult();
}

/* --- RESULT --- */
function showResult(){
  const data=JSON.parse(localStorage.getItem("wecData"))||{};
  const semData=data[selectedDept];
  let labels=[],values=[],sum=0,count=0;
  for(let s in semData){
    labels.push("Sem "+s);
    values.push(semData[s].gpa);
    sum+=parseFloat(semData[s].gpa);
    count++;
  }
  const cgpa=(sum/count).toFixed(2);
  const percent=(cgpa*9.5).toFixed(2);

  document.getElementById("gpaText").innerText=`Semester ${selectedSem} GPA : ${semData[selectedSem].gpa}`;
  document.getElementById("cgpaText").innerText=`CGPA : ${cgpa}`;
  document.getElementById("percentText").innerText=`Percentage : ${percent}%`;

  drawChart(labels,values);
  goTo("page-result");
}

/* --- EDIT SEMESTER --- */
function editSemester(){ goTo("page-grades"); }

/* --- LOAD SAVED GRADES --- */
function loadSavedGrades(){
  const data=JSON.parse(localStorage.getItem("wecData"));
  if(!data||!data[selectedDept]||!data[selectedDept][selectedSem]) return;
  const saved=data[selectedDept][selectedSem].grades;
  subjects.forEach(sub=>{ document.getElementById(sub.name).value=saved[sub.name]; });
}

/* --- CHART --- */
let chart;
function drawChart(labels,values){
  const ctx=document.getElementById("gpaChart");
  if(chart) chart.destroy();
  chart=new Chart(ctx,{ type:"line", data:{ labels, datasets:[{data:values, fill:true, tension:0.4, backgroundColor:'rgba(138,43,226,0.2)', borderColor:'#8a2be2'}] },
    options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{min:0,max:10}} }
  });
}


// Show any screen
function showScreen(screenName){
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(screenName).classList.add('active');
}

// Back navigation
function goBack(prevScreen){
    showScreen(prevScreen);
}