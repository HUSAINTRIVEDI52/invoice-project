type PendingInput = {
  id: string;
  fullName: string;
  studentCode: string;
  customFeeAmount: number | null;
  standard: { name: string; feeStructures: { amount: number }[] };
  payments: { amountReceived: number; expectedAmount: number; feePeriod: string }[];
};

export function calculatePendingForStudent(student: PendingInput, feePeriod?: string) {
  const expected = student.customFeeAmount ?? student.standard.feeStructures[0]?.amount ?? 0;
  const paid = student.payments
    .filter((payment) => !feePeriod || payment.feePeriod === feePeriod)
    .reduce((total, payment) => total + payment.amountReceived, 0);
  return Math.max(expected - paid, 0);
}

export function sumAmounts<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0);
}
