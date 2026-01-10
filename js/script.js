// Departments Data
const departmentsData = {
    engineering: ["CSE","ISE","ECE","EEE","AA"],
    bcom: ["BCOM"]
};

// Semesters
const semesters = ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"];

// Elements
const continueBtn = document.getElementById("continueBtn");
const streamSection = document.getElementById("streamSection");
const departmentSection = document.getElementById("departmentSection");
const semesterSection = document.getElementById("semesterSection");
const gradesSection = document.getElementById("gradesSection");

const departmentContainer = document.getElementById("departments");
const semesterContainer = document.getElementById("semesters");

const backStreamBtn = document.getElementById("backStream");
const backDepartmentBtn = document.getElementById("backDepartment");

let selectedStream = "";

// Show Stream Selection
continueBtn.addEventListener("click", () => {
    continueBtn.style.display = "none";
    streamSection.classList.remove("hidden");
});

// Stream Selection
document.querySelectorAll(".stream-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        selectedStream = btn.dataset.stream;
        streamSection.classList.add("hidden");
        departmentSection.classList.remove("hidden");

        // Load Departments
        departmentContainer.innerHTML = "";
        departmentsData[selectedStream].forEach(dep => {
            const depBtn = document.createElement("button");
            depBtn.textContent = dep;
            depBtn.classList.add("dep-btn");
            depBtn.addEventListener("click", () => {
                departmentSection.classList.add("hidden");
                semesterSection.classList.remove("hidden");

                // Load Semesters
                semesterContainer.innerHTML = "";
                semesters.forEach((sem, idx) => {
                    const semBtn = document.createElement("button");
                    semBtn.textContent = sem;
                    semBtn.addEventListener("click", () => {
                        // Highlight selected
                        document.querySelectorAll("#semesters button").forEach(b => b.classList.remove("selected"));
                        semBtn.classList.add("selected");

                        // Show grades
                        gradesSection.classList.remove("hidden");
                    });
                    semesterContainer.appendChild(semBtn);
                });
            });
            departmentContainer.appendChild(depBtn);
        });
    });
});

// Back buttons
backStreamBtn.addEventListener("click", () => {
    departmentSection.classList.add("hidden");
    streamSection.classList.remove("hidden");
});

backDepartmentBtn.addEventListener("click", () => {
    semesterSection.classList.add("hidden");
    departmentSection.classList.remove("hidden");
    gradesSection.classList.add("hidden");
});