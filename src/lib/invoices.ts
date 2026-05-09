import { prisma } from "./db";

export function buildSequenceCode(prefix: string, year: number, sequence: number) {
  return `${prefix}-${year}-${String(sequence).padStart(4, "0")}`;
}

export async function nextInvoiceNumber(prefix = "MSL", date = new Date()) {
  const year = date.getFullYear();
  const count = await prisma.payment.count({
    where: {
      invoiceNumber: {
        startsWith: `${prefix}-${year}-`,
      },
    },
  });
  return buildSequenceCode(prefix, year, count + 1);
}

export async function nextPaymentCode(date = new Date()) {
  const year = date.getFullYear();
  const count = await prisma.payment.count({
    where: {
      paymentCode: {
        startsWith: `PAY-${year}-`,
      },
    },
  });
  return buildSequenceCode("PAY", year, count + 1);
}
