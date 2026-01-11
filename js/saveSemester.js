function saveSemester(){
  const data={
    department,semester,
    gpa:document.getElementById("gpa").innerText
  };
  let saved=JSON.parse(localStorage.getItem("wec"))||[];
  saved=saved.filter(s=>!(s.department===department && s.semester===semester));
  saved.push(data);
  localStorage.setItem("wec",JSON.stringify(saved));
  alert("Semester saved");
}

function deleteSemester(){
  let saved=JSON.parse(localStorage.getItem("wec"))||[];
  saved=saved.filter(s=>!(s.department===department && s.semester===semester));
  localStorage.setItem("wec",JSON.stringify(saved));
  alert("Deleted");
}