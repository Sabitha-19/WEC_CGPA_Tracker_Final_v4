/* -------------------------------
   GLOBAL VARIABLES
-------------------------------- */
let selectedDept = "";
let selectedSem = 0;
let subjects = [];

const gradePoints = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0
};

/* -------------------------------
   BUTTON ACTIVE HANDLER
-------------------------------- */
function setActive(container, btn) {
  document
    .querySelectorAll(`#${container} button`)
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

/* -------------------------------
   LOAD DEPARTMENTS
-------------------------------- */
function selectDepartment(btn, dept) {
  setActive("deptList", btn);
  selectedDept = dept.toLowerCase(); // VERY IMPORTANT
  document.getElementById("semSection").style.display = "block";
}

/* -------------------------------
   LOAD SEMESTERS
-------------------------------- */
function selectSemester(btn, sem) {
  setActive("semList", btn);
  selectedSem = sem;
  loadSubjects();
}

/* -------------------------------
   LOAD SUBJECT JSON
-------------------------------- */
function loadSubjects() {
  const path = `data/${selectedDept}_sem${selectedSem}.json`;
  console.log("Loading:", path);

  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error("File not found");
      return res.json();
    })
    .then(data => {
      subjects = data;
      renderSubjects();
    })
    .catch(err => {
      alert("Subject file not found:\n" + path);
      console.error(err);
    });
}

/* -------------------------------
   RENDER SUBJECTS
-------------------------------- */
function renderSubjects() {
  const list = document.getElementById("subjectList");
  list.innerHTML = "";

  subjects.forEach(sub => {
    const div = document.createElement("div");
    div.className = "subject";

    div.innerHTML = `
      <span>${sub.name} (${sub.credits})</span>
      <select>
        <option value="">Grade</option>
        <option>S</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
        <option>D</option>
        <option>E</option>
        <option>F</option>
      </select>
    `;

    list.appendChild(div);
  });
}