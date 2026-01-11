let selectedStream="", selectedDept="", selectedSem="";
let subjects=[], grades={};
const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

function showSection(id){
  document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function selectStream(btn,stream){
  selectedStream=stream;
  activate(btn);
  showSection("department");

  const depts = stream==="engineering"
    ? ["cse","ise","ece","eee","aa"]
    : ["bcom"];

  deptBtns.innerHTML="";
  depts.forEach(d=>{
    deptBtns.innerHTML+=`<button onclick="selectDept(this,'${d}')">${d.toUpperCase()}</button>`;
  });
}

function selectDept(btn,dept){
  selectedDept=dept;
  activate(btn);
  showSection("semester");

  semBtns.innerHTML="";
  for(let i=1;i<=6;i++){
    semBtns.innerHTML+=`<button onclick="selectSem(this,${i})">Semester ${i}</button>`;
  }
}

function selectSem(btn,sem){
  selectedSem=sem;
  activate(btn);
  loadSubjects();
}

function loadSubjects(){
  const path=`data/${selectedDept}_sem${selectedSem}.json`;
  fetch(path)
    .then(r=>r.json())
    .then(data=>{
      subjects=data;
      semTitle.innerText=`${selectedDept.toUpperCase()} - Semester ${selectedSem}`;
      subjectList.innerHTML="";
      subjects.forEach((s,i)=>{
        subjectList.innerHTML+=`
        <div class="subject">
          <b>${s.name}</b> (${s.credits})
          <div>
            ${Object.keys(gradePoints).map(g=>
              `<button class="grade-btn" onclick="setGrade(${i},'${g}',this)">${g}</button>`
            ).join("")}
          </div>
        </div>`;
      });
      showSection("subjects");
    })
    .catch(()=>alert("Subject file not found"));
}

function setGrade(i,g,btn){
  grades[i]=g;
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
}

function calculateGPA(){
  let total=0,credits=0;
  subjects.forEach((s,i)=>{
    if(grades[i]){
      total+=gradePoints[grades[i]]*s.credits;
      credits+=s.credits;
    }
  });
  const gpa=(total/credits).toFixed(2);
  gpaSpan.innerText=gpa;
  saveSemester(gpa);
}

function activate(btn){
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
}