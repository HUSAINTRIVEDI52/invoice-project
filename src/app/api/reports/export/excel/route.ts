import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { activeFilterLabel, buildPaymentWhere, searchParamsFromUrl } from "@/lib/reportFilters";

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const filters = searchParamsFromUrl(request.url);
  const [payments, settings, standard] = await Promise.all([
    prisma.payment.findMany({ where: buildPaymentWhere(filters), include: { student: true, standard: true }, orderBy: { paymentDate: "desc" } }),
    prisma.settings.findUnique({ where: { id: "default" } }),
    filters.standardId ? prisma.standard.findUnique({ where: { id: filters.standardId } }) : null,
  ]);
  const filterLabel = activeFilterLabel({ ...filters, standardName: standard?.name });

  const total = payments.reduce((sum, payment) => sum + payment.amountReceived, 0);
  const rows = [
    ["Silver Education Collection Report"],
    [`Filters: ${filterLabel}`],
    [`Total Collection: ${total}`],
    [],
    ["Date", "Invoice", "Payment Code", "Student Code", "Student Name", "Standard", "Fee Type", "Fee Period", "Payment Mode", "Expected Amount", "Amount Received", "Balance", "Received By", "Notes"],
    ...payments.map((payment) => [
      formatDate(payment.paymentDate),
      payment.invoiceNumber,
      payment.paymentCode,
      payment.student.studentCode,
      payment.student.fullName,
      payment.standard.name,
      payment.feeType,
      payment.feePeriod,
      payment.paymentMode,
      payment.expectedAmount,
      payment.amountReceived,
      Math.max(payment.expectedAmount - payment.amountReceived, 0),
      payment.receivedBy,
      payment.notes ?? "",
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${settings?.invoicePrefix ?? "SE"}-collection-report.csv"`,
    },
  });
}
