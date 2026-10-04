# 📊 Smart Wallet Auditor & AI Financial Advisor

A production-grade, high-throughput **Polyglot Microservices Cluster** that integrates an enterprise ledger tracking system, automated real-time machine learning fraud/anomaly detection, and context-driven conversational compliance auditing.

This project demonstrates distributed system design patterns, secure cross-language networking, and a localized **Retrieval-Augmented Generation (RAG)** pipeline.

---

## 🏛️ System Architecture & Data Flow

The platform utilizes a polyglot microservice framework to decouple high-throughput transaction ledger storage from intensive mathematical computation and machine learning inference.

```text
               ┌────────────────────────────────────────┐
               │    React (Vite) Web UI Dashboard      │
               │             (Port 3000)                │
               └───────────────────┬────────────────────┘
                                   │
                           JSON / REST HTTP
                                   │
                                   ▼
               ┌────────────────────────────────────────┐
               │     Java 21 / Spring Boot 3.x          │
               │      "Core Wallet Service" (8081)      │
               └─────────┬────────────────────┬─────────┘
                         │                    │
                  JDBC   │                    │ JSON / REST HTTP
                         ▼                    ▼
        ┌──────────────────┐        ┌──────────────────────────┐
        │ PostgreSQL 17    │        │     Python / FastAPI     │
        │   "walletdb"     │        │ "ML Engine" (Port 8000)  │
        └──────────────────┘        └──────────────────────────┘
                 ▲                                │
                 │        In-Memory Context       │
                 └────────────────────────────────┘
                                  │
                       LangChain4j Service Mesh
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │    Google AI Studio        │
                    │    Gemini-3.8-Flash        │
                    └────────────────────────────┘
```

### 🔁 End-to-End Operational Lifecycle
1. **Ingestion & Storage:** The user submits an expense via the React UI dashboard to the Spring Boot REST API. Spring Boot persists the raw record directly to **PostgreSQL**.
2. **ML Risk Inspection:** Spring Boot acts as an HTTP client, transforming the entity data into an optimized feature payload and dispatching it to the **Python FastAPI microservice**.
3. **Multi-Dimensional Analysis:** The Python engine executes a pre-trained **Scikit-Learn Isolation Forest** algorithm. It checks both the **transaction amount** and the **temporal velocity (hour of day)** to determine if the transaction is an anomaly.
4. **Context-Driven GenAI Auditing:** When the user chats with the AI assistant, the **LangChain4j framework** pulls the verified live transactional records from PostgreSQL and builds an encapsulated context window. This data is fed securely into the **Google Gemini-3.8-Flash model**, eliminating hallucinations and ensuring precise financial summaries.

---

## 🛠️ Complete Technology Stack

### ☕ Enterprise Backend (Java Layer)
* **Framework:** Java 21, Spring Boot 3.3.x, Spring Data JPA
* **AI Orchestration:** LangChain4j Core, LangChain4j Google AI Gemini Extension
* **Build System:** Apache Maven, Lombok

### 🐍 Predictive Analytics (Python Layer)
* **Framework:** Python 3.11 / 3.13, FastAPI, Uvicorn Web Server
* **Data Science / ML:** Scikit-Learn (Unsupervised Outlier Isolation Forest), Pandas, NumPy, Pydantic

### 💾 Persistence & Presentation Layer
* **Database:** PostgreSQL 17 (Relational Database)
* **Frontend UI:** React 18 (Vite Engine), HTML5 Semantic UI, Pure Component Style Blocks

### 🛡️ Stateless Identity Verification & API Encryption

To protect the financial transaction routes from unauthenticated access or data interception, a robust cryptographic protection layer was integrated into the Core Wallet engine:

*   **Cryptographic Hashing:** User passwords are never saved as plain text. Instead, on account registration, strings are salted and hashed using an asynchronous **BCrypt Password Encoder**.
*   **Stateless Token Issuance:** Upon successful credential validation, the system issues a **JSON Web Token (JWT)** containing custom user claims and signature credentials signed via an ephemeral **HMAC-SHA256 Secret Key**.
*   **Request Interceptor Filtering:** A dedicated **OncePerRequestFilter** interceptor sits in front of the application. It parses every incoming HTTP header (`Authorization: Bearer <TOKEN>`), extracts the context identity variables, and securely unlocks role-bound routes without keeping server-side session weights.

---

## 💡 Production Engineering Highlights

### 1. Multi-Dimensional Behavior Anomaly Profiling
Unlike primitive budget apps that rely on simple static maximum limits, the Python ML layer looks at structural feature relationships. For instance, a small transaction (₹650) executed past midnight (**Hour 0**) breaks regular daytime transactional boundaries (8 AM - 10 PM) and is successfully flagged as a behavioral anomaly. 

### 2. Microservice Decoupling & Polyglot Contracts
Strong network interface boundaries are maintained using explicit Java Data Transfer Objects (DTOs) mapped directly to Python validation specifications. This isolates core transaction ledger storage from data science processing loops.

### 3. Fault-Tolerant System Resiliency
The architecture is designed with defensive exception handling boundaries. If an external cloud endpoint hits a rate limit or goes down, the core system isolates the crash inside a local service fallback loop. The UI displays an alert frame to ensure continuous operation without knocking the primary servers offline.


---

## 🏃‍♂️ Local Quickstart Guide

Ensure you have your environment paths set up correctly, then run the services simultaneously across three terminal tabs:

### 📡 1. Boot the Python ML Service (Port 8000)
```bash
cd ml-analytics-service
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### ☕ 2. Boot the Java Core Engine (Port 8081)
Ensure your PostgreSQL instance is active with a database named `walletdb`, paste your key inside `src/main/resources/application.yml`, and execute:
```bash
cd core-wallet-service
mvn clean spring-boot:run
```

### 💻 3. Boot the React Visual Dashboard (Port 3000)
```bash
cd wallet-dashboard
npm install
npm run dev
```
👉 Open your browser to **`http://localhost:3000`** to access the dashboard!
