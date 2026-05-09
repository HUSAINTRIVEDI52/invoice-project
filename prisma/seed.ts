import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const standards = [
  { name: "Standard 5", amount: 1200 },
  { name: "Standard 6", amount: 1300 },
  { name: "Standard 7", amount: 1500 },
  { name: "Standard 8", amount: 1600 },
  { name: "Standard 9", amount: 1800 },
  { name: "Standard 10", amount: 2000 },
  { name: "Standard 11 Commerce", amount: 2500 },
  { name: "Standard 12 Commerce", amount: 2800 },
];

const students = [
  ["MSL-STU-001", "Aarav Patel", "Standard 10", "Rakesh Patel", "9876500001", "2026-04-01"],
  ["MSL-STU-002", "Diya Shah", "Standard 8", "Nilesh Shah", "9876500002", "2026-04-02"],
  ["MSL-STU-003", "Vivaan Mehta", "Standard 9", "Ketan Mehta", "9876500003", "2026-04-03"],
  ["MSL-STU-004", "Anaya Desai", "Standard 10", "Jignesh Desai", "9876500004", "2026-04-04"],
  ["MSL-STU-005", "Kabir Trivedi", "Standard 11 Commerce", "Paresh Trivedi", "9876500005", "2026-04-05"],
  ["MSL-STU-006", "Riya Joshi", "Standard 12 Commerce", "Manish Joshi", "9876500006", "2026-04-06"],
  ["MSL-STU-007", "Arjun Parmar", "Standard 7", "Bhavesh Parmar", "9876500007", "2026-04-07"],
  ["MSL-STU-008", "Isha Solanki", "Standard 6", "Mahesh Solanki", "9876500008", "2026-04-08"],
  ["MSL-STU-009", "Krish Thakkar", "Standard 5", "Amit Thakkar", "9876500009", "2026-04-09"],
  ["MSL-STU-010", "Myra Vyas", "Standard 8", "Sanjay Vyas", "9876500010", "2026-04-10"],
  ["MSL-STU-011", "Dev Patel", "Standard 9", "Hiren Patel", "9876500011", "2026-04-11"],
  ["MSL-STU-012", "Tara Shah", "Standard 11 Commerce", "Raj Shah", "9876500012", "2026-04-12"],
];

const paymentModes = ["Cash", "UPI", "Bank Transfer", "Cash", "UPI", "Card"];
const months = ["April 2026", "May 2026", "June 2026"];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@msl.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: { name: "MSL Admin", passwordHash },
    create: { email, name: "MSL Admin", passwordHash },
  });

  await prisma.settings.upsert({
    where: { id: "default" },
    update: {
      className: "MSL",
      address: "MSL, Main Road",
      contactNumber: "9876543210",
      email,
      invoicePrefix: "MSL",
      currency: "INR",
    },
    create: {
      id: "default",
      className: "MSL",
      address: "MSL, Main Road",
      contactNumber: "9876543210",
      email,
      invoicePrefix: "MSL",
      currency: "INR",
    },
  });

  const standardByName = new Map<string, { id: string; amount: number }>();

  for (const item of standards) {
    const standard = await prisma.standard.upsert({
      where: { name: item.name },
      update: { description: `${item.name} batch` },
      create: { name: item.name, description: `${item.name} batch` },
    });
    standardByName.set(item.name, { id: standard.id, amount: item.amount });

    await prisma.feeStructure.upsert({
      where: { standardId_feeType: { standardId: standard.id, feeType: "Monthly Fee" } },
      update: { amount: item.amount, billingCycle: "monthly" },
      create: { standardId: standard.id, feeType: "Monthly Fee", amount: item.amount, billingCycle: "monthly" },
    });

    await prisma.feeStructure.upsert({
      where: { standardId_feeType: { standardId: standard.id, feeType: "Setup Fee" } },
      update: { amount: 500, billingCycle: "custom" },
      create: { standardId: standard.id, feeType: "Setup Fee", amount: 500, billingCycle: "custom" },
    });
  }

  const createdStudents = [];
  for (const [studentCode, fullName, standardName, guardianName, contactNumber, admissionDate] of students) {
    const standard = standardByName.get(standardName);
    if (!standard) continue;
    const student = await prisma.student.upsert({
      where: { studentCode },
      update: {
        fullName,
        standardId: standard.id,
        guardianName,
        contactNumber,
        whatsappNumber: contactNumber,
        admissionDate: new Date(admissionDate),
        status: "active",
      },
      create: {
        studentCode,
        fullName,
        standardId: standard.id,
        guardianName,
        contactNumber,
        whatsappNumber: contactNumber,
        email: `${studentCode.toLowerCase()}@example.com`,
        address: "Ahmedabad, Gujarat",
        admissionDate: new Date(admissionDate),
        status: "active",
        notes: "Sample student data",
      },
    });
    createdStudents.push({ ...student, standardAmount: standard.amount });
  }

  let sequence = 1;
  for (const student of createdStudents) {
    for (const [monthIndex, feePeriod] of months.entries()) {
      const invoiceNumber = `MSL-2026-${String(sequence).padStart(4, "0")}`;
      const paymentCode = `PAY-2026-${String(sequence).padStart(4, "0")}`;
      const isPartial = (sequence + monthIndex) % 5 === 0;
      const amountReceived = isPartial ? student.standardAmount - 500 : student.standardAmount;

      await prisma.payment.upsert({
        where: { invoiceNumber },
        update: {
          studentId: student.id,
          standardId: student.standardId,
          amountReceived,
          expectedAmount: student.standardAmount,
          paymentMode: paymentModes[sequence % paymentModes.length],
        },
        create: {
          paymentCode,
          invoiceNumber,
          studentId: student.id,
          standardId: student.standardId,
          feeType: "Monthly Fee",
          feePeriod,
          amountReceived,
          expectedAmount: student.standardAmount,
          paymentDate: new Date(2026, monthIndex + 3, 5 + (sequence % 20)),
          paymentMode: paymentModes[sequence % paymentModes.length],
          receivedBy: "Admin",
          notes: isPartial ? "Partial fee payment" : "Sample fee payment",
        },
      });
      sequence += 1;
    }
  }

  console.log(`Seeded admin: ${email} / ${password}`);
  console.log(`Seeded ${standards.length} standards, ${createdStudents.length} students, and ${sequence - 1} payments.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
