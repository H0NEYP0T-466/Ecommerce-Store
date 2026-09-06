# Contributing to Hamid Cloth House (Ecommerce-Store)

Thank you for your interest in contributing to **Hamid Cloth House**! We welcome community contributions, bug fixes, feature proposals, and improvements to help build the premier e-commerce platform for Pakistani clothing.

Please take a moment to review this guide before getting started.

---

## 📑 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting a Pull Request](#submitting-a-pull-request)
- [Local Development Setup](#-local-development-setup)
  - [Backend Setup (FastAPI)](#backend-setup-fastapi)
  - [Frontend Setup (React 19 + Vite)](#frontend-setup-react-19--vite)
- [Code Style & Standards](#-code-style--standards)
- [Testing Guidelines](#-testing-guidelines)
- [Commit Message Conventions](#-commit-message-conventions)

---

## 🤝 Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior following the guidelines in that document.

---

## 🚀 How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to ensure the problem has not already been reported.

When submitting a bug report using our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml), please provide:
1. **Clear Title & Summary**: A descriptive overview of the issue.
2. **Steps to Reproduce**: Detailed step-by-step instructions to recreate the problem.
3. **Expected vs Actual Behavior**: What you expected to happen versus what actually occurred.
4. **Environment**: OS, browser, Node.js version, Python version, database engine.
5. **Logs & Screenshots**: Relevant terminal outputs, console errors, or network payloads.

### Suggesting Enhancements

Feature proposals are welcomed! Please use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml) and include:
- A clear description of the problem or opportunity.
- Proposed solution or implementation details.
- Potential alternatives considered.
- Scope and backward-compatibility considerations.

### Submitting a Pull Request

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/Ecommerce-Store.git
   cd Ecommerce-Store
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/my-new-feature
   # or
   git checkout -b fix/issue-description
   ```
4. **Make Your Changes**: Write clean, test-covered code.
5. **Run Tests & Verify Builds**:
   - Backend: `backend/.venv/bin/pytest backend/tests/`
   - Frontend: `npm run build`
6. **Commit with Conventional Commits** (e.g., `feat: ...`, `fix: ...`).
7. **Push to Your Fork**:
   ```bash
   git push origin feat/my-new-feature
   ```
8. **Open a Pull Request** against `master` using the provided [Pull Request Template](.github/pull_request_template.md).

---

## 💻 Local Development Setup

### Backend Setup (FastAPI)

1. Ensure Python 3.12+ and MongoDB 7.0+ are running.
2. Set up the virtual environment:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
4. Seed the database with initial categories, catalog, and admin:
   ```bash
   PYTHONPATH=. .venv/bin/python seed.py
   ```
5. Start development server on port 8015:
   ```bash
   .venv/bin/uvicorn app.main:app --reload --port 8015
   ```

### Frontend Setup (React 19 + Vite)

1. Ensure Node.js 18+ is installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite dev server on port 5173:
   ```bash
   npm run dev
   ```

---

## 🎨 Code Style & Standards

- **TypeScript / React**:
  - Strict typing — avoid `any` wherever possible.
  - Follow the Uber-inspired monochrome design tokens defined in `src/styles/design-tokens.css`.
  - Ensure all `<title>` elements in `react-helmet-async` use single template strings: `<title>{`...`}</title>`.
  - Format with Prettier / ESLint standard rules.
- **Python / FastAPI**:
  - Follow PEP 8 guidelines.
  - Type annotations on all endpoint signatures and service methods.
  - Pydantic v2 schemas for all request validation and response models.
  - Asynchronous Motor/Beanie database queries (`await`).

---

## 🧪 Testing Guidelines

- Every new backend endpoint or bug fix should have an accompanying pytest test in `backend/tests/`.
- Ensure all tests pass prior to submitting a PR:
  ```bash
  backend/.venv/bin/pytest backend/tests/ -v
  ```
- Verify production frontend build:
  ```bash
  npm run build
  ```

---

## 📝 Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new user-facing feature or capability
- `fix:` A bug fix
- `docs:` Documentation changes only
- `style:` Formatting, missing semi-colons, white-space
- `refactor:` Code restructuring without changing behavior
- `perf:` Performance improvements
- `test:` Adding or fixing tests
- `chore:` Build scripts, dependency updates, tooling

---

Thank you for helping make Hamid Cloth House better for everyone!
