// Departments
const departments = {
  engineering: ["CSE", "ISE", "ECE", "EEE", "AA"],
  bcom: ["BCOM"]
};

// Semesters
const semesters = ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"];

// Elements
const streamPage = document.getElementById('streamPage');
const departmentPage = document.getElementById('departmentPage');
const semesterPage = document.getElementById('semesterPage');
const gradePage = document.getElementById('gradePage');
const departmentsContainer = document.getElementById('departmentsContainer');
const semesterContainer = document.getElementById('semesterContainer');

let selectedStream = '';
let selectedDepartment = '';

// Select stream
function selectStream(stream) {
  selectedStream = stream;
  showDepartments(stream);
}

// Show departments
function showDepartments(stream) {
  departmentsContainer.innerHTML = '';
  departments[stream].forEach(dep => {
    const div = document.createElement('div');
    div.className = 'cube pastel';
    div.innerText = dep;
    div.onclick = () => selectDepartment(dep);
    departmentsContainer.appendChild(div);
  });
  streamPage.style.display = 'none';
  departmentPage.style.display = 'block';
}

// Select department
function selectDepartment(dep) {
  selectedDepartment = dep;
  showSemesters();
}

// Show semesters
function showSemesters() {
  semesterContainer.innerHTML = '';
  semesters.forEach(sem => {
    const div = document.createElement('div');
    div.className = 'cube pastel';
    div.innerText = sem;
    div.onclick = () => showGrades();
    semesterContainer.appendChild(div);
  });
  departmentPage.style.display = 'none';
  semesterPage.style.display = 'block';
}

// Show grade reference
function showGrades() {
  semesterPage.style.display = 'none';
  gradePage.style.display = 'block';
}

// Back buttons
function goBack(page) {
  if(page === 'stream') {
    departmentPage.style.display = 'none';
    streamPage.style.display = 'block';
  } else if(page === 'department') {
    semesterPage.style.display = 'none';
    departmentPage.style.display = 'block';
  } else if(page === 'semester') {
    gradePage.style.display = 'none';
    semesterPage.style.display = 'block';
  }
}