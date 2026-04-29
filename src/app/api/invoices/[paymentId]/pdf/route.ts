import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

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

  doc.fontSize(24).text(settings?.className ?? "Silver Education", { align: "center" });
  doc.moveDown(0.3).fontSize(10).fillColor("gray").text(settings?.address ?? "", { align: "center" });
  doc.text(`${settings?.contactNumber ?? ""} ${settings?.email ? `· ${settings.email}` : ""}`, { align: "center" });
  doc.moveDown(2).fillColor("black").fontSize(18).text("Fee Receipt / Invoice");
  doc.moveDown();
  doc.fontSize(11);
  doc.text(`Invoice Number: ${payment.invoiceNumber}`);
  doc.text(`Invoice Date: ${formatDate(payment.paymentDate)}`);
  doc.text(`Payment Code: ${payment.paymentCode}`);
  doc.moveDown();
  doc.text(`Student: ${payment.student.fullName}`);
  doc.text(`Student ID: ${payment.student.studentCode}`);
  doc.text(`Standard: ${payment.standard.name}`);
  doc.text(`Guardian: ${payment.student.guardianName}`);
  doc.text(`Contact: ${payment.student.contactNumber}`);
  doc.moveDown();
  doc.text(`Fee Type: ${payment.feeType}`);
  doc.text(`Fee Period: ${payment.feePeriod}`);
  doc.text(`Payment Mode: ${payment.paymentMode}`);
  doc.text(`Received By: ${payment.receivedBy}`);
  doc.moveDown();
  doc.roundedRect(50, doc.y, 495, 70, 8).stroke("#d1d5db");
  const y = doc.y + 16;
  doc.fontSize(12).text("Expected Amount", 70, y);
  doc.text("Amount Received", 230, y);
  doc.text("Balance", 400, y);
  doc.fontSize(14).font("Helvetica-Bold");
  doc.text(formatCurrency(payment.expectedAmount, settings?.currency), 70, y + 25);
  doc.text(formatCurrency(payment.amountReceived, settings?.currency), 230, y + 25);
  doc.text(formatCurrency(Math.max(payment.expectedAmount - payment.amountReceived, 0), settings?.currency), 400, y + 25);
  doc.font("Helvetica").moveDown(5);
  if (payment.notes) doc.fontSize(10).text(`Notes: ${payment.notes}`);
  doc.moveDown(3).fontSize(10).fillColor("gray").text("This invoice was generated dynamically by Silver Education Invoice System.", { align: "center" });
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
