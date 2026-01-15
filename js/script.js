const pages = document.querySelectorAll(".page");

const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const homeIcon = document.getElementById("home-icon");
const faqIcon = document.getElementById("faq-icon");
const floatingSaveBtn = document.getElementById("floating-save-btn");

const departmentsDiv = document.getElementById("departments");
const semestersDiv = document.getElementById("semesters");
const subjectsList = document.getElementById("subjects-list");

const calculateBtn = document.getElementById("calculate-btn");

const gpaDisplay = document.getElementById("gpa-display");
const cgpaDisplay = document.getElementById("cgpa-display");
const percentageDisplay = document.getElementById("percentage-display");

const savedList = document.getElementById("saved-list");
const finalCgpa = document.getElementById("final-cgpa");

const gradePoints = { S:10,A:9,B:8,C:7,D:6,E:5,F:0 };

let selectedStream="", selectedDepartment="", selectedSemester=0;
let subjects=[], grades={};
let semesterGPAs = JSON.parse(localStorage.getItem("semesterGPAs")) || [];

/* NAVIGATION */
function showPage(id){
  pages.forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

startBtn.onclick = ()=>showPage("stream-page");
backBtn.onclick = ()=>showPage("start-page");
homeIcon.onclick = ()=>showPage("start-page");
faqIcon.onclick = ()=>showPage("faq-page");

/* STREAM */
document.querySelectorAll(".stream-btn").forEach(btn=>{
  btn.onclick=()=>{
    selectedStream=btn.dataset.stream;
    btn.classList.add("active");
    loadDepartments();
    showPage("department-page");
  };
});

/* DEPARTMENT */
const departments={ engineering:["CSE","ISE","ECE","EEE","AA"] };
function loadDepartments(){
  departmentsDiv.innerHTML="";
  departments[selectedStream].forEach(dep=>{
    const b=document.createElement("button");
    b.textContent=dep;
    b.onclick=()=>{
      selectedDepartment=dep.toLowerCase();
      b.classList.add("active");
      loadSemesters();
      showPage("semester-page");
    };
    departmentsDiv.appendChild(b);
  });
}

/* SEMESTERS */
function loadSemesters(){
  semestersDiv.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("button");
    b.textContent=`Semester ${i}`;
    b.onclick=()=>{
      selectedSemester=i;
      b.classList.add("active");
      loadSubjects();
      showPage("subjects-page");
    };
    semestersDiv.appendChild(b);
  }
}

/* LOAD SUBJECTS */
async function loadSubjects(){
  subjectsList.innerHTML="";
  grades={};

  try{
    const res = await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data = await res.json();
    subjects = data.subjects;

    subjects.forEach(s=>{
      const div=document.createElement("div");
      div.className="subject";
      div.innerHTML=`<span>${s.code} - ${s.name} (${s.credits}cr)</span>`;

      const gDiv=document.createElement("div");
      gDiv.className="grade-buttons";

      Object.keys(gradePoints).forEach(g=>{
        const b=document.createElement("button");
        b.textContent=g;
        b.onclick=()=>{
          grades[s.code]=g;
          [...gDiv.children].forEach(x=>x.classList.remove("selected"));
          b.classList.add("selected");
        };
        gDiv.appendChild(b);
      });
      div.appendChild(gDiv);
      subjectsList.appendChild(div);
    });
  }catch(e){ subjectsList.innerHTML="<p>Subjects not found!</p>"; }
}

/* CALCULATE */
calculateBtn.onclick=()=>{
  if(Object.keys(grades).length!==subjects.length){
    alert("Select all grades!");
    return;
  }

  let total=0, credits=0;
  subjects.forEach(s=>{
    total+=gradePoints[grades[s.code]]*s.credits;
    credits+=s.credits;
  });

  const gpa=(total/credits).toFixed(2);
  semesterGPAs[selectedSemester-1]=Number(gpa);
  localStorage.setItem("semesterGPAs",JSON.stringify(semesterGPAs));

  const valid=semesterGPAs.filter(Boolean);
  const cgpa=(valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2);

  gpaDisplay.textContent=`GPA: ${gpa}`;
  cgpaDisplay.textContent=`CGPA: ${cgpa}`;
  percentageDisplay.textContent=`Percentage: ${(cgpa*9.5).toFixed(2)}%`;
};

/* SAVE SEMESTER */
floatingSaveBtn.onclick=()=>{
  renderSaved();
  showPage("saved-page");
};

function renderSaved(){
  savedList.innerHTML="";
  const valid=semesterGPAs.filter(Boolean);

  semesterGPAs.forEach((g,i)=>{
    if(g){
      const d=document.createElement("div");
      d.className="saved-card";
      d.textContent=`Semester ${i+1} : GPA ${g}`;
      savedList.appendChild(d);
    }
  });

  if(valid.length){
    finalCgpa.textContent=`Final CGPA : ${(valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2)}`;
  } else { finalCgpa.textContent=""; }
}

/* FAQ TOGGLE */
document.querySelectorAll(".faq-question").forEach(q=>{
  q.onclick=()=>q.parentElement.classList.toggle("active");
});