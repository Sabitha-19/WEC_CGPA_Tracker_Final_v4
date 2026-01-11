function saveSemester(dept, sem, gpa) {
  let data = JSON.parse(localStorage.getItem("cgpaData")) || {};

  if (!data[dept]) data[dept] = {};
  data[dept][`sem${sem}`] = Number(gpa);

  localStorage.setItem("cgpaData", JSON.stringify(data));
}

function deleteSemester(dept, sem) {
  let data = JSON.parse(localStorage.getItem("cgpaData")) || {};
  if (data[dept]) {
    delete data[dept][`sem${sem}`];
    localStorage.setItem("cgpaData", JSON.stringify(data));
  }
  updateResult();
}

function updateResult() {
  const data = JSON.parse(localStorage.getItem("cgpaData")) || {};
  const deptData = data[selectedDept] || {};

  let sum = 0, count = 0;
  Object.values(deptData).forEach(g => {
    sum += g;
    count++;
  });

  const cgpa = count ? (sum / count).toFixed(2) : 0;
  document.getElementById("gpa").textContent =
    deptData[`sem${selectedSem}`] || 0;
  document.getElementById("cgpa").textContent = cgpa;
  document.getElementById("percentage").textContent =
    (cgpa * 9.5).toFixed(2) + "%";

  drawChart(deptData);
}