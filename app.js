const pages = {
  dashboard: `
    <h2>Dashboard</h2>
    <div class="cards">
      <div class="card"><h3>Total Students</h3><div class="number">0</div></div>
      <div class="card"><h3>Total Teachers</h3><div class="number">0</div></div>
      <div class="card"><h3>Classes</h3><div class="number">0</div></div>
      <div class="card"><h3>Attendance</h3><div class="number">0%</div></div>
    </div>
    <section class="panel">
      <h3>Welcome</h3>
      <p>School Management System by Gebreslassie.</p>
    </section>
  `,
  students: `
    <h2>Student Management</h2>
    <p>Manage student information and records.</p>
  `,
  teachers: `
    <h2>Teacher Management</h2>
    <p>Manage teacher information and records.</p>
  `,
  performance: `
    <h2>Teacher Performance</h2>
    <p>Evaluate lesson preparation, attendance, syllabus coverage and student progress.</p>
  `,
  attendance: `
    <h2>Attendance</h2>
    <p>Manage student and teacher attendance.</p>
  `,
  results: `
    <h2>Exams & Results</h2>
    <p>Manage examinations and student results.</p>
  `,
  classes: `
    <h2>Classes & Subjects</h2>
    <p>Manage classes and subjects.</p>
  `,
  reports: `
    <h2>Reports</h2>
    <p>School reports will appear here.</p>
  `
};

function showPage(page, button) {
  const content = document.getElementById("content");

  if (!content || !pages[page]) return;

  content.innerHTML = pages[page];

  document.querySelectorAll("nav button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (button) button.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const firstButton = document.querySelector("nav button");
  showPage("dashboard", firstButton);
});
