# 🚀 Deployment Guide: BizEngine Intelligence

This document provides a step-by-step roadmap to deploy your **Privacy-First Business Engine** to production using **Render** (for the Backend) and **Vercel/Netlify** (for the Frontend).

---

## 🏗️ Phase 1: Backend Deployment (Render)

Render is recommended for your Flask backend because it supports Python environments and session-based logic natively.

1.  **Repository**: Push your code to a GitHub or GitLab repository.
2.  **Create Web Service**: In Render dashboard, click **New +** > **Web Service**.
3.  **Configure**:
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r backend/requirements.txt`
    *   **Start Command**: `gunicorn --chdir backend --bind 0.0.0.0:$PORT app:app`
4.  **Environmental Variables**: Add the following in the **Environment** tab:
    *   `SECRET_KEY`: A long, random string for session security.
    *   `GROQ_API_KEY`: Your Groq Cloud API Key.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `FRONTEND_URL`: The URL of your future Vercel/Netlify app (e.g., `https://bizengine.vercel.app`).

---

## 🎨 Phase 2: Frontend Deployment (Vercel)

Vercel is optimized for Vite/React applications.

1.  **Create Project**: In Vercel dashboard, click **Add New** > **Project**.
2.  **Configure**:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: `Vite`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
3.  **Environmental Variables**:
    *   `VITE_API_URL`: The **onrender.com** URL of your deployed backend (e.g., `https://bizengine-backend.onrender.com/api`).
4.  **Deploy**: Hit deploy and wait for the build to finish.

---

## ⚡ Phase 3: The "Privacy Handshake"

Once both are deployed, check the following for high-security operation:

*   **CORS Check**: Ensure the `FRONTEND_URL` in your Backend environment exactly matches your Vercel URL.
*   **Purge Verification**: Verify that clicking **Purge Session** clears the in-memory store in your production logs.
*   **AI Sanitization**: Verify that insights are still being anonymized (as per our `anonymizer.py` utility).

---

## 🛡️ Production Security Checklist

- [ ] **Disable Debug**: Ensure `debug=False` is set in `app.py` (Completed ✅).
- [ ] **HTTPS Only**: Both Vercel and Render provide SSL/HTTPS by default. Do not use HTTP for revenue data.
- [ ] **API Keys**: Never commit your `.env` file to GitHub. Always use the hosting provider's "Environment" dashboard.

**Congratulations! Your executive-grade intelligence suite is ready for the world.**
