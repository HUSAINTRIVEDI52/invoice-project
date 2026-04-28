import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { activeFilterLabel, buildPaymentWhere, searchParamsFromUrl } from "@/lib/reportFilters";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const filters = searchParamsFromUrl(request.url);
  const [payments, settings, standard] = await Promise.all([
    prisma.payment.findMany({ where: buildPaymentWhere(filters), include: { student: true, standard: true }, orderBy: { paymentDate: "desc" } }),
    prisma.settings.findUnique({ where: { id: "default" } }),
    filters.standardId ? prisma.standard.findUnique({ where: { id: filters.standardId } }) : null,
  ]);
  const filterLabel = activeFilterLabel({ ...filters, standardName: standard?.name });

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ margin: 36, size: "A4", layout: "landscape" });
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const total = payments.reduce((sum, payment) => sum + payment.amountReceived, 0);
  doc.fontSize(20).text(`${settings?.className ?? "Silver Education"} Collection Report`);
  doc.moveDown(0.4).fontSize(10).fillColor("gray").text(`Filters: ${filterLabel}`);
  doc.text(`Generated: ${formatDate(new Date())}`);
  doc.moveDown().fillColor("black").fontSize(14).text(`Total Collection: ${formatCurrency(total, settings?.currency)}   Payments: ${payments.length}`);
  doc.moveDown();

  const columns = [36, 105, 185, 305, 405, 500, 590, 675];
  doc.fontSize(9).font("Helvetica-Bold");
  doc.text("Date", columns[0], doc.y);
  doc.text("Invoice", columns[1], doc.y);
  doc.text("Student", columns[2], doc.y);
  doc.text("Standard", columns[3], doc.y);
  doc.text("Period", columns[4], doc.y);
  doc.text("Mode", columns[5], doc.y);
  doc.text("Amount", columns[6], doc.y);
  doc.text("Balance", columns[7], doc.y);
  doc.moveDown(0.8).font("Helvetica");

  for (const payment of payments) {
    if (doc.y > 540) {
      doc.addPage();
      doc.fontSize(9);
    }
    const y = doc.y;
    doc.text(formatDate(payment.paymentDate), columns[0], y, { width: 65 });
    doc.text(payment.invoiceNumber, columns[1], y, { width: 75 });
    doc.text(payment.student.fullName, columns[2], y, { width: 110 });
    doc.text(payment.standard.name, columns[3], y, { width: 90 });
    doc.text(payment.feePeriod, columns[4], y, { width: 85 });
    doc.text(payment.paymentMode, columns[5], y, { width: 80 });
    doc.text(formatCurrency(payment.amountReceived, settings?.currency), columns[6], y, { width: 80 });
    doc.text(formatCurrency(Math.max(payment.expectedAmount - payment.amountReceived, 0), settings?.currency), columns[7], y, { width: 80 });
    doc.moveDown(1.1);
  }

  if (payments.length === 0) {
    doc.text("No payments match these filters.");
  }

  doc.end();
  const pdf = await done;
  const body = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${settings?.invoicePrefix ?? "SE"}-collection-report.pdf"`,
    },
  });
}
