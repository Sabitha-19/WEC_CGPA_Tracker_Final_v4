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
document.addEventListener('DOMContentLoaded', function() {  
  // FAQ accordion functionality  
  document.querySelectorAll(".faq-question").forEach(btn => {  
    btn.addEventListener("click", () => {  
      const ans = btn.nextElementSibling;  
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
  const saved = localStorage.getItem('wec_cgpa_data');  
  if (saved) {  
    try {  
      savedSemesters = JSON.parse(saved);  
    } catch (e) {  
      console.error("Error loading saved data:", e);  
      savedSemesters = [];  
    }  
  }  
}  
  
function saveToLocalStorage() {  
  try {  
    localStorage.setItem('wec_cgpa_data', JSON.stringify(savedSemesters));  
  } catch (e) {  
    console.error("Error saving data:", e);  
    alert("Error saving data to local storage!");  
  }  
}  
  
/* ================== PAGE NAVIGATION ================== */  
function showPage(id) {  
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));  
  const page = document.getElementById(id);  
  if (page) {  
    page.classList.add("active");  
  }  
}  
  
/* ================== STREAM SELECTION ================== */  
function selectStream(stream, btn) {  
  selectedStream = stream;  
  document.querySelectorAll("#stream-page .cube-btn").forEach(b => b.classList.remove("active"));  
  btn.classList.add("active");  
  showDepartments();  
  showPage("department-page");  
}  
  
/* ================== DEPARTMENT SELECTION ================== */  
function showDepartments() {  
  const grid = document.getElementById("department-grid");  
  grid.innerHTML = "";  
  
  departments[selectedStream].forEach(dep => {  
    const b = document.createElement("button");  
    b.className = "cube-btn";  
    b.textContent = dep;  
    b.onclick = () => selectDepartment(dep.toLowerCase(), b);  
    grid.appendChild(b);  
  });  
}  
  
function selectDepartment(dep, btn) {  
  selectedDepartment = dep;  
  document.querySelectorAll("#department-grid .cube-btn").forEach(b => b.classList.remove("active"));  
  btn.classList.add("active");  
  showSemesters();  
  showPage("semester-page");  
}  
  
/* ================== SEMESTER SELECTION ================== */  
function showSemesters() {  
  const grid = document.getElementById("semester-grid");  
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
  selectedSemester = sem;  
  document.querySelectorAll("#semester-grid .cube-btn").forEach(b => b.classList.remove("active"));  
  btn.classList.add("active");  
  loadSubjects();  
}  
  
/* ================== LOAD SUBJECTS FROM JSON ================== */  
function loadSubjects() {  
  grades = {};  
    
  // Construct the file path based on department and semester  
  const fileName = `${selectedDepartment}_sem${selectedSemester}.json`;  
  const filePath = `data/${fileName}`;  
    
  fetch(filePath)  
    .then(res => {  
      if (!res.ok) {  
        throw new Error(`HTTP error! status: ${res.status}`);  
      }  
      return res.json();  
    })  
    .then(data => {  
      subjects = data;  
      renderSubjects();  
      showPage("subjects-page");  
    })  
    .catch(error => {  
      console.error("Error loading subjects:", error);  
      alert(`Could not load subjects for ${selectedDepartment.toUpperCase()} Semester ${selectedSemester}.\n\nPlease make sure the file '${fileName}' exists in the data folder.`);  
    });  
}  
  
/* ================== RENDER SUBJECTS ================== */  
function renderSubjects() {  
  const box = document.getElementById("subjects-list");  
  box.innerHTML = "";  
  
  if (!subjects || subjects.length === 0) {  
    box.innerHTML = "<p style='text-align:center; color:#999; padding:20px;'>No subjects found.</p>";  
    return;  
  }  
  
  subjects.forEach(sub => {  
    const div = document.createElement("div");  
    div.className = "subject";  
      
    const strong = document.createElement("strong");  
    strong.textContent = `${sub.name} (${sub.credits} credits)`;  
      
    const select = document.createElement("select");  
    select.style.cssText = "padding:8px 16px; border:2px solid #6a11cb; border-radius:10px; background:#fff; color:#6a11cb; font-weight:600; cursor:pointer; font-family:Poppins,sans-serif; font-size:14px;";  
    select.onchange = function() {  
      grades[sub.code] = this.value;  
    };  
      
    const defaultOption = document.createElement("option");  
    defaultOption.value = "";  
    defaultOption.textContent = "Select Grade";  
    select.appendChild(defaultOption);  
      
    ["S", "A", "B", "C", "D", "E", "F"].forEach(grade => {  
      const option = document.createElement("option");  
      option.value = grade;  
      option.textContent = grade;  
      select.appendChild(option);  
    });  
      
    div.appendChild(strong);  
    div.appendChild(select);  
    box.appendChild(div);  
  });  
  
  // Clear encouragement text  
  document.getElementById("encouragement-text").innerText = "";  
}  
  
/* ================== CALCULATE GPA ================== */  
function calculateGPA() {  
  let total = 0;  
  let credits = 0;  
  let missingGrades = false;  
  
  subjects.forEach(s => {  
    const g = grades[s.code];  
    if (g && gradePoints[g] !== undefined) {  
      total += gradePoints[g] * s.credits;  
      credits += s.credits;  
    } else {  
      missingGrades = true;  
    }  
  });  
  
  if (credits === 0) {  
    alert("Please select grades for at least one subject!");  
    return;  
  }  
  
  if (missingGrades) {  
    const confirmCalc = confirm("Some subjects don't have grades selected. Continue with calculation?");  
    if (!confirmCalc) return;  
  }  
  
  const gpa = (total / credits).toFixed(2);  
  
  document.getElementById("cgpa-display").innerText = `Semester ${selectedSemester} GPA: ${gpa}`;  
  document.getElementById("encouragement-text").innerText = getEncouragement(parseFloat(gpa), "GPA");  
  
  saveSemester(gpa);  
  showPage("result-page");  
}  
  
/* ================== SAVE SEMESTER ================== */  
function saveSemester(gpa) {  
  // Remove existing entry for this semester/department/stream if any  
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
  
  // Save to localStorage  
  saveToLocalStorage();  
  
  const cgpa = calculateCGPA();  
  document.getElementById("cgpa-message").innerText =   
    `Overall CGPA: ${cgpa} - ${getEncouragement(parseFloat(cgpa), "CGPA")}`;  
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
  showPage("saved-page");  
  
  const list = document.getElementById("saved-list");  
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
        <p style="color:#666; margin-bottom:10px; font-size:15px;">📚 No semester data yet</p>  
        <p style="color:#999; font-size:13px;">Start by calculating your first GPA!</p>  
      </div>  
    `;  
    return;  
  }  
  
  // Group by stream and department  
  let currentGroup = null;  
    
  savedSemesters.forEach(s => {  
    const groupKey = `${s.stream}_${s.department}`;  
      
    if (currentGroup !== groupKey) {  
      currentGroup = groupKey;  
      const groupHeader = document.createElement("div");  
      groupHeader.style.cssText = "margin-top:25px; margin-bottom:12px; color:#6a11cb; font-weight:600; font-size:16px; text-align:center;";  
      groupHeader.textContent = `${s.stream.toUpperCase()} - ${s.department.toUpperCase()}`;  
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
  const confirmed = confirm(`Are you sure you want to delete Semester ${semester} data for ${department.toUpperCase()}?`);  
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
  
  const doubleCheck = confirm("This is your last chance!\n\nAll your GPA records will be permanently deleted.\n\nClick OK to proceed with deletion.");  
  if (!doubleCheck) return;  
  
  savedSemesters = [];  
  saveToLocalStorage();  
  showSaved();  
  alert("All data has been cleared.");  
}  
  
/* ================== OPEN GRAPH ================== */  
function openGraph() {  
  if (savedSemesters.length === 0) {  
    alert("No data to display. Please calculate at least one semester GPA first.");  
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
  
  const ctx = document.getElementById("semesterChart").getContext("2d");  
    
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
  faqSection.classList.toggle("hidden");  
}  
  
/* ================== ENCOURAGEMENT MESSAGES ================== */  
function getEncouragement(score, type = "GPA") {  
  if (score >= 9.5) return `🌟 Perfect! Your ${type} is outstanding. You're a star!`;  
  if (score >= 9) return `🎉 Excellent! Your ${type} is superb. Keep up the great work!`;  
  if (score >= 8.5) return `🔥 Amazing! Your ${type} is impressive. You're doing great!`;  
  if (score >= 8) return `💪 Very good! Your ${type} is strong. Keep pushing!`;  
  if (score >= 7.5) return `👍 Good job! Your ${type} is solid. Stay consistent!`;  
  if (score >= 7) return `✅ Well done! Your ${type} is good. Keep it up!`;  
  if (score >= 6.5) return `📚 Fair performance! Your ${type} shows effort. Aim higher!`;  
  if (score >= 6) return `💡 You passed! Push yourself a bit more next time.`;  
  if (score >= 5) return `🌱 Keep trying! Every expert was once a beginner.`;  
  return `💪 Don't give up! Every topper once struggled. You can do it!`;  
}  
  
/* ================== EXPORT DATA ================== */  
function exportData() {  
  if (savedSemesters.length === 0) {  
    alert("No data to export! Calculate some GPAs first.");  
    return;  
  }  
  
  const dataStr = JSON.stringify(savedSemesters, null, 2);  
  const dataBlob = new Blob([dataStr], { type: 'application/json' });  
  const url = URL.createObjectURL(dataBlob);  
  const link = document.createElement('a');  
  link.href = url;  
  link.download = `wec_cgpa_data_${new Date().toISOString().split('T')[0]}.json`;  
  link.click();  
  URL.revokeObjectURL(url);  
    
  alert("Data exported successfully!");  
}  
  
/* ================== IMPORT DATA ================== */  
function importData() {  
  const input = document.createElement('input');  
  input.type = 'file';  
  input.accept = 'application/json';  
    
  input.onchange = function(e) {  
    const file = e.target.files[0];  
    if (!file) return;  
      
    const reader = new FileReader();  
    reader.onload = function(event) {  
      try {  
        const importedData = JSON.parse(event.target.result);  
        if (Array.isArray(importedData)) {  
          const confirmed = confirm("⚠️ This will REPLACE all existing data!\n\nDo you want to continue?");  
          if (confirmed) {  
            savedSemesters = importedData;  
            saveToLocalStorage();  
            alert("✅ Data imported successfully!");  
            showSaved();  
          }  
        } else {  
          alert("❌ Invalid data format! Please select a valid JSON file.");  
        }  
      } catch (error) {  
        alert("❌ Error importing data: " + error.message);  
      }  
    };  
    reader.readAsText(file);  
  };  
    
  input.click();  
}