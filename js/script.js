let state = { stream:null, dept:null, sem:null, history:["welcomeSection"], subjects:[], saved:{} };

function showSection(id) {
  document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if(state.history[state.history.length-1]!==id) state.history.push(id);
}

// Back buttons
document.querySelectorAll(".back-btn").forEach(b=>{
  b.onclick = ()=>{ 
    if(state.history.length>1){ 
      state.history.pop(); 
      showSection(state.history[state.history.length-1]); 
    }
  };
});

// Home
document.getElementById("homeBtn").onclick = ()=>{
  state.history=["welcomeSection"];
  showSection("welcomeSection");
};

// Stream buttons
document.querySelectorAll(".stream-btn").forEach(btn=>{
  btn.onclick=()=>{
    state.stream = btn.dataset.stream;
    loadDepartments();
    showSection("departmentSection");
  };
});

// Departments
function loadDepartments(){
  const list=document.getElementById("departmentList");
  list.innerHTML="";
  const depts = state.stream==="engineering"?["ISE","CSE","ECE","EEE","ME","AA"]:["BCom_General","BCom_CS"];
  depts.forEach(d=>{
    const b = document.createElement("button");
    b.textContent=d.replace("_"," ");
    b.onclick=()=>{
      state.dept=d; loadSemesters(); showSection("semesterSection");
    };
    list.appendChild(b);
  });
}

// Semesters
function loadSemesters(){
  const list=document.getElementById("semesterList");
  list.innerHTML="";
  const maxSem = state.stream==="engineering"?8:6;
  for(let i=1;i<=maxSem;i++){
    const b=document.createElement("button");
    b.textContent=`Semester ${i}`;
    b.onclick=()=>{state.sem=i; loadSubjects();};
    list.appendChild(b);
  }
}

// Subjects
function loadSubjects(){
  const path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
  fetch(path).then(r=>r.json()).then(data=>{
    state.subjects = data.subjects;
    renderSubjects();
    showSection("subjectsSection");
  }).catch(()=>alert(`File missing: ${path}`));
}

function renderSubjects(){
  const container=document.getElementById("subjects");
  container.innerHTML="";
  state.subjects.forEach((s,i)=>{
    const div=document.createElement("div");
    div.innerHTML=`${s.name} (${s.credits}) 
      ${['S','A','B','C','D','E','F'].map(g=>`<button onclick="setGrade(${i},'${g}',this)">${g}</button>`).join("")}`;
    container.appendChild(div);
  });
}

function setGrade(i,g,el){
  state.subjects[i].selected=g;
  el.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  el.classList.add("active");
}

// GPA Calculation
document.getElementById("calculateGPA").onclick=()=>{
  const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};
  let tot=0,wt=0;
  for(let s of state.subjects){
    if(!s.selected){ alert("Select all grades!"); return; }
    tot+=s.credits; wt+=s.credits*gradePoints[s.selected];
  }
  document.getElementById("totalCredits").textContent=tot;
  document.getElementById("gpa").textContent=(wt/tot).toFixed(2);
  showSection("resultSection");
};

// CGPA → %
function convertToPercentage(){
  const val=parseFloat(document.getElementById("cgpaInput").value);
  if(isNaN(val)){document.getElementById("percentResult").textContent="Invalid";return;}
  document.getElementById("percentResult").textContent=`Percentage: ${(val*10).toFixed(1)}%`;
}