document.addEventListener("DOMContentLoaded", function(){

  let state = { stream:null, dept:null, sem:null, history:["welcomeSection"], subjects:[], saved:{} };
  let gpaChartInstance = null;

  function showSection(id){
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(state.history[state.history.length-1] !== id) state.history.push(id);
  }

  // Continue Button
  document.getElementById("continueBtn").onclick = () => showSection("streamSection");

  // Back buttons
  document.querySelectorAll(".back-btn").forEach(btn=>{
    btn.onclick = () => {
      if(state.history.length>1){
        state.history.pop();
        showSection(state.history[state.history.length-1]);
      }
    }
  });

  // Home Button
  document.getElementById("homeBtn").onclick = () => {
    state.history=["welcomeSection"];
    showSection("welcomeSection");
  };

  // Stream Selection
  document.querySelectorAll(".stream-btn").forEach(btn=>{
    btn.onclick = () => {
      state.stream = btn.dataset.stream;
      loadDepartments();
      showSection("departmentSection");
    }
  });

  // Load Departments
  function loadDepartments(){
    const list = document.getElementById("departmentList");
    list.innerHTML="";
    const depts = state.stream==="engineering" ? ["ISE","CSE","ECE","EEE","ME","AA"] : ["BCom_General","BCom_CS"];
    depts.forEach(d=>{
      const b=document.createElement("button");
      b.className="grid-item-btn";
      b.textContent=d.replace("_"," ");
      b.onclick=()=>{
        state.dept=d;
        loadSemesters();
        showSection("semesterSection");
      };
      list.appendChild(b);
    });
  }

  // Load Semesters
  function loadSemesters(){
    const list=document.getElementById("semesterList");
    list.innerHTML="";
    const maxSem = state.stream==="engineering"?8:6;
    for(let i=1;i<=maxSem;i++){
      const b=document.createElement("button");
      b.className="grid-item-btn";
      b.textContent=`Semester ${i}`;
      b.onclick=()=>{
        state.sem=i;
        loadSubjects();
      };
      list.appendChild(b);
    }
  }

  // Load Subjects
  function loadSubjects(){
    const path=`data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
    fetch(path)
      .then(r=>r.json())
      .then(data=>{
        state.subjects=data.subjects;
        renderSubjects();
        showSection("subjectsSection");
      }).catch(()=>alert("Subjects JSON not found: "+path));
  }

  function renderSubjects(){
    const container=document.getElementById("subjects");
    container.innerHTML="";
    state.subjects.forEach((s,idx)=>{
      const div=document.createElement("div");
      div.className="subject-card";
      div.innerHTML=`
        <div><b>${s.code}</b> - ${s.name} (${s.credits})</div>
        <div class="grade-row">
          ${['S','A','B','C','D','E','F'].map(g=>`<div class="g-box" onclick="setGrade(${idx},'${g}',this)">${g}</div>`).join("")}
        </div>
      `;
      container.appendChild(div);
    });
  }

  window.setGrade=(i,g,el)=>{
    state.subjects[i].selected=g;
    el.parentElement.querySelectorAll(".g-box").forEach(b=>b.classList.remove("active"));
    el.classList.add("active");
  }

  // GPA Calculation
  document.getElementById("calculateGPA").onclick=()=>{
    const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};
    let totalPts=0, totalCredits=0;
    for(let s of state.subjects){
      if(!s.selected){ alert("Select all grades"); return;}
      totalPts+=s.credits*gradePoints[s.selected];
      totalCredits+=s.credits;
    }
    const gpa=(totalPts/totalCredits).toFixed(2);
    document.getElementById("gpa").textContent=gpa;
    state.saved[`${state.dept}_Sem${state.sem}`]=parseFloat(gpa);
    showSection("resultSection");
  }

  // CGPA to % Converter
  window.convertToPercentage=()=>{
    const val=parseFloat(document.getElementById("cgpaInput").value);
    if(isNaN(val)){ document.getElementById("percentResult").textContent="Enter valid CGPA!"; return; }
    document.getElementById("percentResult").innerHTML=`Percentage: <b>${(val*10).toFixed(1)}%</b>`;
  }

});