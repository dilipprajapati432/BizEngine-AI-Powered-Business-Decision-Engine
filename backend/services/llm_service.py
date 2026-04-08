import os
import json
import logging
from typing import Dict, Optional

# Attempt to configure AI providers if available in environment
try:
    from groq import Groq
except ImportError:
    Groq = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an Expert Financial Data Analyst working for a Fortune 500 company.
Given the provided statistical summary of a company's sales data, generate EXACTLY 5 paired insight-recommendation objects.

STRICT RULES:
1. Every insight MUST contain actual numerical values (revenue figures, percentages, counts) from the provided data. NEVER use vague language like "consider analyzing" or "conduct portfolio review".
2. Every insight must include percentage contribution where applicable (e.g., "Product X contributes 32% of total revenue").
3. Each recommendation MUST directly address the specific insight it is paired with.
4. Mark the top 1-2 most critical/impactful insights as "is_key": true. The rest must be "is_key": false.
5. If a data dimension is missing or has no variation, include an insight noting this limitation.

BAD EXAMPLE (DO NOT DO THIS):
"Conduct product portfolio analysis to optimize revenue streams"

GOOD EXAMPLE:
"Product 'Canon imageCLASS' contributes 32.1% ($4,247,591) of total revenue, while 'Office Supplies' contributes only 5.2% ($670,122), indicating a heavy revenue concentration risk."

Return your response ONLY in valid JSON matching this schema:
{
  "paired_insights": [
    { "insight": "Data-driven insight text with numbers and percentages", "recommendation": "Specific actionable recommendation tied to this insight", "is_key": true },
    { "insight": "...", "recommendation": "...", "is_key": false }
  ]
}
Do NOT include any markdown block formatting (like ```json). ONLY return raw JSON.
"""

def get_llm_insights(summary_text: str) -> Optional[Dict]:
    """
    Core LLM Orchestration Service.
    
    Attempts to generate data-driven business insights using a prioritized 
    dual-provider strategy:
    1. Primary: Groq Cloud (Llama3-70b) for ultra-low latency inference.
    2. Fallback: Google Gemini 1.5 Pro for deep strategic reasoning if 
       Groq is unavailable or fails.
    
    Args:
        summary_text: Detailed statistical summary and grounding instructions.
        
    Returns:
        Structured JSON containing paired insights and recommendations.
    """
    logger.info("Initializing LLM Insight Generation...")
    
    groq_api_key = os.getenv("GROQ_API_KEY")
    gemini_api_key = os.getenv("GEMINI_API_KEY")

    if groq_api_key and Groq:
        try:
            logger.info("Attempting to generate insights via Groq API...")
            client = Groq(api_key=groq_api_key)
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",  # fast standard model on groq
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Here is the dataset summary:\n\n{summary_text}"}
                ],
                temperature=0.3,
                max_tokens=1024,
            )
            raw_json = completion.choices[0].message.content.strip()
            return _parse_json_response(raw_json)
        except Exception as e:
            logger.error(f"Groq API failed: {e}")
            # Fall through to try Gemini if Groq fails
    
    if gemini_api_key and genai:
        try:
            logger.info("Attempting to generate insights via Google Gemini API...")
            genai.configure(api_key=gemini_api_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=SYSTEM_PROMPT
            )
            response = model.generate_content(f"Here is the dataset summary:\n\n{summary_text}")
            raw_json = response.text.strip()
            return _parse_json_response(raw_json)
        except Exception as e:
            logger.error(f"Gemini API failed: {e}")

    logger.warning("No valid AI API providers succeeded or keys are missing.")
    return None

def _parse_json_response(raw_text: str) -> Optional[Dict]:
    """Helper to clean and parse JSON from LLMs safely."""
    # Sometimes LLMs wrap response in markdown code blocks despite instructions
    clean_text = raw_text.strip()
    if clean_text.startswith("```json"):
        clean_text = clean_text[7:]
    if clean_text.startswith("```"):
        clean_text = clean_text[3:]
    if clean_text.endswith("```"):
        clean_text = clean_text[:-3]
        
    try:
        data = json.loads(clean_text.strip())
        # Support new paired format
        if "paired_insights" in data:
            return data
        # Legacy fallback: convert old format to new 
        if "insights" in data and "recommendations" in data:
            paired = []
            insights = data["insights"]
            recs = data["recommendations"]
            for i in range(max(len(insights), len(recs))):
                paired.append({
                    "insight": insights[i] if i < len(insights) else "",
                    "recommendation": recs[i] if i < len(recs) else "",
                    "is_key": i < 2
                })
            return {"paired_insights": paired}
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from AI: {e}\nRaw output: {raw_text}")
    
    return None
