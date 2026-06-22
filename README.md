# LendSwift – Multi-Step Loan Application

A responsive multi-step loan application built using **React**, **TypeScript**, **React Hook Form**, and **Zod**. The application simulates a production-style loan onboarding workflow with dynamic validation, auto-save, document upload, e-signature, and loan-specific form logic.

---

## Features

* Multi-step loan application wizard
* Personal, Home, and Business loan support
* Dynamic validation using Zod
* React Hook Form integration
* Auto-save functionality
* KYC verification simulation
* PIN code lookup
* EMI calculator
* Secure document upload
* Electronic signature support
* Responsive design for desktop and mobile

---

## Technology Stack

* React
* TypeScript
* Vite
* React Hook Form
* Zod
* CSS

---

## Project Structure

```
src/
├── components/
│   ├── common/
│   ├── Step1LoanType.tsx
│   ├── Step2PersonalInfo.tsx
│   ├── Step3KYC.tsx
│   ├── Step4Address.tsx
│   ├── Step5Employment.tsx
│   ├── Step6CoApplicant.tsx
│   ├── Step7Documents.tsx
│   └── Step8Review.tsx
├── hooks/
├── utils/
├── App.tsx
├── main.tsx
└── types.ts
```

---

## Why Wizard Pattern?

A multi-step wizard improves usability by dividing long forms into manageable sections. Users can focus on one task at a time while preserving progress between steps.

---

## Why React Hook Form?

* Excellent performance
* Minimal re-renders
* Simple validation integration
* Better scalability for large forms

---

## Why Zod?

* Type-safe validation
* Excellent TypeScript support
* Declarative schemas
* Easy integration with React Hook Form

---

## Installation

Clone the repository

```bash
git clone https://github.com/DifinaLivera/zetheta-lendswift-loan-application.git
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

---

## Future Improvements

* Backend API integration
* Database persistence
* OTP verification
* Cloud document storage
* Real payment gateway integration

---

## Author

**Difina Livera**

BCA (Honours) – AI & Data Science

Amrita Vishwa Vidyapeetham
