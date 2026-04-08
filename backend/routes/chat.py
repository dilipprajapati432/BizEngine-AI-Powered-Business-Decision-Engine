from flask import Blueprint, request, jsonify, session
from utils.memory_store import store
from utils.anonymizer import scrub_pii
import os, json, logging

logger = logging.getLogger(__name__)

chat_bp = Blueprint("chat", __name__)

def _build_dataset_context():
    """Build a compact statistical summary of the current dataset using MemoryStore DataFrames."""
    uid = session.get("uid")
    if not uid:
        return "No session active."
    
    df = store.get_data(uid)
    if df is None or df.empty:
        return "No dataset has been uploaded yet."

    total_count = len(df)
    total_revenue = df["revenue"].sum()
    total_units = int(df["units_sold"].sum())

    parts = [
        f"Dataset: {total_count} transactions",
        f"Total Revenue: ${total_revenue:,.2f}",
        f"Total Units Sold: {total_units:,}",
    ]

    # Top 5 Products
    if "product" in df.columns:
        top_prods = df.groupby("product")["revenue"].sum().sort_values(ascending=False).head(5)
        if not top_prods.empty:
            parts.append("Top 5 Products by Revenue:")
            for p, v in top_prods.items():
                pct = round((v / total_revenue) * 100, 1) if total_revenue > 0 else 0
                parts.append(f"  - {p}: ${v:,.2f} ({pct}%)")

    # Categories
    if "category" in df.columns:
        cats = df.groupby("category")["revenue"].sum()
        if len(cats) > 1:
            parts.append("Categories:")
            for c, v in cats.items():
                pct = round((v / total_revenue) * 100, 1) if total_revenue > 0 else 0
                parts.append(f"  - {c}: ${v:,.2f} ({pct}%)")

    # Regions
    if "region" in df.columns:
        regs = df.groupby("region")["revenue"].sum()
        if len(regs) > 1:
            parts.append("Regions:")
            for r_name, v in regs.items():
                pct = round((v / total_revenue) * 100, 1) if total_revenue > 0 else 0
                parts.append(f"  - {r_name}: ${v:,.2f} ({pct}%)")

    return scrub_pii("\n".join(parts))


CHAT_SYSTEM_PROMPT = """You are BizEngine AI — a smart, helpful business data assistant built into an AI-powered business decision engine.

You have access to the user's uploaded sales dataset summary below. Use it to answer their questions accurately.

RULES:
1. ALWAYS use actual numbers, percentages, and product/region/category names from the data.
2. If the user asks something that cannot be answered from the dataset, say so honestly.
3. Be concise but thorough. Use bullet points for comparisons.
4. Do NOT make up data that isn't in the summary provided.
5. You can also answer general business strategy questions, but always tie back to the user's actual data when possible.
6. Be friendly and professional. Use emojis sparingly.

DATASET SUMMARY:
{context}
"""


@chat_bp.route("/chat", methods=["POST"])
def chat():
    body = request.get_json()
    if not body or "message" not in body:
        return jsonify({"error": "Missing 'message' in request body."}), 400

    user_message = body["message"].strip()
    if not user_message:
        return jsonify({"error": "Empty message."}), 400

    # Build dataset context
    context = _build_dataset_context()

    system_prompt = CHAT_SYSTEM_PROMPT.format(context=context)

    # Try Groq first, then Gemini
    groq_key = os.getenv("GROQ_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    try:
        if groq_key:
            from groq import Groq
            client = Groq(api_key=groq_key)
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.4,
                max_tokens=800,
            )
            reply = completion.choices[0].message.content.strip()
            return jsonify({"reply": reply, "provider": "groq"})

        elif gemini_key:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_prompt
            )
            response = model.generate_content(user_message)
            reply = response.text.strip()
            return jsonify({"reply": reply, "provider": "gemini"})

        else:
            return jsonify({
                "reply": "No AI API keys configured. Please add GROQ_API_KEY or GEMINI_API_KEY to your .env file to enable the chat assistant.",
                "provider": "none"
            })

    except Exception as e:
        logger.error(f"Chat API error: {e}")
        return jsonify({"reply": f"Sorry, I encountered an error processing your request. Please try again.", "provider": "error"}), 500
