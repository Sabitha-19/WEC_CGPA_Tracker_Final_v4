function goBack(target) {
  showTab(target);
}

const DEPARTMENTS = ['ISE','CSE','ECE','EEE','AA'];
let state = { dept:null, sem:null, subjects:[], saved:{} };

const startBtn = document.getElementById('startBtn');
const deptList = document.getElementById('deptList');
const semList = document.getElementById('semList');
const subjectsEl = document.getElementById('subjects');
const feedback = document.getElementById('feedback');
const totalCreditsEl = document.getElementById('totalCredits');
const gpaEl = document.getElementById('gpa');
const cgpaEl = document.getElementById('cgpa');
const savedList = document.getElementById('savedList');

function showTab(id) {
  document.querySelectorAll('.tab').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

startBtn.onclick = () => showTab('dept');

// --- Build Department Buttons ---
DEPARTMENTS.forEach(d => {
  const btn = document.createElement('div');
  btn.className = 'dept-btn';
  btn.textContent = d;
  btn.onclick = () => {
    state.dept = d;
    buildSemButtons();
    showTab('sem');
  };
  deptList.appendChild(btn);
});

function buildSemButtons() {
  semList.innerHTML = '';
  for (let i = 1; i <= 8; i++) {
    const b = document.createElement('div');
    b.className = 'sem-btn';
    b.textContent = 'Semester ' + i;
    b.onclick = () => { state.sem = i; loadSyllabus(); };
    semList.appendChild(b);
  }
}

async function loadSyllabus() {
  feedback.textContent = 'Loading syllabus...';
  const path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Missing file');
    const json = await res.json();
    state.subjects = json.subjects || [];
    renderSubjects();
    showTab('calc');
  } catch (e) {
    feedback.textContent = 'Syllabus not found.';
  }
}

function renderSubjects() {
  subjectsEl.innerHTML = '';
  state.subjects.forEach((s, idx) => {
    const box = document.createElement('div');
    box.className = 'subject';
    box.dataset.credits = s.credits;
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between">
        <strong>${s.code}</strong>
        <span>${s.credits} credits</span>
      </div>
      <div>${s.name}</div>
      <div class="grade-grid">
        ${['S','A','B','C','D','E','F']
          .map(g => `<div class="grade-cell" data-value="${g}">${g}</div>`).join('')}
      </div>`;
    subjectsEl.appendChild(box);
    box.querySelectorAll('.grade-cell').forEach(c => {
      c.onclick = () => {
        box.querySelectorAll('.grade-cell').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        s.selected = c.dataset.value;
      };
    });
  });
}

function gradeToPoint(g) {
  return { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 }[g] || 0;
}

// 🎯 Calculate GPA and Show Result Page
document.getElementById('calculate').onclick = function() {
  let tot = 0, wt = 0;

  for (const s of state.subjects) {
    if (!s.selected) {
      feedback.textContent = '⚠️ Please select all grades before calculating.';
      return;
    }
    tot += Number(s.credits);
    wt += gradeToPoint(s.selected) * Number(s.credits);
  }

  const gpa = tot ? wt / tot : 0;
  const gpaFixed = gpa.toFixed(2);

  totalCreditsEl.textContent = tot;
  gpaEl.textContent = gpaFixed;

  // 🎓 Encouragement message
  let msg = "";
  if (gpa >= 9) msg = "🌟 Outstanding performance! Keep shining!";
  else if (gpa >= 8) msg = "💪 Excellent work! You're doing amazing!";
  else if (gpa >= 7) msg = "👍 Good job! Keep up the effort!";
  else if (gpa >= 6) msg = "😊 Nice effort! You’re improving!";
  else if (gpa >= 5) msg = "📘 Keep learning, you’ll do even better!";
  else msg = "🔥 Don’t give up! Try harder next semester!";

  // ✅ Update result page
  document.getElementById("result-gpa").textContent = "Your GPA: " + gpaFixed;
  document.getElementById("result-msg").textContent = msg;

  // 🎆 Optional confetti for high GPA
  if (gpa >= 9 && typeof confetti === "function") {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }

  // ✅ Show the result page
  showTab("result");
};

// 💾 Save GPA to localStorage
document.getElementById('save').onclick = function() {
  if (!state.dept || !state.sem) {
    feedback.textContent = "Select department and semester before saving.";
    return;
  }

  const gpa = parseFloat(gpaEl.textContent);
  if (isNaN(gpa) || gpa === 0) {
    feedback.textContent = "Please calculate GPA before saving.";
    return;
  }

  state.saved[`${state.dept}_sem${state.sem}`] = gpa;
  localStorage.setItem("wec_saved", JSON.stringify(state.saved));

  renderSaved();
  feedback.textContent = "✅ Semester saved successfully!";
  showTab("saved");
};

// 🧮 Render Saved Semesters
function renderSaved() {
  const data = state.saved;
  savedList.innerHTML = '';
  let total = 0, count = 0;

  for (const [key, val] of Object.entries(data)) {
    const li = document.createElement('li');
    li.textContent = `${key.toUpperCase()}: GPA ${val.toFixed(2)}`;
    savedList.appendChild(li);
    total += val;
    count++;
  }

  const cgpa = count ? (total / count).toFixed(2) : '0.00';
  cgpaEl.textContent = cgpa;
}
