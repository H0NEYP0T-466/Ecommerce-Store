# Security Policy

The team behind **Hamid Cloth House (Ecommerce-Store)** takes security seriously. We value the input of security researchers and community members to keep our platform and user data safe.

---

## 🛡️ Supported Versions

We actively provide security updates for the following versions:

| Version | Supported          |
| :---    | :---               |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🔒 Reporting a Vulnerability

**Please do NOT disclose vulnerabilities publicly in public GitHub issues or discussions.**

If you discover a security vulnerability in this repository, please report it privately:

1. **Email:** Send details to [security@hamidcloth.com](mailto:security@hamidcloth.com) or [honeypot466@gmail.com](mailto:honeypot466@gmail.com).
2. **GitHub Security Advisory:** You may also open a draft private security advisory under the **Security** tab of the GitHub repository.

### What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:
- Type of issue (e.g., SQL/NoSQL injection, Broken Access Control, CSRF, XSS, Authentication bypass).
- Location of the affected code (file paths, endpoints, parameter names).
- Step-by-step instructions or proof-of-concept (PoC) payload to reproduce the vulnerability.
- An assessment of the potential impact on users or the system.
- Any suggested remediation or patches if available.

---

## ⏱️ Vulnerability Handling Process

1. **Acknowledgment:** We will acknowledge receipt of your vulnerability report within **48 hours**.
2. **Assessment:** Our core maintainers will verify the vulnerability and evaluate its severity.
3. **Remediation:** We will develop, test, and prepare a patch within an appropriate timeframe (typically 7–14 days depending on complexity).
4. **Public Disclosure:** Once a fix has been tested and deployed, a security advisory will be published and credit will be given to the reporter (unless you prefer to remain anonymous).

---

## 🔑 Security Best Practices for Deployers

When deploying this project to production, please ensure:
- Replace the default `JWT_SECRET` in `backend/.env` with a cryptographically secure 64-character random string.
- Restrict `FRONTEND_ORIGIN` to your exact production domain(s) rather than wildcard origins.
- Set `DEBUG=false` in the backend environment.
- Enforce HTTPS across all frontend and API endpoints.
- Secure MongoDB with role-based authentication and TLS connections.

Thank you for helping keep Hamid Cloth House secure!
