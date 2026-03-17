import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult, DIMENSION_LABELS } from "./types";

export function generatePDF(url: string, analysis: AnalysisResult): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(24);
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text("fishr", 20, 25);

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Competitive Angle Analysis Report", 20, 33);

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

  // Consumer Insight
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Consumer Insight", 20, 85);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const insightLines = doc.splitTextToSize(
    analysis.consumer_insight.overall_summary,
    pageWidth - 40
  );
  doc.text(insightLines, 20, 93);

  const insightItems = [
    ["Lifts Over Hurdle", analysis.consumer_insight.lifts_over_hurdle],
    ["Unique or Different", analysis.consumer_insight.unique_or_different],
    ["Personal Connection", analysis.consumer_insight.personal_connection],
  ] as const;

  const insightRows = insightItems.map(([label, data]) => [
    label,
    `${data.score}/10`,
    data.summary,
  ]);

  autoTable(doc, {
    startY: 93 + insightLines.length * 5 + 3,
    head: [["Criteria", "Score", "Assessment"]],
    body: insightRows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [99, 102, 241] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: "auto" },
    },
  });

  let yPos = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY ?? 140;

  // Dimension scores table
  yPos += 10;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("5 Ways to Sharpen", 20, yPos);

  const dimensionRows = Object.entries(analysis.dimensions).map(
    ([name, dim]) => [
      DIMENSION_LABELS[name] || name,
      `${dim.score}/10`,
      dim.summary,
    ]
  );

  autoTable(doc, {
    startY: yPos + 5,
    head: [["Dimension", "Score", "Summary"]],
    body: dimensionRows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [99, 102, 241] },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: "auto" },
    },
  });

  // Detailed breakdowns
  yPos = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY ?? 200;

  Object.entries(analysis.dimensions).forEach(([name, dim]) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `${DIMENSION_LABELS[name] || name} (${dim.score}/10)`,
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
  doc.text("Top Actions to Sharpen Your Angle", 20, yPos);
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
