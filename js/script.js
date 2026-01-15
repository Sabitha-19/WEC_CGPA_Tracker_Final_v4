const pages = document.querySelectorAll(".page");
const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const homeIcon = document.getElementById("home-icon");
const graphIcon = document.getElementById("graph-icon");
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

const gradePoints = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };
const departmentsData = { engineering: ["CSE", "ISE", "ECE", "EEE", "AA"] };

let selectedStream = "", selectedDepartment = "", selectedSemester = 0;
let subjects = [], grades = {};
let semesterGPAs = JSON.parse(localStorage.getItem("semesterGPAs")) || [];

/* NAVIGATION */
function showPage(id) {
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    window.scrollTo(0, 0);
}

startBtn.onclick = () => showPage("stream-page");
backBtn.onclick = () => showPage("start-page");
homeIcon.onclick = () => showPage("start-page");
graphIcon.onclick = () => { renderSaved(); showPage("saved-page"); };
faqIcon.onclick = () => showPage("faq-page");
floatingSaveBtn.onclick = () => { renderSaved(); showPage("saved-page"); };

/* STREAM SELECTION */
document.querySelectorAll(".stream-btn").forEach(btn => {
    btn.onclick = () => {
        selectedStream = btn.dataset.stream;
        loadDepartments();
        showPage("department-page");
    };
});

function loadDepartments() {
    departmentsDiv.innerHTML = "";
    departmentsData[selectedStream].forEach(dep => {
        const b = document.createElement("button");
        b.textContent = dep;
        b.onclick = () => {
            selectedDepartment = dep.toLowerCase();
            loadSemesters();
            showPage("semester-page");
        };
        departmentsDiv.appendChild(b);
    });
}

function loadSemesters() {
    semestersDiv.innerHTML = "";
    for (let i = 1; i <= 8; i++) {
        const b = document.createElement("button");
        b.textContent = `Semester ${i}`;
        b.onclick = () => {
            selectedSemester = i;
            loadSubjects();
            showPage("subjects-page");
        };
        semestersDiv.appendChild(b);
    }
}

async function loadSubjects() {
    subjectsList.innerHTML = "Loading subjects...";
    grades = {};
    try {
        const res = await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
        const data = await res.json();
        subjects = data.subjects;
        subjectsList.innerHTML = "";

        subjects.forEach(s => {
            const div = document.createElement("div");
            div.className = "subject";
            div.innerHTML = `<span>${s.code} - ${s.name} (${s.credits} Cr)</span>`;

            const gDiv = document.createElement("div");
            gDiv.className = "grade-buttons";

            Object.keys(gradePoints).forEach(g => {
                const b = document.createElement('button');
                b.textContent = g;
                b.style.margin = "2px";
                b.onclick = () => {
                    grades[s.code] = g;
                    [...gDiv.children].forEach(x => x.classList.remove("selected"));
                    b.classList.add("selected");
                };
                gDiv.appendChild(b);
            });
            div.appendChild(gDiv);
            subjectsList.appendChild(div);
        });
    } catch (err) {
        subjectsList.innerHTML = "Error: Data file not found.";
    }
}

/* CALCULATION */
calculateBtn.onclick = () => {
    if (Object.keys(grades).length < subjects.length) {
        alert("Please select grades for all subjects.");
        return;
    }
    let total = 0, creditsSum = 0;
    subjects.forEach(s => {
        total += gradePoints[grades[s.code]] * s.credits;
        creditsSum += s.credits;
    });

    const gpa = (total / creditsSum).toFixed(2);
    semesterGPAs[selectedSemester - 1] = Number(gpa);
    localStorage.setItem("semesterGPAs", JSON.stringify(semesterGPAs));

    const valid = semesterGPAs.filter(n => n !== null && n !== undefined);
    const cgpa = (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2);

    gpaDisplay.textContent = `GPA: ${gpa}`;
    cgpaDisplay.textContent = `CGPA: ${cgpa}`;
    percentageDisplay.textContent = `Percentage: ${(cgpa * 9.5).toFixed(2)}%`;
};

function renderSaved() {
    savedList.innerHTML = "";
    const valid = semesterGPAs.filter(n => n !== null && n !== undefined);

    semesterGPAs.forEach((g, i) => {
        if (g) {
            const d = document.createElement("div");
            d.className = "saved-card";
            d.textContent = `Semester ${i + 1} : GPA ${g}`;
            savedList.appendChild(d);
        }
    });

    if (valid.length) {
        const avgCgpa = (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2);
        finalCgpa.textContent = `Final CGPA : ${avgCgpa}`;
    } else {
        savedList.innerHTML = "<p>No semesters saved yet.</p>";
    }
}

/* FAQ TOGGLE */
document.querySelectorAll(".faq-question").forEach(q => {
    q.onclick = () => {
        q.parentElement.classList.toggle("active");
    };
});
