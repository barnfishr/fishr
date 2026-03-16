import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult } from "./types";

export function generatePDF(url: string, analysis: AnalysisResult): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(24);
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text("fishr", 20, 25);

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Homepage Copy Analysis Report", 20, 33);

  // URL and date
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`URL: ${url}`, 20, 45);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 52);

  // Overall Score
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Overall Score", 20, 68);

  const scoreColor = getScoreColorRGB(analysis.overall_score);
  doc.setFontSize(36);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${analysis.overall_score}`, pageWidth / 2, 68, {
    align: "center",
  });
  doc.setFontSize(14);
  doc.text("/100", pageWidth / 2 + 25, 68);

  // Dimension scores table
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Dimension Scores", 20, 85);

  const dimensionRows = Object.entries(analysis.dimensions).map(
    ([name, dim]) => [
      name.charAt(0).toUpperCase() + name.slice(1),
      `${dim.score}/10`,
      dim.summary,
    ]
  );

  autoTable(doc, {
    startY: 90,
    head: [["Dimension", "Score", "Summary"]],
    body: dimensionRows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [99, 102, 241] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: "auto" },
    },
  });

  // Detailed breakdowns
  let yPos = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY ?? 150;

  Object.entries(analysis.dimensions).forEach(([name, dim]) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `${name.charAt(0).toUpperCase() + name.slice(1)} (${dim.score}/10)`,
      20,
      yPos
    );
    yPos += 8;

    if (dim.issues.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38);
      doc.text("Issues:", 20, yPos);
      yPos += 5;

      doc.setTextColor(60, 60, 60);
      dim.issues.forEach((issue) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(`• ${issue}`, pageWidth - 50);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 2;
      });
    }

    if (dim.recommendations.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(22, 163, 74);
      doc.text("Recommendations:", 20, yPos);
      yPos += 5;

      doc.setTextColor(60, 60, 60);
      dim.recommendations.forEach((rec) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - 50);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 2;
      });
    }
  });

  // Top Actions
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 10;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Top Actions", 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  analysis.top_actions.forEach((action, i) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const lines = doc.splitTextToSize(`${i + 1}. ${action}`, pageWidth - 50);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 5 + 3;
  });

  return doc;
}

function getScoreColorRGB(score: number): [number, number, number] {
  if (score >= 70) return [22, 163, 74];
  if (score >= 50) return [202, 138, 4];
  if (score >= 30) return [234, 88, 12];
  return [220, 38, 38];
}
