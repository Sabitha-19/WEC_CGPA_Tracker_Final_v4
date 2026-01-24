/* ================== GLOBAL VARIABLES ================== */
let selectedStream = "";
let selectedDepartment = "";
let selectedSemester = 0;
let subjects = [];
let grades = {};
let savedSemesters = [];
let semesterChart = null;

const departments = {
  engineering: ["CSE", "ISE", "ECE", "EEE", "AA"],
  bcom: ["BCom"]
};

const gradePoints = { 
  S: 10, 
  A: 9, 
  B: 8, 
  C: 7, 
  D: 6, 
  E: 5, 
  F: 0 
};

/* ================== INITIALIZE ON PAGE LOAD ================== */
window.addEventListener('DOMContentLoaded', function() {
  console.log("Page loaded!");
  
  // FAQ accordion functionality
  const faqButtons = document.querySelectorAll(".faq-question");
  faqButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      const ans = this.nextElementSibling;
      const isOpen = ans.style.display === "block";
      
      // Close all answers
      document.querySelectorAll(".faq-answer").forEach(a => {
        a.style.display = "none";
      });
      
      // Toggle current answer
      ans.style.display = isOpen ? "none" : "block";
    });
  });

  // Load saved data from localStorage
  loadSavedData();
});

/* ================== LOCAL STORAGE FUNCTIONS ================== */
function loadSavedData() {
  try {
    const saved = localStorage.getItem('wec_cgpa_data');
    if (saved) {
      savedSemesters = JSON.parse(saved);
      console.log("Loaded saved data:", savedSemesters.length, "semesters");
    }
  } catch (e) {
    console.error("Error loading saved data:", e);
    savedSemesters = [];
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('wec_cgpa_data', JSON.stringify(savedSemesters));
    console.log("Data saved successfully");
  } catch (e) {
    console.error("Error saving data:", e);
    alert("Error saving data!");
  }
}

/* ================== PAGE NAVIGATION ================== */
function showPage(id) {
  console.log("Showing page:", id);
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById(id);
  if (page) {
    page.classList.add("active");
  } else {
    console.error("Page not found:", id);
  }
}

/* ================== STREAM SELECTION ================== */
function selectStream(stream, btn) {
  console.log("Stream selected:", stream);
  selectedStream = stream;
  document.querySelectorAll("#stream-page .cube-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  showDepartments();
  showPage("department-page");
}

/* ================== DEPARTMENT SELECTION ================== */
function showDepartments() {
  console.log("Showing departments for:", selectedStream);
  const grid = document.getElementById("department-grid");
  if (!grid) {
    console.error("department-grid not found!");
    return;
  }
  
  grid.innerHTML = "";

  const deptList = departments[selectedStream];
  if (!deptList) {
    console.error("No departments found for stream:", selectedStream);
    return;
  }

  deptList.forEach(dep => {
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.textContent = dep;
    b.onclick = () => selectDepartment(dep.toLowerCase(), b);
    grid.appendChild(b);
  });
}

function selectDepartment(dep, btn) {
  console.log("Department selected:", dep);
  selectedDepartment = dep;
  document.querySelectorAll("#department-grid .cube-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  showSemesters();
  showPage("semester-page");
}

/* ================== SEMESTER SELECTION ================== */
function showSemesters() {
  console.log("Showing semesters");
  const grid = document.getElementById("semester-grid");
  if (!grid) {
    console.error("semester-grid not found!");
    return;
  }
  
  grid.innerHTML = "";

  for (let i = 1; i <= 8; i++) {
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.textContent = "Semester " + i;
    b.onclick = () => selectSemester(i, b);
    grid.appendChild(b);
  }
}

function selectSemester(sem, btn) {
  console.log("Semester selected:", sem);
  selectedSemester = sem;
  document.querySelectorAll("#semester-grid .cube-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  loadSubjects();
}

/* ================== LOAD SUBJECTS FROM JSON ================== */
function loadSubjects() {
  console.log("=== LOADING SUBJECTS ===");
  console.log("Stream:", selectedStream);
  console.log("Department:", selectedDepartment);
  console.log("Semester:", selectedSemester);
  
  grades = {};
  subjects = [];
  
  // Construct the file path
  const fileName = selectedDepartment + "_sem" + selectedSemester + ".json";
  const filePath = "data/" + fileName;
  
  console.log("File path:", filePath);
  
  // Show the subjects page with loading indicator
  showPage("subjects-page");
  
  const box = document.getElementById("subjects-list");
  if (!box) {
    console.error("subjects-list element not found!");
    alert("Error: subjects-list element not found!");
    return;
  }
  
// Show loading message
  box.innerHTML = `
    <div style="text-align:center; padding:40px; background:#fff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      <div style="font-size:40px; margin-bottom:15px;">⏳</div>
      <p style="color:#6a11cb; font-size:16px; font-weight:600;">Loading subjects...</p>
      <p style="color:#999; font-size:13px; margin-top:8px;">${fileName}</p>
    </div>
  `;
  
  // Fetch the JSON file
  fetch(filePath)
    .then(response => {
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        throw new Error("File not found (Status: " + response.status + ")");
      }
      return response.json();
    })
    .then(data => {
      console.log("Raw data received:", data);
      console.log("Data type:", typeof data);
      console.log("Is array:", Array.isArray(data));
      
      // Check if data has 'subjects' property (nested format)
      // Format: { "department": "AA", "semester": 3, "subjects": [...] }
      if (data && typeof data === 'object' && data.subjects && Array.isArray(data.subjects)) {
        console.log("Found subjects array inside object!");
        subjects = data.subjects;
      }
      // Check if data is already an array (direct format)
      // Format: [{ "code": "...", "name": "...", "credits": ... }]
      else if (Array.isArray(data)) {
        console.log("Data is already an array!");
        subjects = data;
      }
      // Neither format found
      else {
        throw new Error("Invalid data format. Expected array or object with 'subjects' property.");
      }
      
      if (subjects.length === 0) {
        throw new Error("No subjects found in file");
      }
      
      console.log("Subjects loaded successfully!");
      console.log("Number of subjects:", subjects.length);
      console.log("Subjects:", subjects);
      
      renderSubjects();
    })
    .catch(error => {
      console.error("=== ERROR LOADING SUBJECTS ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      
      // Show detailed error message
      box.innerHTML = `
        <div style="text-align:center; padding:30px; background:#fff3f3; border-radius:16px; border:2px solid #ef4444;">
          <div style="font-size:40px; margin-bottom:15px;">❌</div>
          <p style="color:#ef4444; font-size:18px; font-weight:600; margin-bottom:15px;">Could not load subjects</p>
          
          <div style="background:#fff; padding:15px; border-radius:8px; margin:15px 0; text-align:left;">
            <p style="color:#666; font-size:13px; margin:5px 0;"><strong>Stream:</strong> ${selectedStream}</p>
            <p style="color:#666; font-size:13px; margin:5px 0;"><strong>Department:</strong> ${selectedDepartment.toUpperCase()}</p>
            <p style="color:#666; font-size:13px; margin:5px 0;"><strong>Semester:</strong> ${selectedSemester}</p>
            <p style="color:#666; font-size:13px; margin:5px 0;"><strong>File:</strong> ${fileName}</p>
            <p style="color:#ef4444; font-size:13px; margin:10px 0 5px 0;"><strong>Error:</strong> ${error.message}</p>
          </div>
          
          <p style="color:#999; font-size:13px; margin:15px 0;">
            Please check:<br>
            • File exists in 'data' folder<br>
            • File name is correct (lowercase)<br>
            • JSON format is valid
          </p>
          
          <button onclick="showPage('semester-page')" style="padding:12px 24px; background:#6a11cb; color:#fff; border:none; border-radius:10px; cursor:pointer; font-family:Poppins,sans-serif; font-size:14px; margin-top:10px;">
            ← Go Back to Semester Selection
          </button>
        </div>
      `;
    });
}

/* ================== RENDER SUBJECTS ================== */
function renderSubjects() {
  console.log("=== RENDERING SUBJECTS ===");
  console.log("Number of subjects:", subjects.length);
  
  const box = document.getElementById("subjects-list");
  
  if (!box) {
    console.error("subjects-list element not found!");
    alert("Error: subjects-list element not found!");
    return;
  }
  
  box.innerHTML = "";

  if (!subjects || subjects.length === 0) {
    console.warn("No subjects to render!");
    box.innerHTML = `
      <div style="text-align:center; padding:40px; background:#fff; border-radius:16px;">
        <div style="font-size:40px; margin-bottom:15px;">📚</div>
        <p style="color:#999; font-size:16px; margin-bottom:15px;">No subjects found</p>
        <button onclick="showPage('semester-page')" style="padding:12px 24px; background:#6a11cb; color:#fff; border:none; border-radius:10px; cursor:pointer; font-family:Poppins,sans-serif; font-size:14px;">
          ← Go Back
        </button>
      </div>
    `;
    return;
  }

  // Create subjects container
  const container = document.createElement("div");
  container.style.cssText = "background:#fff; border-radius:16px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.08); margin-bottom:20px;";

  subjects.forEach((sub, index) => {
    console.log("Rendering subject " + (index + 1) + ":", sub);
    
    const div = document.createElement("div");
    div.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:15px 10px; border-bottom:1px solid #f0f0f0;";
    
    if (index === subjects.length - 1) {
      div.style.borderBottom = "none";
    }
    
    const strong = document.createElement("strong");
    strong.textContent = sub.name + " (" + sub.credits + " credits)";
    strong.style.cssText = "flex:1; color:#333; font-size:14px; font-weight:500; margin-right:10px;";
    
    const select = document.createElement("select");
    select.style.cssText = "padding:8px 16px; border:2px solid #6a11cb; border-radius:10px; background:#fff; color:#6a11cb; font-weight:600; cursor:pointer; font-family:Poppins,sans-serif; font-size:14px; min-width:80px;";
    select.onchange = function() {
      grades[sub.code] = this.value;
      console.log("Grade selected:", sub.code, "=", this.value);
    };
    
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Grade";
    select.appendChild(defaultOption);
    
    const gradeOptions = ["S", "A", "B", "C", "D", "E", "F"];
    gradeOptions.forEach(grade => {
      const option = document.createElement("option");
      option.value = grade;
      option.textContent = grade;
      select.appendChild(option);
    });
    
    div.appendChild(strong);
    div.appendChild(select);
    container.appendChild(div);
  });

  box.appendChild(container);
  
  console.log("Subjects rendered successfully!");
  
// Clear encouragement text
  const encouragement = document.getElementById("encouragement-text");
  if (encouragement) {
    encouragement.innerText = "";
  }
}

/* ================== CALCULATE GPA ================== */
function calculateGPA() {
  console.log("Calculating GPA...");
  console.log("Grades:", grades);
  
  let total = 0;
  let credits = 0;
  let missingGrades = 0;

  subjects.forEach(s => {
    const g = grades[s.code];
    if (g && gradePoints[g] !== undefined) {
      total += gradePoints[g] * s.credits;
      credits += s.credits;
      console.log(s.code, ":", g, "=", gradePoints[g], "x", s.credits);
    } else {
      missingGrades++;
      console.log(s.code, ": No grade selected");
    }
  });

  console.log("Total points:", total);
  console.log("Total credits:", credits);
  console.log("Missing grades:", missingGrades);

  if (credits === 0) {
    alert("⚠️ Please select grades for at least one subject!");
    return;
  }

  if (missingGrades > 0) {
    const confirmCalc = confirm("⚠️ " + missingGrades + " subject(s) don't have grades selected.\n\nDo you want to continue with calculation?");
    if (!confirmCalc) return;
  }

  const gpa = (total / credits).toFixed(2);
  console.log("Calculated GPA:", gpa);

  const displayElem = document.getElementById("cgpa-display");
  const encourageElem = document.getElementById("encouragement-text");
  
  if (displayElem) {
    displayElem.innerText = "Semester " + selectedSemester + " GPA: " + gpa;
  }
  
  if (encourageElem) {
    encourageElem.innerText = getEncouragement(parseFloat(gpa), "GPA");
  }

  saveSemester(gpa);
  showPage("result-page");
}

/* ================== SAVE SEMESTER ================== */
function saveSemester(gpa) {
  console.log("Saving semester...");
  
  // Remove existing entry for same semester/department/stream
  savedSemesters = savedSemesters.filter(s => 
    !(s.semester === selectedSemester && 
      s.department === selectedDepartment && 
      s.stream === selectedStream)
  );

  // Add new entry
  savedSemesters.push({
    stream: selectedStream,
    department: selectedDepartment,
    semester: selectedSemester,
    gpa: parseFloat(gpa),
    subjects: subjects.length,
    date: new Date().toLocaleDateString()
  });

  // Sort by stream, department, then semester
  savedSemesters.sort((a, b) => {
    if (a.stream !== b.stream) return a.stream.localeCompare(b.stream);
    if (a.department !== b.department) return a.department.localeCompare(b.department);
    return a.semester - b.semester;
  });

  saveToLocalStorage();

  const cgpa = calculateCGPA();
  const messageElem = document.getElementById("cgpa-message");
  if (messageElem) {
    messageElem.innerText = "Overall CGPA: " + cgpa + " - " + getEncouragement(parseFloat(cgpa), "CGPA");
  }
  
  console.log("Semester saved successfully!");
}

/* ================== CALCULATE CGPA ================== */
function calculateCGPA() {
  if (savedSemesters.length === 0) return "0.00";

  let total = 0;
  savedSemesters.forEach(s => total += s.gpa);

  return (total / savedSemesters.length).toFixed(2);
}

/* ================== SHOW SAVED SEMESTERS ================== */
function showSaved() {
  console.log("Showing saved semesters");
  showPage("saved-page");

  const list = document.getElementById("saved-list");
  if (!list) {
    console.error("saved-list element not found!");
    return;
  }
  
  const cgpa = calculateCGPA();
  
  list.innerHTML = `
    <div class="cgpa-box">
      <h3>Overall CGPA</h3>
      <span>${cgpa}</span>
      <p style="margin-top:12px; font-size:14px; opacity:0.9;">${getEncouragement(parseFloat(cgpa), "CGPA")}</p>
      <p style="margin-top:8px; font-size:13px; opacity:0.8;">${savedSemesters.length} semester(s) recorded</p>
    </div>
  `;

  if (savedSemesters.length === 0) {
    list.innerHTML += `
      <div style="background:#fff; padding:30px; border-radius:16px; text-align:center; margin-top:20px;">
        <div style="font-size:40px; margin-bottom:15px;">📚</div>
        <p style="color:#666; margin-bottom:10px; font-size:15px;">No semester data yet</p>
        <p style="color:#999; font-size:13px;">Start by calculating your first GPA!</p>
      </div>
    `;
    return;
  }

  // Group by stream and department
  let currentGroup = null;
  
  savedSemesters.forEach(s => {
    const groupKey = s.stream + "_" + s.department;
    
    if (currentGroup !== groupKey) {
      currentGroup = groupKey;
      const groupHeader = document.createElement("div");
      groupHeader.style.cssText = "margin-top:25px; margin-bottom:12px; color:#6a11cb; font-weight:600; font-size:16px; text-align:center;";
      groupHeader.textContent = s.stream.toUpperCase() + " - " + s.department.toUpperCase();
      list.appendChild(groupHeader);
    }
    
    const div = document.createElement("div");
    div.className = "subject";
    div.style.cssText = "display:flex; justify-content:space-between; align-items:center;";
    
    div.innerHTML = `
      <div>
        <strong style="color:#333; font-size:15px;">Semester ${s.semester}</strong>
        <small style="display:block; color:#999; margin-top:5px; font-size:12px;">
          ${s.subjects} subjects • ${s.date}
        </small>
      </div>
      <div style="text-align:right;">
        <b style="color:#6a11cb; font-size:18px;">GPA: ${s.gpa}</b>
        <button onclick="deleteSemester(${s.semester}, '${s.department}', '${s.stream}')" 
                style="display:block; margin-top:8px; background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:12px; font-family:Poppins,sans-serif;">
          Delete
        </button>
      </div>
    `;
    list.appendChild(div);
  });
}

/* ================== DELETE SEMESTER ================== */
function deleteSemester(semester, department, stream) {
  const confirmed = confirm("Are you sure you want to delete Semester " + semester + " data for " + department.toUpperCase() + "?");
  if (!confirmed) return;

  savedSemesters = savedSemesters.filter(s => 
    !(s.semester === semester && 
      s.department === department && 
      s.stream === stream)
  );

  saveToLocalStorage();
  showSaved();
}

/* ================== CLEAR ALL DATA ================== */
function clearAllData() {
  const confirmed = confirm("⚠️ WARNING ⚠️\n\nAre you sure you want to delete ALL saved semester data?\n\nThis action CANNOT be undone!");
  if (!confirmed) return;

  const doubleCheck = confirm("This is your last chance!\n\nAll your GPA records will be permanently deleted.\n\nClick OK to proceed.");
  if (!doubleCheck) return;

  savedSemesters = [];
  saveToLocalStorage();
  showSaved();
  alert("✅ All data has been cleared.");
}

/* ================== OPEN GRAPH ================== */
function openGraph() {
  if (savedSemesters.length === 0) {
    alert("📊 No data to display.\n\nPlease calculate at least one semester GPA first.");
    return;
  }

  showPage("graph-page");

  // Prepare data for all semesters (1-8)
  const data = Array(8).fill(null);
  
  // Fill in the data for saved semesters
  const semesterData = {};
  savedSemesters.forEach(s => {
    if (!semesterData[s.semester]) {
      semesterData[s.semester] = [];
    }
    semesterData[s.semester].push(s.gpa);
  });

  // Calculate average for each semester if multiple entries exist
  Object.keys(semesterData).forEach(sem => {
    const gpas = semesterData[sem];
    const avg = gpas.reduce((a, b) => a + b, 0) / gpas.length;
    data[sem - 1] = parseFloat(avg.toFixed(2));
  });

  const canvas = document.getElementById("semesterChart");
  if (!canvas) {
    console.error("Canvas element not found!");
    alert("Error: Chart canvas not found!");
    return;
  }
  
  const ctx = canvas.getContext("2d");
  
  if (semesterChart) {
    semesterChart.destroy();
  }

  semesterChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"],
      datasets: [{
        label: "Semester GPA",
        data: data,
        borderColor: "#6a11cb",
        backgroundColor: "rgba(106, 17, 203, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#6a11cb",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#2575fc",
        pointHoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: 'GPA',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Semester',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              size: 14,
              family: 'Poppins'
            },
            color: '#333'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(106, 17, 203, 0.9)',
          titleFont: {
            size: 14,
            family: 'Poppins'
          },
          bodyFont: {
            size: 13,
            family: 'Poppins'
          },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(2);
              }
              return label;
            }
          }
        }
      }
    }
  });
}

/* ================== TOGGLE FAQ ================== */
function toggleFAQ() {
  const faqSection = document.getElementById("faq-section");
  if (faqSection) {
    faqSection.classList.toggle("hidden");
  }
}

/* ================== ENCOURAGEMENT MESSAGES ================== */
function getEncouragement(score, type) {
  if (score >= 9.5) return "🌟 Perfect! Your " + type + " is outstanding!";
  if (score >= 9) return "🎉 Excellent! Your " + type + " is superb!";
  if (score >= 8.5) return "🔥 Amazing! You're doing great!";
  if (score >= 8) return "💪 Very good! Keep pushing!";
  if (score >= 7.5) return "👍 Good job! Stay consistent!";
  if (score >= 7) return "✅ Well done! Keep it up!";
  if (score >= 6.5) return "📚 Fair performance! Aim higher!";
  if (score >= 6) return "💡 You passed! Push more next time!";
  if (score >= 5) return "🌱 Keep trying! You can improve!";
  return "💪 Don't give up! You can do it!";
}