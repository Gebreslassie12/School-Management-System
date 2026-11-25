
async function printPerformance(id) {
  // Open the print window immediately to avoid popup blocking
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow pop-ups for this website, then try again.");
    return;
  }

  try {
    printWindow.document.write(`
      <html>
      <head>
        <title>Loading Evaluation...</title>
      </head>
      <body>
        <p style="font-family:Arial;text-align:center;margin-top:50px;">
          Preparing evaluation report...
        </p>
      </body>
      </html>
    `);

    const records = await getRecords("performance");

    const record = records.find(
      item => String(item.id) === String(id)
    );

    if (!record) {
      printWindow.close();
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
        <meta name="viewport" content="width=device-width, initial-scale=1">
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

          th {
            background: #eee;
          }

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

          @media print {
            button { display: none; }
          }
        </style>
      </head>

      <body>
        <h1>TEACHER PERFORMANCE EVALUATION</h1>
        <div class="subtitle">School Management System</div>

        <div class="info">
          <div><strong>Teacher:</strong> ${escapeHTML(record.teacherName)}</div>
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

    printWindow.document.open();
    printWindow.document.write(report);
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

  } catch (error) {
    console.error(error);
    printWindow.close();
    alert("Unable to print evaluation: " + error.message);
  }
}
