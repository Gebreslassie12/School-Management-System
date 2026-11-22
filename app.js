
const pages = {
  dashboard: `
    <h2>Dashboard</h2>
    <div class="cards">
      <div class="card"><h3>Total Students</h3><div class="number">0</div></div>
      <div class="card"><h3>Total Teachers</h3><div class="number">0</div></div>
      <div class="card"><h3>Total Classes</h3><div class="number">0</div></div>
      <div class="card"><h3>Attendance Today</h3><div class="number">0%</div></div>
    </div>
    <div class="panel">
      <h3>Welcome</h3>
      <p>Welcome to School Management System.</p>
      <p>Manage your school information from one place.</p>
    </div>
  `,

  students: `
    <h2>Student Management</h2>
    <div class="panel">
      <h3>Students</h3>
      <p>Register and manage student information.</p>
      <input id="studentName" placeholder="Student full name">
      <input id="studentId" placeholder="Student ID">
      <button onclick="addStudent()">Add Student</button>
      <div id="studentList"></div>
    </div>
  `,

  teachers: `
    <h2>Teacher Management</h2>
    <div class="panel">
      <h3>Teachers</h3>
      <p>Manage teacher information and assignments.</p>
      <input id="teacherName" placeholder="Teacher full name">
      <input id="teacherId" placeholder="Teacher ID">
      <button onclick="addTeacher()">Add Teacher</button>
      <div id="teacherList"></div>
    </div>
  `,

  performance: `
    <h2>Teacher Performance</h2>
    <div class="panel">
      <h3>Performance Evaluation</h3>
      <p>Evaluate teachers using:</p>
      <ul>
        <li>Student academic progress</li>
        <li>Syllabus coverage</li>
        <li>Lesson preparation</li>
        <li>Attendance and punctuality</li>
        <li>Classroom performance</li>
        <li>Assessment and feedback</li>
        <li>Professional development</li>
      </ul>
    </div>
  `,

  classes: `
    <h2>Classes & Subjects</h2>
    <div class="panel">
      <h3>Class Management</h3>
      <input id="className" placeholder="Class name (e.g. Grade 9A)">
      <button onclick="addClass()">Add Class</button>
      <div id="classList"></div>
    </div>
  `,

  attendance: `
    <h2>Attendance</h2>
    <div class="panel">
      <h3>Daily Attendance</h3>
      <p>Attendance records will be managed here.</p>
    </div>
  `,

  results: `
    <h2>Exams & Results</h2>
    <div class="panel">
      <h3>Student Results</h3>
      <p>Examination and assessment records will be managed here.</p>
    </div>
  `,

  reports: `
    <h2>Reports</h2>
    <div class="panel">
      <h3>School Reports</h3>
      <p>Student, teacher, attendance and result reports will appear here.</p>
    </div>
  `
};

function showPage(page, button) {
  const content = document.getElementById("content");

  if (!content || !pages[page]) return;

  content.innerHTML = pages[page];

  document.querySelectorAll("nav button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  }
}

window.showPage = showPage;

function addStudent() {
  const name = document.getElementById("studentName").value.trim();
  const id = document.getElementById("studentId").value.trim();
  if (!name || !id) {
    alert("Please enter student name and ID.");
    return;
  }
  const list = document.getElementById("studentList");
  list.innerHTML += `<p>${name} — ${id}</p>`;
  document.getElementById("studentName").value = "";
  document.getElementById("studentId").value = "";
}

function addTeacher() {
  const name = document.getElementById("teacherName").value.trim();
  const id = document.getElementById("teacherId").value.trim();
  if (!name || !id) {
    alert("Please enter teacher name and ID.");
    return;
  }
  const list = document.getElementById("teacherList");
  list.innerHTML += `<p>${name} — ${id}</p>`;
  document.getElementById("teacherName").value = "";
  document.getElementById("teacherId").value = "";
}

function addClass() {
  const name = document.getElementById("className").value.trim();
  if (!name) {
    alert("Please enter class name.");
    return;
  }
  document.getElementById("classList").innerHTML += `<p>${name}</p>`;
  document.getElementById("className").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const firstButton = document.querySelector("nav button");
  showPage("dashboard", firstButton);
});
