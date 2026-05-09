import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function GET(_: Request, { params }: { params: { paymentId: string } }) {
  const [payment, settings] = await Promise.all([
    prisma.payment.findUnique({ where: { id: params.paymentId }, include: { student: true, standard: true } }),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);
  if (!payment) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const institution = settings?.className ?? "MSL";
  const contactLine = [settings?.contactNumber, settings?.email].filter(Boolean).join(" · ");
  const formattedAmount = `${settings?.currency === "INR" || !settings?.currency ? "Rs." : settings.currency} ${payment.amountReceived.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  doc.rect(0, 0, 595.28, 116).fill("#064e3b");
  doc.fillColor("white").font("Helvetica-Bold").fontSize(24).text(institution, 50, 34);
  doc.font("Helvetica").fontSize(10);
  if (settings?.address) doc.text(settings.address, 50, 64, { width: 320 });
  if (contactLine) doc.text(contactLine, 50, 80, { width: 320 });
  doc.font("Helvetica-Bold").fontSize(16).text("Fee Receipt", 395, 38, { width: 150, align: "right" });
  doc.font("Helvetica").fontSize(10).text(payment.invoiceNumber, 395, 62, { width: 150, align: "right" });

  doc.fillColor("#111827").font("Helvetica");
  doc.roundedRect(50, 145, 495, 92, 12).stroke("#d1d5db");
  doc.fontSize(9).fillColor("#6b7280").text("Receipt Date", 72, 166);
  doc.fillColor("#111827").fontSize(11).text(formatDate(payment.paymentDate), 72, 184);
  doc.fontSize(9).fillColor("#6b7280").text("Payment Type", 245, 166);
  doc.fillColor("#111827").fontSize(11).text(payment.feeType, 245, 184);
  doc.fontSize(9).fillColor("#6b7280").text("Payment Mode", 405, 166);
  doc.fillColor("#111827").fontSize(11).text(payment.paymentMode, 405, 184);

  doc.font("Helvetica-Bold").fontSize(13).fillColor("#064e3b").text("Student Details", 50, 270);
  doc.moveTo(50, 292).lineTo(545, 292).stroke("#d1d5db");
  doc.font("Helvetica").fontSize(11).fillColor("#111827");
  doc.text(`Name: ${payment.student.fullName}`, 50, 312);
  doc.text(`Standard: ${payment.standard.name}`, 50, 334);
  doc.text(`Contact: ${payment.student.contactNumber}`, 320, 312);

  doc.font("Helvetica-Bold").fontSize(13).fillColor("#064e3b").text("Fee Details", 50, 405);
  doc.moveTo(50, 427).lineTo(545, 427).stroke("#d1d5db");
  doc.font("Helvetica").fontSize(11).fillColor("#111827");
  doc.text(`Payment Type: ${payment.feeType}`, 50, 447);
  doc.text(`Fee Period: ${payment.feePeriod}`, 50, 469);
  doc.text(`Received By: ${payment.receivedBy}`, 50, 491);

  doc.roundedRect(340, 440, 205, 82, 12).fillAndStroke("#ecfdf5", "#a7f3d0");
  doc.fillColor("#047857").font("Helvetica").fontSize(10).text("Amount Paid", 362, 462);
  doc.fillColor("#064e3b").font("Helvetica-Bold").fontSize(22).text(formattedAmount, 362, 482, { width: 160 });

  if (payment.notes) {
    doc.fillColor("#374151").font("Helvetica").fontSize(10).text(`Notes: ${payment.notes}`, 50, 550, { width: 495 });
  }

  doc.moveTo(50, 760).lineTo(545, 760).stroke("#e5e7eb");
  doc.fillColor("#6b7280").fontSize(9).text("Thank you. This receipt confirms payment received for the stated fee period.", 50, 774, { align: "center", width: 495 });
  doc.end();

  const pdf = await done;
  const body = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${payment.invoiceNumber}.pdf"`,
    },
  });
}
