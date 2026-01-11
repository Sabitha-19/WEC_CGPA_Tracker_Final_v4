// ---------- saveSemester.js ----------

// Auto-load saved semesters
function loadSavedSemesters() {
  const saved = JSON.parse(localStorage.getItem("semesters") || "{}");
  for (let dept in saved) {
    for (let sem in saved[dept]) {
      console.log(`Loaded: ${dept} Sem ${sem} GPA ${saved[dept][sem]}`);
    }
  }
}

// Edit or Delete saved semester
function editSemester(dept, sem, newGPA) {
  const saved = JSON.parse(localStorage.getItem("semesters") || "{}");
  if (saved[dept] && saved[dept][sem]) {
    saved[dept][sem] = parseFloat(newGPA);
    localStorage.setItem("semesters", JSON.stringify(saved));
    alert(`Updated ${dept} Sem ${sem} to GPA ${newGPA}`);
  }
}

function deleteSemester(dept, sem) {
  const saved = JSON.parse(localStorage.getItem("semesters") || "{}");
  if (saved[dept] && saved[dept][sem]) {
    delete saved[dept][sem];
    if (Object.keys(saved[dept]).length === 0) delete saved[dept];
    localStorage.setItem("semesters", JSON.stringify(saved));
    alert(`Deleted ${dept} Sem ${sem}`);
    showChart();
  }
}

// Auto-load chart on page load
window.addEventListener("load", () => {
  loadSavedSemesters();
  showChart();
});