const departments = {
  engineering: ["CSE","ISE","ECE","EEE","AA"],
  bcom: ["BCOM"]
};

const semesters = ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"];

const gradePoints = {S:10,A:9,B:8,C:7,D:6,E:5,F:0};

let selectedStream='', selectedDepartment='', selectedSemester='';
let semesterButtons=[];

// Elements
const welcomePage = document.getElementById('welcomePage');
const streamPage = document.getElementById('streamPage');
const departmentPage = document.getElementById('departmentPage');
const semesterPage = document.getElementById('semesterPage');
const gradePage = document.getElementById('gradePage');
const departmentsContainer = document.getElementById('departmentsContainer');
const semesterContainer = document.getElementById('semesterContainer');

function goToStream(){
  welcomePage.classList.add('hidden');
  streamPage.classList.remove('hidden');
}

function selectStream(stream){
  selectedStream = stream;
  showDepartments(stream);
}

function showDepartments(stream){
  departmentsContainer.innerHTML='';
  departments[stream].forEach(dep=>{
    const div = document.createElement('div');
    div.className='cube pastel';
    div.innerText=dep;
    div.onclick=()=>selectDepartment(dep);
    departmentsContainer.appendChild(div);
  });
  streamPage.classList.add('hidden');
  departmentPage.classList.remove('hidden');
}

function selectDepartment(dep){
  selectedDepartment = dep;
  showSemesters();
}

function showSemesters(){
  semesterContainer.innerHTML='';
  semesterButtons=[];
  semesters.forEach((sem,i)=>{
    const div = document.createElement('div');
    div.className='cube pastel';
    div.innerText=sem;
    div.onclick=()=>{
      // Highlight selected semester
      semesterButtons.forEach(b=>b.classList.remove('selected'));
      div.classList.add('selected');
      selectedSemester=sem;
      showGrades();
    };
    semesterContainer.appendChild(div);
    semesterButtons.push(div);
  });
  departmentPage.classList.add('hidden');
  semesterPage.classList.remove('hidden');
}

function showGrades(){
  semesterPage.classList.add('hidden');
  gradePage.classList.remove('hidden');
}

// Back navigation
function goBack(page){
  if(page==='stream'){ departmentPage.classList.add('hidden'); streamPage.classList.remove('hidden'); }
  else if(page==='department'){ semesterPage.classList.add('hidden'); departmentPage.classList.remove('hidden'); }
  else if(page==='semester'){ gradePage.classList.add('hidden'); semesterPage.classList.remove('hidden'); }
}