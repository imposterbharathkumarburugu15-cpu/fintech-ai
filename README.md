# FinPilot AI

## Inspiration

Managing personal finances today is surprisingly fragmented. People use one app to check bank transactions, another to track investments, another to read financial news, and often a chatbot to ask financial questions. None of these services truly understand the user's complete financial picture.

We wanted to build something different.

Our vision was to create **FinPilot AI**, an AI-powered financial operating system that unifies expenses, investments, market intelligence, and personalized financial guidance into a single platform. Instead of simply displaying numbers and charts, FinPilot AI explains what happened, why it happened, and what actions the user should consider.

---

## What it does

FinPilot AI combines multiple financial tools into one intelligent platform.

### Expense Intelligence

- Automatically imports bank transactions from SMS (Android)
- Categorizes spending
- Tracks income and expenses
- Generates spending insights and summaries

### Investment Intelligence

- Portfolio tracking
- Stock research
- Personalized market analysis
- Watchlists and investment monitoring

### Nexus AI

Nexus AI is a finance-focused AI assistant that helps users understand:

- Their own financial data
- Investment concepts
- Spending habits
- Portfolio performance
- Financial planning

Unlike general-purpose chatbots, Nexus AI is designed specifically for finance.

### Personalized Alerts

Rather than showing generic market news, FinPilot AI checks whether news actually affects the user's own portfolio before generating alerts.

---

## How We Built It

### Frontend

- React
- Vite
- React Native CLI (Android)

### Backend

- Express.js
- TypeScript
- OpenAI GPT-5.6 API
- Finnhub API

### Database

- Supabase
- PostgreSQL
- Row-Level Security (RLS)
- Authentication
- Cloud Storage

The web application and Android application share the same backend and database, allowing transactions captured on a phone to instantly appear on the web dashboard.

One of our biggest design principles was keeping the database as the single source of truth. Expenses, transactions, watchlists, AI reports, and alerts are stored independently so every feature can build upon reliable financial data.

---

## Technical Highlights

### Automatic SMS Transaction Parsing

One of the most challenging parts of the project was creating a reliable SMS parser.

Instead of relying on bank sender IDs—which vary across banks—we parse transaction content. This allows the parser to work across multiple Indian banks without maintaining bank-specific rules.

The parser:

- Detects debit and credit transactions
- Extracts transaction amounts
- Identifies merchants when possible
- Ignores OTPs and promotional messages
- Filters account balances from transaction amounts
- Prevents duplicate transaction uploads

### Secure Multi-User Architecture

Security was one of our primary design goals.

Every user's financial data is isolated using PostgreSQL Row-Level Security (RLS), ensuring users can only access their own records.

### AI-First Architecture

Instead of sending every request directly to an LLM, FinPilot AI first performs inexpensive database filtering and rule-based processing. AI is only used where it genuinely adds value, reducing latency, API usage, and operational costs.

---

## APIs and Services Used

### OpenAI GPT-5.6 API

Used to power Nexus AI, generate financial insights, explain investment concepts, answer finance-related questions, and create personalized AI financial reports.

**Reason:** GPT-5.6 enables natural conversations and personalized financial assistance instead of simply displaying raw financial data.

### Finnhub API

Used to retrieve real-time stock prices, company profiles, financial news, and market information.

**Reason:** Reliable live market data is essential for investment research, portfolio monitoring, and personalized market analysis.

### Supabase

Used for authentication, PostgreSQL database management, Row-Level Security (RLS), and cloud storage.

**Reason:** Supabase provides a secure, scalable backend while ensuring each user's financial information remains isolated and protected.

### Vercel

Used to deploy the React web application.

**Reason:** Fast frontend deployment with automatic CI/CD and global hosting.

### Render

Used to deploy the Express backend.

**Reason:** Reliable backend hosting with environment variable management and easy deployment.

---

## How We Collaborated with Codex

OpenAI Codex was an engineering assistant throughout the development of FinPilot AI. Rather than using it to build the application automatically, we used it to accelerate development, explore implementation approaches, and solve technical challenges while keeping all product, engineering, and design decisions within our team.

During the planning stage, Codex helped us evaluate different architectural approaches and organize the project into a clean React frontend, Express backend, and Supabase-powered backend. This allowed us to maintain a modular and scalable codebase as new features were added.

During implementation, Codex accelerated repetitive engineering tasks such as creating reusable React components, defining TypeScript interfaces, building Express API routes, integrating Supabase, and connecting external APIs like Finnhub. It also helped explain errors, troubleshoot deployment issues on Vercel and Render, improve code quality, and suggest cleaner implementations during refactoring.

While Codex significantly improved our development speed, every generated solution was reviewed, tested, modified, and integrated by our team. Decisions such as the overall product vision, database design, user experience, SMS transaction parsing logic, AI workflow, and feature prioritization were made by us based on the requirements of the project.

Using Codex allowed us to spend less time on repetitive coding tasks and more time improving the product, refining the user experience, and building meaningful AI-powered features.

---

## How GPT-5.6 Contributed

GPT-5.6 powers Nexus AI, the AI financial copilot integrated into FinPilot AI.

Instead of acting as a general-purpose chatbot, GPT-5.6 interprets financial information and provides personalized assistance based on user data.

GPT-5.6 is responsible for:

- Answering finance-related questions
- Explaining stocks and companies in simple language
- Summarizing spending behaviour
- Generating AI-powered financial reports
- Providing personalized financial insights
- Helping users understand investment opportunities and financial health

Our goal was to make financial information understandable rather than overwhelming. GPT-5.6 enables users to interact with their finances naturally instead of interpreting complex charts and numbers themselves.

---

## Challenges We Ran Into

This project involved solving challenges across mobile development, backend architecture, databases, and AI.

Some of the biggest challenges included:

- Parsing dozens of different bank SMS formats
- Eliminating duplicate transaction uploads
- Designing a scalable financial database
- Building secure multi-user authentication with Row-Level Security
- Synchronizing mobile and web applications through a shared backend
- Integrating AI while keeping response costs practical
- Managing team collaboration and Git workflows during development

Each challenge pushed us to rethink our architecture and build reliable, scalable solutions instead of quick fixes.

---

## What We Learned

This project taught us much more than simply building another web application.

We learned:

- Designing secure multi-user systems
- Mobile-native development with React Native
- PostgreSQL database design
- Authentication and authorization
- AI application architecture
- Prompt engineering
- Financial data modeling
- Real-world API integration
- Building scalable full-stack applications

Perhaps the biggest lesson was that AI alone is not the product. The real value comes from combining reliable financial data, thoughtful system design, and intelligent analysis into an experience that genuinely helps users make better financial decisions.

---

## What's Next

Our roadmap includes:

- Live SMS transaction capture
- Portfolio performance analytics
- AI-generated financial reports
- Advanced stock research
- Personalized investment recommendations
- Cross-device synchronization
- Enhanced financial dashboards
- Smarter AI planning and budgeting features

Our long-term vision is simple:

> **One AI. One Platform. Complete Financial Intelligence.**

---

## Final Thoughts

FinPilot AI was built by combining modern full-stack development with practical AI capabilities. OpenAI Codex accelerated our engineering workflow by helping us implement features, debug issues, improve code quality, and iterate faster throughout development. GPT-5.6 powers Nexus AI, transforming financial data into personalized insights, natural conversations, and actionable recommendations.

By combining React, Express, Supabase, Finnhub, and OpenAI technologies, we built a platform that goes beyond traditional finance dashboards and helps users better understand, manage, and improve their financial decisions.
