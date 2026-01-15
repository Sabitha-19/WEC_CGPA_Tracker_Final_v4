let stream="",dept="",semester=0;
let subjects=[],grades={};
const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

const pages=document.querySelectorAll(".page");

function showPage(id){
  pages.forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goBack(){history.back();}

function selectStream(s){
  stream=s;
  showPage("department");
  const depts=s==="engineering"?["CSE","ECE","EEE","ISE"]:["BCom"];
  const box=document.getElementById("deptBtns");
  box.innerHTML="";
  depts.forEach(d=>{
    const b=document.createElement("button");
    b.textContent=d;
    b.onclick=()=>selectDept(d.toLowerCase());
    box.appendChild(b);
  });
}

function selectDept(d){
  dept=d;
  showPage("semester");
  const box=document.getElementById("semBtns");
  box.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("button");
    b.textContent="Semester "+i;
    b.onclick=()=>loadSubjects(i);
    box.appendChild(b);
  }
}

function loadSubjects(sem){
  semester=sem;
  fetch(`data/${dept}_sem${sem}.json`)
  .then(r=>r.json())
  .then(d=>{
    subjects=d.subjects;
    grades={};
    const list=document.getElementById("subjectsList");
    list.innerHTML="";
    subjects.forEach(s=>{
      const div=document.createElement("div");
      div.className="subject";
      div.innerHTML=`${s.name} (${s.credits} Cr)<br>`+
        Object.keys(gradePoints).map(g=>
          `<button class="grade-btn" onclick="setGrade('${s.code}','${g}',this)">${g}</button>`
        ).join("");
      list.appendChild(div);
    });
    showPage("subjects");
  });
}

function setGrade(code,g,btn){
  grades[code]=g;
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
}

function calculate(){
  let total=0,cr=0;
  subjects.forEach(s=>{
    total+=gradePoints[grades[s.code]]*s.credits;
    cr+=s.credits;
  });
  const gpa=(total/cr).toFixed(2);

  let saved=JSON.parse(localStorage.getItem("savedCGPA"))||[];
  saved.push({semester,gpa});
  localStorage.setItem("savedCGPA",JSON.stringify(saved));

  const cgpa=(saved.reduce((a,b)=>a+parseFloat(b.gpa),0)/saved.length).toFixed(2);
  const perc=(cgpa*9.5).toFixed(2);

  document.getElementById("resultBox").innerHTML=
    `GPA: ${gpa}<br>CGPA: ${cgpa}<br>Percentage: ${perc}%`;

  document.getElementById("encourageMsg").innerText=
    cgpa>=9?"🌟 Outstanding!":
    cgpa>=8?"💜 Excellent work!":
    cgpa>=7?"👏 Very Good!":
    cgpa>=6?"🙂 Good effort!":
    "💪 Keep improving!";
}

function resetSemesters(){
  if(confirm("Clear all semester data?")){
    localStorage.removeItem("savedCGPA");
    location.reload();
  }
}