
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

import {
  addRecord,
  getRecords,
  updateRecord,
  deleteRecord
} from "./db.js";

const $ = selector => document.querySelector(selector);

let currentUser = null;
let attendanceSaving = false;
let performanceSaving = false;
let editingPerformanceId = null;

let performanceAreas = [
  "Student Progress",
  "Syllabus Coverage",
  "Lesson Preparation",
  "Punctuality",
  "Classroom Performance",
  "Assessment"
];

const ratingOptions = [
  { value: 4, label: "ኣዝዩ ልዑል" },
  { value: 3, label: "ልዑል" },
  { value: 2, label: "ኣዕጋቢ" },
  { value: 1, label: "ትሑት" }
];

const pages = {
  dashboard: `
    <h2>Dashboard</h2>
    <div class="cards">
      <div class="card">
        <h3>Students</h3>
        <div class="number" id="studentCount">0</div>
      </div>
      <div class="card">
        <h3>Teachers</h3>
        <div class="number" id="teacherCount">0</div>
      </div>
      <div class="card">
        <h3>Classes</h3>
        <div class="number" id="classCount">0</div>
      </div>
    </div>
    <div class="panel">
      <h3>Welcome</h3>
      <p>Welcome to School Management System.</p>
    </div>
  `,

  students: `
    <h2>Student Management</h2>
    <div class="panel">
      <h3>Register Student</h3>
      <input id="studentName" placeholder="Student full name">
      <input id="studentId" placeholder="Student ID">
      <button onclick="addStudent()">Add Student</button>
      <p id="studentMessage"></p>
      <div id="studentList"></div>
    </div>
  `,

  teachers: `
    <h2>Teacher Management</h2>
    <div class="panel">
      <h3>Register Teacher</h3>
      <input id="teacherName" placeholder="Teacher full name">
      <input id="teacherId" placeholder="Teacher ID">
      <button onclick="addTeacher()">Add Teacher</button>
      <p id="teacherMessage"></p>
      <div id="teacherList"></div>
    </div>
  `,

  classes: `
    <h2>Classes & Subjects</h2>
    <div class="panel">
      <h3>Class Management</h3>
      <input id="className" placeholder="Class name (e.g. Grade 9A)">
      <button onclick="addClass()">Add Class</button>
      <p id="classMessage"></p>
      <div id="classList"></div>
    </div>
  `,

  performance: `
    <h2>Teacher Performance Evaluation</h2>

    <div class="panel">
      <h3>Teacher Information</h3>

      <label>Select Teacher</label>
      <select id="performanceTeacher">
        <option value="">Loading teachers...</option>
      </select>

      <label>Department / Subject</label>
      <input id="performanceDepartment" placeholder="Department or subject">

      <label>Evaluation Date</label>
      <input type="date" id="performanceDate">

      <label>Academic Year</label>
      <input id="performanceYear" placeholder="e.g. 2019 E.C.">
    </div>

    <div class="panel">
      <h3>Performance Evaluation Criteria</h3>
      <p>Select one rating for every performance area.</p>

      <div id="performanceAreas"></div>

      <hr>

      <h3>Add Performance Area</h3>
      <input id="newPerformanceArea"
        placeholder="Enter additional performance area">

      <button onclick="addPerformanceArea()">
        Add Performance Area
      </button>

      <p id="areaMessage"></p>
    </div>

    <div class="panel">
      <h3>Overall Performance Result</h3>
      <p>Total Score: <strong id="performanceTotal">0</strong></p>
      <p>Maximum Score: <strong id="performanceMaximum">0</strong></p>
      <p>Average: <strong id="performanceAverage">0</strong></p>
      <p>Percentage: <strong id="performancePercentage">0%</strong></p>
      <p>Overall Rating: <strong id="performanceOverall">Not evaluated</strong></p>
    </div>

    <div class="panel">
      <h3>Teacher's Strengths</h3>
      <textarea id="teacherStrengths"
        placeholder="Describe the teacher's strengths"></textarea>

      <h3>Areas for Improvement</h3>
      <textarea id="teacherImprovements"
        placeholder="Describe areas that need improvement"></textarea>

      <h3>Recommendations</h3>
      <textarea id="teacherRecommendations"
        placeholder="Write recommendations"></textarea>
    </div>

    <div class="panel">
      <h3>Department Head's Comment</h3>
      <textarea id="departmentComment" placeholder="Department head comment"></textarea>
      <input id="departmentHeadName" placeholder="Department head full name">
      <input id="departmentHeadSignature" placeholder="Signature">
      <label>Date</label>
      <input type="date" id="departmentHeadDate">
    </div>

    <div class="panel">
      <h3>Deputy Principal's Comment</h3>
      <textarea id="deputyComment" placeholder="Deputy principal comment"></textarea>
      <input id="deputyName" placeholder="Deputy principal full name">
      <input id="deputySignature" placeholder="Signature">
      <label>Date</label>
      <input type="date" id="deputyDate">
    </div>

    <div class="panel">
      <h3>Principal's Comment</h3>
      <textarea id="principalComment" placeholder="Principal comment"></textarea>
      <input id="principalName" placeholder="Principal full name">
      <input id="principalSignature" placeholder="Signature">
      <label>Date</label>
      <input type="date" id="principalDate">
    </div>

    <div class="panel">
      <h3>Teacher's Acknowledgement</h3>
      <textarea id="teacherComment" placeholder="Teacher's comment or response"></textarea>
      <input id="teacherSignature" placeholder="Teacher signature">
      <label>Date</label>
      <input type="date" id="teacherSignatureDate">
    </div>

    <div class="panel">
      <h3>Evaluator Information</h3>
      <input id="evaluatorName" placeholder="Evaluator full name">
      <input id="evaluatorPosition" placeholder="Evaluator position">
    </div>

    <div class="panel">
      <button id="savePerformanceButton" onclick="savePerformance()">
        Save Evaluation
      </button>

      <button id="cancelPerformanceEdit"
        onclick="cancelPerformanceEdit()"
        style="display:none;">
        Cancel Update
      </button>

      <p id="performanceMessage"></p>
    </div>

    <div class="panel">
      <h3>Saved Teacher Evaluations</h3>
      <div id="performanceList">Loading...</div>
    </div>
  `,

  attendance: `
    <h2>Attendance</h2>
    <div class="panel">
      <h3>Record Attendance</h3>

      <label>Attendance for</label>
      <select id="attendanceType" onchange="loadAttendanceNames()">
        <option value="students">Students</option>
        <option value="teachers">Teachers</option>
      </select>

      <label>Name</label>
      <select id="attendancePerson">
        <option value="">Loading names...</option>
      </select>

      <label>Date</label>
      <input type="date" id="attendanceDate">

      <label>Status</label>
      <select id="attendanceStatus">
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Late">Late</option>
      </select>

      <button id="saveAttendanceButton" onclick="saveAttendance()">
        Save Attendance
      </button>

      <p id="attendanceMessage"></p>
      <div id="attendanceList"></div>
    </div>
  `,

  results: `
    <h2>Exams & Results</h2>
    <div class="panel">
      <p>Examination and student results management will be developed here.</p>
    </div>
  `,

  reports: `
    <h2>Reports</h2>
    <div class="panel">
      <p>School reports will be developed here.</p>
    </div>
  `
};

/* GENERAL HELPERS */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showPage(page, button) {
  if (!pages[page]) return;

  $("#content").innerHTML = pages[page];

  document.querySelectorAll("nav button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (button) button.classList.add("active");

  if (page === "students") loadStudents();
  if (page === "teachers") loadTeachers();
  if (page === "classes") loadClasses();
  if (page === "dashboard") loadDashboard();

  if (page === "attendance") {
    $("#attendanceDate").value = getLocalDate();
    loadAttendanceNames();
    loadAttendanceRecords();
  }

  if (page === "performance") {
    $("#performanceDate").value = getLocalDate();
    renderPerformanceAreas();
    loadPerformanceTeachers();
    loadPerformanceRecords();
    updatePerformanceScore();
  }
}

/* STUDENTS, TEACHERS AND CLASSES */

async function displayRecords(collectionName, elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = "Loading...";

  try {
    const records = await getRecords(collectionName);

    if (!records.length) {
      element.innerHTML = "<p>No records found.</p>";
      return;
    }

    element.innerHTML = records.map(record => `
      <div class="panel">
        <strong>${escapeHTML(record.name)}</strong>
        <p>${escapeHTML(record.code || "")}</p>
        <button onclick="removeRecord('${escapeHTML(record.id)}','${collectionName}')">
          Delete
        </button>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
    element.textContent = "Unable to load records.";
  }
}

async function loadStudents() {
  await displayRecords("students", "studentList");
}

async function loadTeachers() {
  await displayRecords("teachers", "teacherList");
}

async function loadClasses() {
  await displayRecords("classes", "classList");
}

async function loadDashboard() {
  try {
    const [students, teachers, classes] = await Promise.all([
      getRecords("students"),
      getRecords("teachers"),
      getRecords("classes")
    ]);

    if ($("#studentCount")) $("#studentCount").textContent = students.length;
    if ($("#teacherCount")) $("#teacherCount").textContent = teachers.length;
    if ($("#classCount")) $("#classCount").textContent = classes.length;

  } catch (error) {
    console.error(error);
  }
}

async function saveRecord(collectionName, name, code, messageId, reloadFunction) {
  const message = document.getElementById(messageId);

  if (!name.trim()) {
    message.textContent = "Please enter a name.";
    return false;
  }

  try {
    await addRecord(collectionName, {
      name: name.trim(),
      code: code.trim()
    });

    message.textContent = "Saved successfully!";
    await reloadFunction();
    await loadDashboard();

    return true;

  } catch (error) {
    console.error(error);
    message.textContent = "Error: " + error.message;
    return false;
  }
}

async function addStudent() {
  const saved = await saveRecord(
    "students",
    $("#studentName").value,
    $("#studentId").value,
    "studentMessage",
    loadStudents
  );

  if (saved) {
    $("#studentName").value = "";
    $("#studentId").value = "";
  }
}

async function addTeacher() {
  const saved = await saveRecord(
    "teachers",
    $("#teacherName").value,
    $("#teacherId").value,
    "teacherMessage",
    loadTeachers
  );

  if (saved) {
    $("#teacherName").value = "";
    $("#teacherId").value = "";
  }
}

async function addClass() {
  const saved = await saveRecord(
    "classes",
    $("#className").value,
    "",
    "classMessage",
    loadClasses
  );

  if (saved) $("#className").value = "";
}

/* TEACHER PERFORMANCE */

async function loadPerformanceTeachers() {
  const select = $("#performanceTeacher");
  if (!select) return;

  select.innerHTML = `<option value="">Loading teachers...</option>`;

  try {
    const teachers = await getRecords("teachers");

    if (!teachers.length) {
      select.innerHTML =
        `<option value="">No teachers found. Register first.</option>`;
      return;
    }

    select.innerHTML = `
      <option value="">Select Teacher</option>
      ${teachers.map(teacher => `
        <option value="${escapeHTML(teacher.id)}"
          data-name="${escapeHTML(teacher.name)}"
          data-code="${escapeHTML(teacher.code || "")}">
          ${escapeHTML(teacher.name)}
          ${teacher.code ? " — " + escapeHTML(teacher.code) : ""}
        </option>
      `).join("")}
    `;

  } catch (error) {
    console.error(error);
    select.innerHTML = `<option value="">Unable to load teachers.</option>`;
  }
}

function renderPerformanceAreas() {
  const container = $("#performanceAreas");
  if (!container) return;

  container.innerHTML = performanceAreas.map((area, index) => `
    <div class="panel">
      <label>
        <strong>${index + 1}. ${escapeHTML(area)}</strong>
      </label>

      <select class="performance-rating"
        data-area="${escapeHTML(area)}"
        onchange="updatePerformanceScore()">
        <option value="">Select Rating</option>
        ${ratingOptions.map(option => `
          <option value="${option.value}">
            ${option.label}
          </option>
        `).join("")}
      </select>
    </div>
  `).join("");

  updatePerformanceScore();
}

function addPerformanceArea() {
  const input = $("#newPerformanceArea");
  const message = $("#areaMessage");
  const area = input.value.trim();

  if (!area) {
    message.textContent = "Please enter a performance area.";
    return;
  }

  if (performanceAreas.some(
    item => item.toLowerCase() === area.toLowerCase()
  )) {
    message.textContent = "This performance area already exists.";
    return;
  }

  performanceAreas.push(area);
  input.value = "";
  message.textContent = "Performance area added successfully!";

  renderPerformanceAreas();
}

function getPerformanceResult(percentage) {
  if (percentage >= 90) return "ኣዝዩ ልዑል";
  if (percentage >= 75) return "ልዑል";
  if (percentage >= 50) return "ኣዕጋቢ";
  return "ትሑት";
}

function calculatePerformance() {
  const selects = document.querySelectorAll(".performance-rating");

  let total = 0;
  let completed = 0;

  selects.forEach(select => {
    if (select.value !== "") {
      total += Number(select.value);
      completed++;
    }
  });

  const maximum = selects.length * 4;
  const average = completed ? total / completed : 0;
  const percentage = maximum ? (total / maximum) * 100 : 0;

  return {
    total,
    maximum,
    completed,
    average,
    percentage,
    overall: completed === selects.length && selects.length
      ? getPerformanceResult(percentage)
      : "Incomplete evaluation"
  };
}

function updatePerformanceScore() {
  if (!$("#performanceTotal")) return;

  const result = calculatePerformance();

  $("#performanceTotal").textContent = result.total;
  $("#performanceMaximum").textContent = result.maximum;
  $("#performanceAverage").textContent = result.average.toFixed(2);
  $("#performancePercentage").textContent =
    result.percentage.toFixed(1) + "%";
  $("#performanceOverall").textContent = result.overall;
}

function getPerformanceFormData() {
  const teacherSelect = $("#performanceTeacher");
  const selectedTeacher =
    teacherSelect.options[teacherSelect.selectedIndex];

  const result = calculatePerformance();

  const areas = Array.from(
    document.querySelectorAll(".performance-rating")
  ).map(select => ({
    name: select.dataset.area,
    score: Number(select.value),
    rating: ratingOptions.find(
      option => option.value === Number(select.value)
    )?.label || ""
  }));

  return {
    teacherId: teacherSelect.value,
    teacherName: selectedTeacher?.dataset.name || "",
    teacherCode: selectedTeacher?.dataset.code || "",

    department: $("#performanceDepartment").value.trim(),
    date: $("#performanceDate").value,
    academicYear: $("#performanceYear").value.trim(),

    areas,

    totalScore: result.total,
    maximumScore: result.maximum,
    average: Number(result.average.toFixed(2)),
    percentage: Number(result.percentage.toFixed(1)),
    overallRating: result.overall,

    strengths: $("#teacherStrengths").value.trim(),
    improvements: $("#teacherImprovements").value.trim(),
    recommendations: $("#teacherRecommendations").value.trim(),

    departmentComment: $("#departmentComment").value.trim(),
    departmentHeadName: $("#departmentHeadName").value.trim(),
    departmentHeadSignature: $("#departmentHeadSignature").value.trim(),
    departmentHeadDate: $("#departmentHeadDate").value,

    deputyComment: $("#deputyComment").value.trim(),
    deputyName: $("#deputyName").value.trim(),
    deputySignature: $("#deputySignature").value.trim(),
    deputyDate: $("#deputyDate").value,

    principalComment: $("#principalComment").value.trim(),
    principalName: $("#principalName").value.trim(),
    principalSignature: $("#principalSignature").value.trim(),
    principalDate: $("#principalDate").value,

    teacherComment: $("#teacherComment").value.trim(),
    teacherSignature: $("#teacherSignature").value.trim(),
    teacherSignatureDate: $("#teacherSignatureDate").value,

    evaluatorName: $("#evaluatorName").value.trim(),
    evaluatorPosition: $("#evaluatorPosition").value.trim()
  };
}

async function savePerformance() {
  if (performanceSaving) return;

  const message = $("#performanceMessage");
  const button = $("#savePerformanceButton");

  const evaluation = getPerformanceFormData();
  const result = calculatePerformance();

  if (!evaluation.teacherId) {
    message.textContent = "Please select a teacher.";
    return;
  }

  if (!evaluation.date) {
    message.textContent = "Please select evaluation date.";
    return;
  }

  if (result.completed !== performanceAreas.length) {
    message.textContent =
      "Please select a rating for every performance area.";
    return;
  }

  performanceSaving = true;
  button.disabled = true;
  button.textContent = editingPerformanceId ? "Updating..." : "Saving...";

  try {
    if (editingPerformanceId) {
      await updateRecord(
        "performance",
        editingPerformanceId,
        evaluation
      );

      message.textContent =
        "Performance evaluation updated successfully!";

      editingPerformanceId = null;

    } else {
      await addRecord("performance", evaluation);

      message.textContent =
        "Performance evaluation saved successfully!";
    }

    button.textContent = "Save Evaluation";

    const cancelButton = $("#cancelPerformanceEdit");
    if (cancelButton) cancelButton.style.display = "none";

    await loadPerformanceRecords();

  } catch (error) {
    console.error(error);
    message.textContent = "Error: " + error.message;

  } finally {
    performanceSaving = false;
    button.disabled = false;

    if (!editingPerformanceId) {
      button.textContent = "Save Evaluation";
    }
  }
}

async function loadPerformanceRecords() {
  const element = $("#performanceList");
  if (!element) return;

  element.textContent = "Loading evaluations...";

  try {
    const records = await getRecords("performance");

    if (!records.length) {
      element.innerHTML = "<p>No evaluations found.</p>";
      return;
    }

    records.sort((a, b) =>
      String(b.date || "").localeCompare(String(a.date || ""))
    );

    element.innerHTML = records.map(record => `
      <div class="panel">
        <h3>${escapeHTML(record.teacherName || "")}</h3>

        <p><strong>Teacher ID:</strong>
          ${escapeHTML(record.teacherCode || "")}
        </p>

        <p><strong>Date:</strong>
          ${escapeHTML(record.date || "")}
        </p>

        <p><strong>Department:</strong>
          ${escapeHTML(record.department || "")}
        </p>

        <h4>Performance Areas and Results</h4>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Performance Area</th>
              <th>Rating</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${(record.areas || []).map((area, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${escapeHTML(area.name)}</td>
                <td>${escapeHTML(area.rating)}</td>
                <td>${escapeHTML(area.score)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h4>Overall Performance Result</h4>

        <p>Total Score:
          ${escapeHTML(record.totalScore)} /
          ${escapeHTML(record.maximumScore)}
        </p>

        <p>Average: ${escapeHTML(record.average)}</p>
        <p>Percentage: ${escapeHTML(record.percentage)}%</p>

        <p><strong>Overall Rating:
          ${escapeHTML(record.overallRating)}
        </strong></p>

        <h4>Teacher's Strengths</h4>
        <p>${escapeHTML(record.strengths || "")}</p>

        <h4>Areas for Improvement</h4>
        <p>${escapeHTML(record.improvements || "")}</p>

        <h4>Recommendations</h4>
        <p>${escapeHTML(record.recommendations || "")}</p>

        <button onclick="editPerformance('${escapeHTML(record.id)}')">
          Edit / Update
        </button>

        <button onclick="printPerformance('${escapeHTML(record.id)}')">
          Print Evaluation
        </button>

        <button onclick="removeRecord('${escapeHTML(record.id)}','performance')">
          Delete
        </button>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
    element.textContent = "Unable to load evaluations.";
  }
}

async function editPerformance(id) {
  try {
    const records = await getRecords("performance");

    const record = records.find(
      item => String(item.id) === String(id)
    );

    if (!record) {
      alert("Evaluation not found.");
      return;
    }

    editingPerformanceId = id;

    await loadPerformanceTeachers();

    $("#performanceTeacher").value = record.teacherId || "";
    $("#performanceDepartment").value = record.department || "";
    $("#performanceDate").value = record.date || "";
    $("#performanceYear").value = record.academicYear || "";

    performanceAreas = (record.areas || []).map(area => area.name);

    renderPerformanceAreas();

    document.querySelectorAll(".performance-rating").forEach(
      (select, index) => {
        const savedArea = (record.areas || [])[index];
        if (savedArea) select.value = String(savedArea.score);
      }
    );

    updatePerformanceScore();

    const fields = {
      teacherStrengths: record.strengths,
      teacherImprovements: record.improvements,
      teacherRecommendations: record.recommendations,

      departmentComment: record.departmentComment,
      departmentHeadName: record.departmentHeadName,
      departmentHeadSignature: record.departmentHeadSignature,
      departmentHeadDate: record.departmentHeadDate,

      deputyComment: record.deputyComment,
      deputyName: record.deputyName,
      deputySignature: record.deputySignature,
      deputyDate: record.deputyDate,

      principalComment: record.principalComment,
      principalName: record.principalName,
      principalSignature: record.principalSignature,
      principalDate: record.principalDate,

      teacherComment: record.teacherComment,
      teacherSignature: record.teacherSignature,
      teacherSignatureDate: record.teacherSignatureDate,

      evaluatorName: record.evaluatorName,
      evaluatorPosition: record.evaluatorPosition
    };

    Object.entries(fields).forEach(([fieldId, value]) => {
      const field = document.getElementById(fieldId);
      if (field) field.value = value || "";
    });

    $("#savePerformanceButton").textContent = "Update Evaluation";
    $("#cancelPerformanceEdit").style.display = "inline-block";

    $("#performanceMessage").textContent =
      "Editing saved evaluation. Make changes and click Update Evaluation.";

    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (error) {
    console.error(error);
    alert("Unable to edit evaluation: " + error.message);
  }
}

function cancelPerformanceEdit() {
  editingPerformanceId = null;

  performanceAreas = [
    "Student Progress",
    "Syllabus Coverage",
    "Lesson Preparation",
    "Punctuality",
    "Classroom Performance",
    "Assessment"
  ];

  const activeButton = document.querySelector("nav button.active");
  showPage("performance", activeButton);
}



/* PRINT TEACHER PERFORMANCE EVALUATION */

async function printPerformance(id) {
  let frame;

  try {
    const records = await getRecords("performance");

    const record = records.find(
      item => String(item.id) === String(id)
    );

    if (!record) {
      alert("Evaluation not found.");
      return;
    }

    const areaRows = (record.areas || []).map((area, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHTML(area.name)}</td>
        <td>${escapeHTML(area.rating)}</td>
        <td>${escapeHTML(area.score)}</td>
      </tr>
    `).join("");

    const commentSection = (title, comment, name, signature, date) => `
      <div class="approval">
        <h3>${title}</h3>
        <p><strong>Comment:</strong></p>
        <p>${escapeHTML(comment || "")}</p>
        <p><strong>Name:</strong> ${escapeHTML(name || "")}</p>
        <p><strong>Signature:</strong> ${escapeHTML(signature || "")}</p>
        <p><strong>Date:</strong> ${escapeHTML(date || "")}</p>
      </div>
    `;

    const report = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport"
          content="width=device-width, initial-scale=1">

        <title>Teacher Performance Evaluation</title>

        <style>
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            font-family: Arial, sans-serif;
            color: #111;
            font-size: 12px;
            line-height: 1.5;
          }

          h1, h2 {
            text-align: center;
          }

          h1 { font-size: 20px; }
          h2 { font-size: 16px; }

          .subtitle {
            text-align: center;
            margin-bottom: 20px;
          }

          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 15px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
          }

          th, td {
            border: 1px solid #333;
            padding: 7px;
            text-align: left;
          }

          th { background: #eee; }

          .summary, .approval {
            border: 1px solid #333;
            padding: 10px;
            margin: 12px 0;
          }

          .approval {
            min-height: 100px;
            page-break-inside: avoid;
          }

          .approval h3 {
            text-align: left;
            margin-top: 0;
          }

          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
          }
        </style>
      </head>

      <body>
        <h1>TEACHER PERFORMANCE EVALUATION</h1>
        <div class="subtitle">School Management System</div>

        <div class="info">
          <div><strong>Teacher:</strong> ${escapeHTML(record.teacherName || "")}</div>
          <div><strong>Teacher ID:</strong> ${escapeHTML(record.teacherCode || "")}</div>
          <div><strong>Department:</strong> ${escapeHTML(record.department || "")}</div>
          <div><strong>Evaluation Date:</strong> ${escapeHTML(record.date || "")}</div>
          <div><strong>Academic Year:</strong> ${escapeHTML(record.academicYear || "")}</div>
          <div><strong>Evaluator:</strong> ${escapeHTML(record.evaluatorName || "")}</div>
          <div><strong>Evaluator Position:</strong> ${escapeHTML(record.evaluatorPosition || "")}</div>
        </div>

        <h2>PERFORMANCE EVALUATION CRITERIA</h2>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Performance Area</th>
              <th>Rating</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>${areaRows}</tbody>
        </table>

        <div class="summary">
          <h3>OVERALL PERFORMANCE RESULT</h3>
          <p>Total Score: ${escapeHTML(record.totalScore)} / ${escapeHTML(record.maximumScore)}</p>
          <p>Average: ${escapeHTML(record.average)}</p>
          <p>Percentage: ${escapeHTML(record.percentage)}%</p>
          <p><strong>Overall Rating: ${escapeHTML(record.overallRating)}</strong></p>
        </div>

        <h3>TEACHER'S STRENGTHS</h3>
        <p>${escapeHTML(record.strengths || "")}</p>

        <h3>AREAS FOR IMPROVEMENT</h3>
        <p>${escapeHTML(record.improvements || "")}</p>

        <h3>RECOMMENDATIONS</h3>
        <p>${escapeHTML(record.recommendations || "")}</p>

        ${commentSection(
          "DEPARTMENT HEAD'S COMMENT AND SIGNATURE",
          record.departmentComment,
          record.departmentHeadName,
          record.departmentHeadSignature,
          record.departmentHeadDate
        )}

        ${commentSection(
          "DEPUTY PRINCIPAL'S COMMENT AND SIGNATURE",
          record.deputyComment,
          record.deputyName,
          record.deputySignature,
          record.deputyDate
        )}

        ${commentSection(
          "PRINCIPAL'S COMMENT AND SIGNATURE",
          record.principalComment,
          record.principalName,
          record.principalSignature,
          record.principalDate
        )}

        ${commentSection(
          "TEACHER'S ACKNOWLEDGEMENT AND SIGNATURE",
          record.teacherComment,
          record.teacherName,
          record.teacherSignature,
          record.teacherSignatureDate
        )}

        <div class="approval">
          <h3>EVALUATOR</h3>
          <p>Name: ${escapeHTML(record.evaluatorName || "")}</p>
          <p>Position: ${escapeHTML(record.evaluatorPosition || "")}</p>
        </div>

        <div class="footer">
          Teacher Performance Evaluation Report
        </div>
      </body>
      </html>
    `;

    frame = document.createElement("iframe");

    frame.style.position = "fixed";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.left = "0";
    frame.style.bottom = "0";
    frame.style.border = "0";

    document.body.appendChild(frame);

    const printDocument =
      frame.contentWindow.document;

    printDocument.open();
    printDocument.write(report);
    printDocument.close();

    frame.onload = () => {
      setTimeout(() => {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        } catch (error) {
          console.error(error);
          alert("Unable to open print dialog: " + error.message);
        }
      }, 700);
    };

  } catch (error) {
    console.error(error);

    if (frame && frame.parentNode) {
      frame.parentNode.removeChild(frame);
    }

    alert("Unable to print evaluation: " + error.message);
  }
}








    
            

          
          

        
    











/* ATTENDANCE */

async function loadAttendanceNames() {
  const type = $("#attendanceType")?.value;
  const select = $("#attendancePerson");

  if (!type || !select) return;

  select.innerHTML = `<option value="">Loading...</option>`;

  try {
    const people = await getRecords(type);

    if (!people.length) {
      select.innerHTML =
        `<option value="">No names found. Register first.</option>`;
      return;
    }

    select.innerHTML = `
      <option value="">Select a name</option>
      ${people.map(person => `
        <option value="${escapeHTML(person.id)}"
          data-name="${escapeHTML(person.name)}"
          data-code="${escapeHTML(person.code || "")}">
          ${escapeHTML(person.name)}
          ${person.code ? " — " + escapeHTML(person.code) : ""}
        </option>
      `).join("")}
    `;

  } catch (error) {
    console.error(error);
    select.innerHTML = `<option value="">Could not load names.</option>`;
  }
}

async function saveAttendance() {
  if (attendanceSaving) return;

  const type = $("#attendanceType").value;
  const personSelect = $("#attendancePerson");
  const selectedOption = personSelect.options[personSelect.selectedIndex];

  const personId = personSelect.value;
  const personName = selectedOption?.dataset.name || "";
  const personCode = selectedOption?.dataset.code || "";
  const date = $("#attendanceDate").value;
  const status = $("#attendanceStatus").value;

  const message = $("#attendanceMessage");
  const button = $("#saveAttendanceButton");

  if (!personId) {
    message.textContent = "Please select a student or teacher.";
    return;
  }

  if (!date) {
    message.textContent = "Please select a date.";
    return;
  }

  attendanceSaving = true;
  button.disabled = true;
  button.textContent = "Saving...";

  try {
    await addRecord("attendance", {
      personId,
      name: personName,
      code: personCode,
      personType: type,
      date,
      status
    });

    message.textContent = "Attendance saved successfully!";
    await loadAttendanceRecords();

  } catch (error) {
    console.error(error);
    message.textContent = "Error: " + error.message;

  } finally {
    attendanceSaving = false;
    button.disabled = false;
    button.textContent = "Save Attendance";
  }
}

async function loadAttendanceRecords() {
  const element = $("#attendanceList");
  if (!element) return;

  element.textContent = "Loading attendance...";

  try {
    const records = await getRecords("attendance");

    if (!records.length) {
      element.innerHTML = "<p>No attendance records found.</p>";
      return;
    }

    records.sort((a, b) =>
      String(b.date || "").localeCompare(String(a.date || ""))
    );

    element.innerHTML = `
      <h3>Attendance Records</h3>
      ${records.map(record => `
        <div class="panel">
          <strong>${escapeHTML(record.name)}</strong>
          <p>
            ${escapeHTML(record.personType === "teachers" ? "Teacher" : "Student")}
            ${record.code ? " — " + escapeHTML(record.code) : ""}
          </p>
          <p>Date: ${escapeHTML(record.date)}</p>
          <p>Status: ${escapeHTML(record.status)}</p>
          <button onclick="removeRecord('${escapeHTML(record.id)}','attendance')">
            Delete
          </button>
        </div>
      `).join("")}
    `;

  } catch (error) {
    console.error(error);
    element.textContent = "Unable to load attendance records.";
  }
}

/* DELETE RECORDS */

async function removeRecord(id, collectionName) {
  const confirmed = confirm(
    "Are you sure you want to delete this record?"
  );

  if (!confirmed) return;

  try {
    await deleteRecord(collectionName, id);

    if (collectionName === "students") await loadStudents();
    if (collectionName === "teachers") await loadTeachers();
    if (collectionName === "classes") await loadClasses();
    if (collectionName === "attendance") await loadAttendanceRecords();
    if (collectionName === "performance") await loadPerformanceRecords();

    await loadDashboard();

  } catch (error) {
    console.error(error);
    alert("Unable to delete record: " + error.message);
  }
}

/* GLOBAL FUNCTIONS */

window.showPage = showPage;
window.addStudent = addStudent;
window.addTeacher = addTeacher;
window.addClass = addClass;
window.removeRecord = removeRecord;

window.loadAttendanceNames = loadAttendanceNames;
window.saveAttendance = saveAttendance;

window.addPerformanceArea = addPerformanceArea;
window.savePerformance = savePerformance;
window.editPerformance = editPerformance;
window.cancelPerformanceEdit = cancelPerformanceEdit;
window.printPerformance = printPerformance;
window.updatePerformanceScore = updatePerformanceScore;

/* AUTHENTICATION */

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  currentUser = user;

  const firstButton = document.querySelector("nav button");
  showPage("dashboard", firstButton);
});
