## How We Used Codex

1.FinTech AI was built with OpenAI Codex as an engineering assistant throughout the development process. Rather than using it only to generate code, we used it to speed up development, validate ideas, and solve implementation challenges while making all product and technical decisions ourselves.

2.During the initial stages, Codex helped us plan the overall architecture of the application. It assisted in organizing the React frontend, Express backend, Supabase database, and API integrations into a clean and maintainable project structure.

3.As development progressed, Codex accelerated the implementation of reusable React components, TypeScript interfaces, API integrations, dashboard layouts, authentication flows, and backend endpoints. It also helped connect the frontend with Supabase and external financial data sources while improving code organization and maintainability.

4.Codex was especially valuable during debugging. It helped identify TypeScript errors, resolve API integration issues, troubleshoot deployment problems on Vercel and Render, and suggest cleaner implementations for existing code. These suggestions reduced development time, but every change was reviewed, tested, and refined before becoming part of the final application.

5.Throughout the project, Codex allowed us to spend less time on repetitive coding tasks and more time improving the product, refining the user experience, and building meaningful AI-powered features.
---
## How We Used GPT-5.6
GPT-5.6 powers the intelligence behind Nexus AI, the AI financial copilot integrated into FinTech AI.
Instead of simply displaying financial information, GPT-5.6 helps users understand their data by generating personalized insights, explaining financial concepts, and answering natural language questions.
Within the application, GPT-5.6 is used to:
- Generate personalized financial insights.
- Explain companies and stock information in simple language.
- Answer finance-related questions through Nexus AI.
- Generate AI-powered financial summaries and reports.
- Help users understand spending patterns and make better financial decisions.
The goal was to build an assistant that goes beyond dashboards by providing contextual, conversational guidance tailored to each user's financial data.
---
## Why OpenAI
Our objective was to build an AI-first financial platform rather than a traditional finance dashboard.
OpenAI Codex accelerated the engineering process by assisting with architecture, implementation, debugging, and code quality throughout development. GPT-5.6 powers the intelligence behind Nexus AI, enabling conversational financial assistance, personalized insights, and AI-generated reports.
Together, Codex and GPT-5.6 enabled us to build FinTech AI faster while allowing the team to focus on product design, engineering decisions, and creating a practical financial assistant for everyday users.
## APIs and Services Used
### OpenAI GPT-5.6 API
Used to power Nexus AI, the application's AI financial copilot. GPT-5.6 generates personalized financial insights, explains stocks and financial concepts, answers user questions, and creates AI-generated financial reports.
**Reason:** To provide intelligent, conversational financial assistance instead of static dashboards and charts.
### Finnhub API
Used to retrieve real-time financial market data, including stock prices, company information, market trends, and other investment-related data.
**Reason:** To provide accurate and up-to-date financial information for stock research and market analysis.
### Supabase
Used as the backend platform for authentication, database management, and secure storage of user data.
**Reason:** To provide a scalable backend with built-in authentication and real-time database capabilities without managing separate infrastructure.
### Vercel
Used to deploy and host the React frontend.
**Reason:** Fast deployment, automatic CI/CD from GitHub, and optimized performance for frontend applications.
### Render
Used to deploy and host the Express.js backend.
**Reason:** Reliable cloud hosting for REST APIs with simple deployment and environment variable management.
