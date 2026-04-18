import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ABLLS_DOMAINS } from '../data/ablls';
import { computeDomainScore, getTopStrengths, getTopWeaknesses, getPriorityDomains } from './scoring';

export const triggerPdfExport = (student, smartGoals) => {
  const doc = new jsPDF();
  
  // PAGE 1
  doc.setFontSize(22);
  doc.text("ABLLS-R Assessment & Intervention Plan", 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 45);
  
  doc.setFontSize(16);
  doc.text("Student Details", 20, 60);
  
  doc.setFontSize(12);
  doc.text(`Name: ${student.name}`, 20, 70);
  doc.text(`Age: ${student.ageYears} years, ${student.ageMonths} months`, 20, 80);
  doc.text(`Diagnoses: ${(student.diagnoses || []).join(', ')}`, 20, 90);
  doc.text(`Assessor: ${student.assessor}`, 20, 100);
  doc.text(`Assessment Date: ${student.assessmentDate}`, 20, 110);
  
  if (student.notes) {
    doc.text("Notes:", 20, 125);
    const splitNotes = doc.splitTextToSize(student.notes, 170);
    doc.text(splitNotes, 20, 135);
  }

  // PAGE 2 - Domain Scores
  doc.addPage();
  doc.setFontSize(16);
  doc.text("Domain Scores", 20, 20);
  
  const tableData = [];
  ABLLS_DOMAINS.forEach(domain => {
     let score = 0;
     let level = "Not Assessed";
     if(student.domains && student.domains[domain.id]) {
         score = computeDomainScore(student.domains[domain.id]);
         if (score >= 70) level = "Mastered";
         else if (score >= 40) level = "Emerging";
         else level = "Requires Support";
     }
     tableData.push([domain.id, domain.name, `${score}%`, level]);
  });
  
  autoTable(doc, {
    startY: 30,
    head: [['Domain', 'Name', 'Score %', 'Level']],
    body: tableData,
    didParseCell: function(data) {
       // color code
       if (data.column.index === 3 && data.cell.section === 'body') {
           const level = data.cell.raw;
           if (level === "Mastered") data.cell.styles.textColor = '#1D9E75';
           if (level === "Emerging") data.cell.styles.textColor = '#EF9F27';
           if (level === "Requires Support") data.cell.styles.textColor = '#E24B4A';
       }
    }
  });

  // PAGE 3 - Strengths & Weaknesses
  doc.addPage();
  doc.setFontSize(16);
  doc.text("Strengths & Weaknesses", 20, 20);
  
  doc.setFontSize(14);
  doc.text("Top Strengths", 20, 35);
  const strengths = getTopStrengths(student, ABLLS_DOMAINS, 3);
  strengths.forEach((s, idx) => {
     doc.setFontSize(12);
     doc.text(`• ${s.name} (${s.score}%)`, 25, 45 + (idx * 10));
  });

  doc.setFontSize(14);
  doc.text("Top Weaknesses", 20, 85);
  const weaknesses = getTopWeaknesses(student, ABLLS_DOMAINS, 3);
  weaknesses.forEach((w, idx) => {
     doc.setFontSize(12);
     doc.text(`• ${w.name} (${w.score}%)`, 25, 95 + (idx * 10));
  });
  
  doc.setFontSize(14);
  doc.text("Priority Domains", 20, 135);
  const priorities = getPriorityDomains(student, ABLLS_DOMAINS);
  priorities.forEach((p, idx) => {
     doc.setFontSize(12);
     doc.text(`• ${p.name} (${p.score}%)`, 25, 145 + (idx * 10));
  });
  
  // PAGE 4 - SMART GOALS
  doc.addPage();
  doc.setFontSize(16);
  doc.text("Intervention Plan - SMART Goals", 20, 20);
  
  let yPos = 35;
  if (smartGoals && smartGoals.length > 0) {
      smartGoals.forEach((goal, idx) => {
         if (yPos > 240) {
             doc.addPage();
             yPos = 20;
         }
         doc.setFontSize(12);
         doc.setFont("helvetica", "bold");
         doc.text(`Goal ${idx + 1}: ${goal.serviceType}`, 20, yPos);
         yPos += 8;
         
         doc.setFont("helvetica", "normal");
         const smartGoalText = doc.splitTextToSize(`SMART Goal: ${goal.smartGoal}`, 170);
         doc.text(smartGoalText, 20, yPos);
         yPos += (smartGoalText.length * 5) + 5;
         
         doc.text(`Strategy: ${goal.strategy}`, 20, yPos);
         yPos += 8;
         doc.text(`Activity: ${goal.activity}`, 20, yPos);
         yPos += 8;
         
         const benefitText = doc.splitTextToSize(`Benefit: ${goal.benefitStatement}`, 170);
         doc.text(benefitText, 20, yPos);
         yPos += (benefitText.length * 5) + 12;
      });
  } else {
      doc.setFontSize(12);
      doc.text("No SMART goals active.", 20, yPos);
  }
  
  // Combined Impact
  if (smartGoals && smartGoals.length > 0) {
    if (yPos > 220) {
        doc.addPage();
        yPos = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Combined Impact Overview", 20, yPos);
    yPos += 10;
    doc.setFont("helvetica", "normal");
    const impactText = doc.splitTextToSize(`By addressing these targeted goals collectively, ${student.name} will build foundational skills across communication, social interaction, and daily living. The multi-disciplinary strategies (ABA, Speech, OT) ensure consistent skill acquisition and generalisation, ultimately fostering greater independence and reducing barriers to learning across home and classroom environments.`, 170);
    doc.text(impactText, 20, yPos);
  }

  const safeName = student.name ? student.name.replace(/\s+/g, '_') : 'Student';
  doc.save(`ABLLS_Report_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportInterventionPlanPdf = (student, smartGoals = [], authorName = 'Therapist / Teacher') => {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = 64;
  const studentName = student?.name && student.name !== 'Current Student'
    ? student.name
    : student?.studentName || 'Student';

  const ensureRoom = (requiredHeight) => {
    if (y + requiredHeight <= pageHeight - margin) return;
    doc.addPage();
    y = 64;
  };

  const drawInfoRow = (label, value, options = {}) => {
    const prefix = label ? `${label}: ` : '';
    const content = `${prefix}${value || '-'}`;
    const lines = doc.splitTextToSize(content, pageWidth - margin * 2 - 32);
    const lineHeight = (options.size || 11) + 4;
    const boxHeight = Math.max(42, 20 + (lines.length * lineHeight));
    ensureRoom(boxHeight + 10);
    doc.setFillColor(...(options.fillColor || [245, 241, 250]));
    doc.roundedRect(margin, y - 14, pageWidth - margin * 2, boxHeight, 14, 14, 'F');
    doc.setTextColor(41, 37, 52);
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(options.size || 11);
    doc.text(lines, margin + 16, y + 6);
    y += boxHeight + 10;
  };

  const drawPlanCard = (goal, index) => {
    const palette = index % 3 === 0
      ? { fill: [232, 241, 250], badge: [52, 118, 176] }
      : index % 3 === 1
        ? { fill: [244, 236, 250], badge: [126, 87, 194] }
        : { fill: [236, 247, 240], badge: [46, 125, 50] };

    const availableWidth = pageWidth - margin * 2 - 32;
    const serviceLine = goal.serviceType || 'Intervention';
    const sections = [
      { label: 'SMART Goal', value: goal.smartGoal || '-' },
      { label: 'Strategy', value: goal.strategy || '-' },
      { label: 'Activity', value: goal.activity || '-' },
      { label: 'Benefit', value: goal.benefitStatement || '-' },
    ].map((section) => {
      const lines = doc.splitTextToSize(`${section.label}: ${section.value}`, availableWidth);
      return { ...section, lines };
    });

    const contentHeight = sections.reduce((total, section) => total + 18 + (section.lines.length * 13), 20);
    const cardHeight = 40 + contentHeight;
    ensureRoom(cardHeight + 14);

    doc.setFillColor(...palette.fill);
    doc.roundedRect(margin, y, pageWidth - margin * 2, cardHeight, 16, 16, 'F');
    doc.setFillColor(...palette.badge);
    doc.roundedRect(margin + 16, y + 14, 64, 24, 12, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Plan ${index + 1}`, margin + 48, y + 30, { align: 'center' });
    doc.text(serviceLine, pageWidth - margin - 16, y + 30, { align: 'right' });

    let sectionY = y + 58;
    doc.setTextColor(41, 37, 52);
    sections.forEach((section) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${section.label}:`, margin + 16, sectionY);
      sectionY += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(section.lines, margin + 16, sectionY);
      sectionY += (section.lines.length * 13) + 10;
    });

    y += cardHeight + 14;
  };

  doc.setFillColor(101, 87, 137);
  doc.roundedRect(margin, y - 24, pageWidth - margin * 2, 92, 18, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Cognify Care Intervention Plan', margin + 20, y + 8);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleString()}`, margin + 20, y + 32);
  y += 96;

  doc.setTextColor(41, 37, 52);
  drawInfoRow('Therapist / Teacher', authorName, { bold: true, fillColor: [245, 241, 250] });
  drawInfoRow('Student Name', studentName, { fillColor: [236, 244, 252] });
  drawInfoRow('Plan Heading', 'Intervention Plan', { fillColor: [242, 247, 239] });
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Intervention Plan', margin, y);
  y += 18;

  if (!smartGoals.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('No intervention goals were generated.', margin, y);
  } else {
    smartGoals.forEach((goal, index) => {
      drawPlanCard(goal, index);
    });
  }

  const safeName = studentName.replace(/\s+/g, '_');
  doc.save(`${safeName}_intervention_plan.pdf`);
};
