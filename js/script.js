// Add this to your existing script.js

// Back Navigation Logic
let navigationHistory = ["welcomeSection"];

function showSection(sectionName) {
  Object.values(sections).forEach(s => s.classList.add("hidden"));
  document.getElementById("welcomeSection").classList.add("hidden");
  
  const target = document.getElementById(sectionName) || sections[sectionName];
  target.classList.remove("hidden");
  
  if (navigationHistory[navigationHistory.length - 1] !== sectionName) {
    navigationHistory.push(sectionName);
  }
}

document.querySelectorAll(".back-link").forEach(btn => {
  btn.onclick = () => {
    navigationHistory.pop();
    const prevSection = navigationHistory[navigationHistory.length - 1];
    showSection(prevSection);
  };
});

// Home Button
document.getElementById("homeBtn").onclick = () => {
  navigationHistory = ["welcomeSection"];
  showSection("welcomeSection");
};

// Percentage Converter
function convertToPercentage() {
  const cgpa = document.getElementById("cgpaInput").value;
  const result = document.getElementById("percentResult");
  if (cgpa) {
    // Standard formula: (CGPA - 0.5) * 10
    const percentage = (parseFloat(cgpa) * 10).toFixed(1); 
    result.innerHTML = `Approximate Percentage: <strong>${percentage}%</strong>`;
  }
}

// Update the loadSubjects function to set the title
function loadSubjects() {
  const path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
  document.getElementById("currentSemTitle").textContent = `${state.dept} - Semester ${state.sem}`;
  // ... rest of your fetch code ...
}
