---
title: Privacy Policy - Zedda
description: Zedda Privacy Policy and Data Security Standards
---

# Privacy Policy

*Effective Date: January 1, 2026 · Zedda Labs*

## 1. Overview & Commitment to Privacy

At **Zedda Labs**, we are committed to respecting your privacy and protecting your data. Zedda is built as a zero-telemetry, high-performance data discovery and profiling engine. 

Whether you use our Python library, C++ core, or browse our documentation, your data remains strictly confidential and entirely under your control.

---

## 2. Zero-Telemetry Dataset Processing

- **100% Local Execution:** Core profiling, scanning, comparison, and cleaning process your datasets (CSV, Parquet, Arrow, JSON) locally on your workstation, laptop, or compute cluster.
- **No External Data Transmissions:** Zero dataset contents, raw data rows, or telemetry beacons leave your machine during standard EDA operations.
- **No Usage Tracking:** The core `zedda` package contains no telemetry, analytics beacons, or remote reporting code.

### Optional AI Q&A Features
If you explicitly opt in to AI Q&A by providing an API key (`ZEDDA_AI_KEY`), offline regex patterns are attempted first locally. If offline heuristics do not match your question, metadata and aggregated summary statistics (such as column names, data types, null rates, and top correlations — **never raw data rows**) are transmitted over HTTPS to your configured AI inference endpoint.

---

## 3. Website & Documentation Usage

When visiting our documentation website (`public/docs` / web portal):

- **Preference Storage:** We store basic non-sensitive client preferences (such as Light/Dark theme selection) locally in your browser's `localStorage`.
- **No Third-Party Advertising:** We do not host third-party advertisements or sell user browsing data.

---

## 4. Contact Us & Support Communications

If you contact us via email at [zeddalabs@gmail.com](mailto:zeddalabs@gmail.com):

- We collect only the information you voluntarily provide (e.g., your email address and message contents).
- This information is used strictly to respond to your questions, process bug reports, or discuss feature requests.

---

## 5. Contact Information

If you have any security inquiries or questions about this Privacy Policy, please email us directly at:
**[zeddalabs@gmail.com](mailto:zeddalabs@gmail.com)**
