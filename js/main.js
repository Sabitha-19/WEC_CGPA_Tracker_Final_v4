const pages = document.querySelectorAll('.page');

function showPage(id){
  pages.forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

startBtn.onclick = ()=> showPage('infoPage');
continueBtn.onclick = ()=> showPage('streamPage');
homeBtn.onclick = ()=> showPage('startPage');
graphBtn.onclick = ()=> {
  showPage('graphPage');
  drawChart();
};

let stream, department, semester;
let gradePoints = {S:10,A:9,B:8,C:7,D:6,E:5,F:0};
let selectedGrades = {};

document.querySelectorAll('[data-stream]').forEach(btn=>{
  btn.onclick = ()=>{
    stream = btn.dataset.stream;
    showPage('deptPage');
    loadDepartments();
  };
});

function loadDepartments(){
  const map = {
    engineering:["CSE","ISE","ECE","EEE","AA"],
    bcom:["BCOM"]
  };
  deptBtns.innerHTML='';
  map[stream].forEach(d=>{
    let b=document.createElement('button');
    b.textContent=d;
    b.onclick=()=>{
      department=d.toLowerCase();
      showPage('semPage');
      loadSemesters();
    };
    deptBtns.appendChild(b);
  });
}

function loadSemesters(){
  semBtns.innerHTML='';
  for(let i=1;i<=8;i++){
    let b=document.createElement('button');
    b.textContent='Semester '+i;
    b.onclick=()=>{
      semester=i;
      loadSubjects();
    };
    semBtns.appendChild(b);
  }
}

async function loadSubjects(){
  const path = `data/${department}_sem${semester}.json`;
  try{
    const res = await fetch(path);
    const data = await res.json();
    selectedGrades={};
    subjects.innerHTML='';
    subjectTitle.textContent = `${department.toUpperCase()} Semester ${semester}`;

    data.subjects.forEach(s=>{
      const div=document.createElement('div');
      div.className='subject';
      div.innerHTML=`<b>${s.name}</b> (${s.credits} credits)<div class="grades"></div>`;
      const gDiv=div.querySelector('.grades');

      ['S','A','B','C','D','E','F'].forEach(g=>{
        let gb=document.createElement('button');
        gb.textContent=g;
        gb.onclick=()=>{
          selectedGrades[s.code]={grade:g,credits:s.credits};
          calculate();
          [...gDiv.children].forEach(x=>x.classList.remove('active'));
          gb.classList.add('active');
        };
        gDiv.appendChild(gb);
      });

      subjects.appendChild(div);
    });

    showPage('subjectPage');
  }catch{
    alert("Subject file not found");
  }
}

function calculate(){
  let total=0, credits=0;
  Object.values(selectedGrades).forEach(v=>{
    total += gradePoints[v.grade]*v.credits;
    credits += v.credits;
  });
  let gpa = credits ? (total/credits).toFixed(2):0;
  gpaSpan.textContent=gpa;
}