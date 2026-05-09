# MSL Student Fees Collection System

## Project Overview

MSL Student Fees Collection System is a web-based application for managing student records, fee collections, invoices, and reports. It helps an admin maintain standard-wise student data, record fees received, track pending balances, and generate invoice PDFs.

The application is designed to replace manual fee tracking with a structured dashboard for student fee collection and reporting.

## Main Features

### Authentication

- Admin login and logout
- Protected dashboard pages
- Secure session handling

### Dashboard

- Total students
- Total standards
- Fees received
- Pending balances
- Quick access to payment recording

### Standard Management

- Add standards or batches
- View student counts by standard
- Organise students standard-wise

### Student Management

- Add and manage student records
- Store guardian details, contact number, WhatsApp number, address, email, status, and notes
- Search and filter students by standard
- View student profile and payment history

### Fee Structures

- Configure standard-wise fee amounts
- Support monthly, quarterly, yearly, and custom billing cycles
- Allow custom fee amount per student when needed

### Fee Payments and Invoices

- Record student fee payments
- Generate invoice numbers with the MSL prefix
- Generate PDF fee receipts/invoices dynamically
- Track expected amount, received amount, and balance

### Reports

- Filter fee payment records by standard, payment mode, date, month, year, or range
- View standard-wise and mode-wise collections
- Export reports as CSV or PDF
- Track pending student fee balances

### Settings

- Institution name
- Address
- Contact details
- Invoice prefix
- Currency
- Logo URL

## Default Admin

Seeded development credentials:

```txt
Email: admin@msl.local
Password: admin12345
```

## Commands

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm test
```

## Database Setup

Set `DATABASE_URL` in `.env`, then run:

```bash
npm run db:generate
npm run db:seed
```

## Invoice Number Format

Invoices use the configured prefix, defaulting to MSL:

```txt
MSL-2026-0001
MSL-2026-0002
MSL-2026-0003
```
