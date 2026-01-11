saveSemBtn.onclick = ()=>{
  let gpa = parseFloat(gpaSpan.textContent);
  if(!gpa) return alert("Select grades first");

  let data = JSON.parse(localStorage.getItem('cgpaData')||'[]');
  data.push({semester, gpa});
  localStorage.setItem('cgpaData', JSON.stringify(data));
  calculateCGPA();
};

function calculateCGPA(){
  let data = JSON.parse(localStorage.getItem('cgpaData')||'[]');
  if(!data.length) return;

  let sum = data.reduce((a,b)=>a+b.gpa,0);
  let cgpa = (sum/data.length).toFixed(2);
  cgpaSpan.textContent=cgpa;
  percentage.textContent=(cgpa*9.5).toFixed(2)+'%';

  encourage.textContent = cgpa>=8
    ? "🌟 Excellent performance!"
    : cgpa>=6
    ? "👍 Good, keep improving!"
    : "💪 You can do better!";
}