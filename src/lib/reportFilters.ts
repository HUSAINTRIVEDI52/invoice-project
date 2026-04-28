import { Prisma } from "@prisma/client";
import { formatDate } from "./format";

export const paymentModes = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Other"];

export type ReportsSearchParams = {
  standardId?: string;
  standardName?: string;
  mode?: string;
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function buildDateFilter(searchParams: ReportsSearchParams) {
  if (searchParams.date) {
    const date = new Date(searchParams.date);
    return { gte: startOfDay(date), lte: endOfDay(date) };
  }

  if (searchParams.month) {
    const [year, month] = searchParams.month.split("-").map(Number);
    return { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) };
  }

  if (searchParams.year) {
    const year = Number(searchParams.year);
    return { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) };
  }

  if (searchParams.from || searchParams.to) {
    return {
      gte: searchParams.from ? startOfDay(new Date(searchParams.from)) : undefined,
      lte: searchParams.to ? endOfDay(new Date(searchParams.to)) : undefined,
    };
  }

  return undefined;
}

export function buildPaymentWhere(searchParams: ReportsSearchParams): Prisma.PaymentWhereInput {
  return {
    standardId: searchParams.standardId || undefined,
    paymentMode: searchParams.mode || undefined,
    paymentDate: buildDateFilter(searchParams),
  };
}

export function activeFilterLabel(searchParams: ReportsSearchParams) {
  const parts = [];
  if (searchParams.standardName) parts.push(searchParams.standardName);
  if (searchParams.mode) parts.push(searchParams.mode);
  if (searchParams.date) parts.push(`on ${formatDate(searchParams.date)}`);
  if (searchParams.month) parts.push(`in ${searchParams.month}`);
  if (searchParams.year) parts.push(`in ${searchParams.year}`);
  if (searchParams.from || searchParams.to) parts.push(`from ${searchParams.from || "start"} to ${searchParams.to || "today"}`);
  return parts.length ? parts.join(" · ") : "All collections";
}

export function searchParamsFromUrl(url: string): ReportsSearchParams {
  const params = new URL(url).searchParams;
  return {
    standardId: params.get("standardId") || undefined,
    mode: params.get("mode") || undefined,
    date: params.get("date") || undefined,
    month: params.get("month") || undefined,
    year: params.get("year") || undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
  };
}
