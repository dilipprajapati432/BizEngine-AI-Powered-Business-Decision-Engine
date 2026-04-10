from flask import Blueprint, jsonify, session
from utils.memory_store import store
from ml_model.forecaster import generate_forecast
from utils.anonymizer import scrub_pii

insights_bp = Blueprint("insights", __name__)

def get_session_df():
    """Retrieves session-isolated data for analysis."""
    uid = session.get("uid")
    if not uid:
        return None
    return store.get_data(uid)

def build_insights_for_df(df):
    warnings = []
    total_revenue = float(df["revenue"].sum())
    total_units = int(df["units_sold"].sum())

    # ── Percentage Contributions ────────────────────────────────────────────
    contributions = {}

    # Product contributions
    has_product = "product" in df.columns and df["product"].nunique() > 1
    if has_product:
        product_rev = df.groupby("product")["revenue"].sum().sort_values(ascending=False)
        top_prod = str(product_rev.index[0])
        top_prod_val = float(product_rev.iloc[0])
        top_prod_pct = float(round((top_prod_val / total_revenue) * 100, 1)) if total_revenue > 0 else 0.0
        bottom_prod = str(product_rev.index[-1])
        bottom_prod_val = float(product_rev.iloc[-1])
        bottom_prod_pct = float(round((bottom_prod_val / total_revenue) * 100, 1)) if total_revenue > 0 else 0.0
        weak = product_rev[product_rev < product_rev.mean() * 0.5]
        contributions["top_product"] = {"name": top_prod, "pct": top_prod_pct, "revenue": float(round(top_prod_val, 2))}
        contributions["bottom_product"] = {"name": bottom_prod, "pct": bottom_prod_pct, "revenue": float(round(bottom_prod_val, 2))}
    elif "product" in df.columns:
        warnings.append("Only 1 product in dataset — product comparison not available.")
        has_product = False
    else:
        warnings.append("No product column detected in dataset.")

    # Region contributions
    has_region = "region" in df.columns and df["region"].nunique() > 1
    if has_region:
        region_rev = df.groupby("region")["revenue"].sum().sort_values(ascending=False)
        top_region = str(region_rev.index[0])
        top_region_val = float(region_rev.iloc[0])
        top_region_pct = float(round((top_region_val / total_revenue) * 100, 1)) if total_revenue > 0 else 0.0
        low_region = str(region_rev.index[-1])
        low_region_val = float(region_rev.iloc[-1])
        low_region_pct = float(round((low_region_val / total_revenue) * 100, 1)) if total_revenue > 0 else 0.0
        contributions["top_region"] = {"name": top_region, "pct": top_region_pct, "revenue": float(round(top_region_val, 2))}
        contributions["bottom_region"] = {"name": low_region, "pct": low_region_pct, "revenue": float(round(low_region_val, 2))}
    elif "region" in df.columns:
        warnings.append("Only 1 region in dataset — regional comparison not available.")
        has_region = False
    else:
        warnings.append("No region column detected in dataset.")

    # Category contributions
    has_category = "category" in df.columns and df["category"].nunique() > 1
    if has_category:
        cat_rev = df.groupby("category")["revenue"].sum().sort_values(ascending=False)
        top_cat = str(cat_rev.index[0])
        top_cat_val = float(cat_rev.iloc[0])
        top_cat_pct = float(round((top_cat_val / total_revenue) * 100, 1)) if total_revenue > 0 else 0.0
        contributions["top_category"] = {"name": top_cat, "pct": top_cat_pct, "revenue": float(round(top_cat_val, 2))}
    elif "category" in df.columns:
        warnings.append("Only 1 category — category analysis not available.")
    else:
        warnings.append("No category column detected in dataset.")

    # ── Month-over-month trend ──────────────────────────────────────────────
    monthly = []
    prev, curr, pct, direction = 0, 0, 0, ""
    df_sorted = df.dropna(subset=["date"]).sort_values("date")
    has_dates = not df_sorted.empty
    if has_dates:
        monthly = df_sorted.groupby(df_sorted["date"].dt.to_period("M"))["revenue"].sum()
        if len(monthly) >= 2:
            prev, curr = float(monthly.iloc[-2]), float(monthly.iloc[-1])
            if prev > 0:
                pct = float(round(((curr - prev) / prev) * 100, 1))
                direction = "growth" if pct >= 0 else "decline"
        else:
            warnings.append("Only 1 month of data — trend analysis not available.")
    else:
        warnings.append("No valid date column — time-based analysis unavailable.")

    # ── Summary for AI ──────────────────────────────────────────────────────
    summary_parts = []
    summary_parts.append(f"- Total Revenue: ${total_revenue:,.2f}")
    summary_parts.append(f"- Total Units Sold: {int(total_units):,}")
    summary_parts.append(f"- Total Rows/Transactions: {len(df):,}")

    if has_product:
        summary_parts.append(f"- Top Product: '{top_prod}' — ${top_prod_val:,.2f} ({top_prod_pct}% of total)")
        summary_parts.append(f"- Weakest Product: '{bottom_prod}' — ${bottom_prod_val:,.2f} ({bottom_prod_pct}% of total)")
        if not weak.empty:
            weak_details = ", ".join([f"'{p}' ({round((v/total_revenue)*100,1)}%)" for p, v in weak.head(3).items()])
            summary_parts.append(f"- Below-average Products: {weak_details}")

    if has_region:
        summary_parts.append(f"- Top Region: '{top_region}' — ${top_region_val:,.2f} ({top_region_pct}% of total)")
        summary_parts.append(f"- Weakest Region: '{low_region}' — ${low_region_val:,.2f} ({low_region_pct}% of total)")

    if has_category:
        summary_parts.append(f"- Top Category: '{top_cat}' — ${top_cat_val:,.2f} ({top_cat_pct}% of total)")

    if has_dates and len(monthly) >= 2 and prev > 0:
        summary_parts.append(f"- Recent MoM Trend: {pct}% {direction} from {monthly.index[-2]} to {monthly.index[-1]}")

    if warnings:
        summary_parts.append(f"- Data Limitations: {'; '.join(warnings)}")

    summary_text = scrub_pii("\n".join(summary_parts))

    # ── AI API Attempt ────────────────────────────────────────────────────
    from services.llm_service import get_llm_insights
    ai_result = get_llm_insights(summary_text)

    # ── Build Response ────────────────────────────────────────────────────
    paired_insights = []

    if ai_result and "paired_insights" in ai_result:
        paired_insights = ai_result["paired_insights"]
    else:
        # Fallback: data-driven rule-based paired insights
        paired_insights.append({
            "insight": f"Total revenue across {len(df):,} transactions is ${total_revenue:,.2f} with {int(total_units):,} units sold.",
            "recommendation": "Use this as a baseline to set quarterly revenue targets and track performance.",
            "is_key": True
        })

        if has_dates and len(monthly) >= 2 and prev > 0:
            paired_insights.append({
                "insight": f"Revenue showed {abs(pct)}% {direction} from {monthly.index[-2]} to {monthly.index[-1]} (${prev:,.2f} → ${curr:,.2f}).",
                "recommendation": f"{'Investigate the root cause of declining revenue and consider promotional campaigns.' if pct < 0 else 'Maintain current strategy and consider scaling successful channels.'}",
                "is_key": True if abs(pct) > 10 else False
            })

        if has_product:
            paired_insights.append({
                "insight": f"Product '{top_prod}' contributes {top_prod_pct}% of total revenue (${top_prod_val:,.2f}), while '{bottom_prod}' contributes only {bottom_prod_pct}% (${bottom_prod_val:,.2f}).",
                "recommendation": f"Increase marketing spend on '{top_prod}' and evaluate whether '{bottom_prod}' should be discounted or discontinued.",
                "is_key": False
            })
            if not weak.empty:
                weak_names = ", ".join([f"'{p}'" for p in weak.index.tolist()[:3]])
                paired_insights.append({
                    "insight": f"Low-performing products below 50% of average revenue: {weak_names}.",
                    "recommendation": f"Consider bundling or running clearance promotions on {weak_names} to improve sell-through.",
                    "is_key": False
                })

        if has_region:
            paired_insights.append({
                "insight": f"Region '{top_region}' leads with {top_region_pct}% of revenue (${top_region_val:,.2f}). '{low_region}' trails at {low_region_pct}% (${low_region_val:,.2f}).",
                "recommendation": f"Invest in market penetration for '{low_region}' region — potential untapped growth opportunity.",
                "is_key": False
            })

        if has_category:
            paired_insights.append({
                "insight": f"Category '{top_cat}' dominates with {top_cat_pct}% contribution (${top_cat_val:,.2f}).",
                "recommendation": f"Diversify product mix if '{top_cat}' concentration exceeds 60% to reduce revenue risk.",
                "is_key": False
            })

    # ── ML Forecast (Always Runs) ──────────────────────────────────────────
    forecast, forecast_meta = generate_forecast(df)

    return {
        "paired_insights": paired_insights,
        "contributions": contributions,
        "warnings": warnings,
        "forecast": forecast,
        "forecast_meta": forecast_meta,
    }


@insights_bp.route("/insights", methods=["GET"])
def insights():
    """
    Main AI Intelligence endpoint. 
    1. Performs statistical forensics (Percentage contributions, top/bottom performers).
    2. Generates a multi-period revenue forecast via ML.
    3. Narrates findings using a LLM (Groq/Gemini), pairing every insight with a 
       specific data-backed recommendation.
    """
    try:
        df = get_session_df()

        if df is None:
            return jsonify({"error": "No data available."}), 404

        data = build_insights_for_df(df)
        return jsonify(data), 200
    except Exception as e:
        import traceback
        return jsonify({"error": f"Internal Server Error: {str(e)}", "traceback": traceback.format_exc()}), 400
