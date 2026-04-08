import pandas as pd
from flask import Blueprint, request, jsonify, session
from utils.memory_store import store

analytics_bp = Blueprint("analytics", __name__)

def get_session_df():
    """
    Retrieves the DataFrame from the in-memory store for the current session.
    Fulfills non-persistence requirements.
    """
    uid = session.get("uid")
    if not uid:
        return None
    return store.get_data(uid)

@analytics_bp.route("/analytics", methods=["GET"])
def analytics():
    # Optional filters
    product_filter = request.args.get("product")
    region_filter = request.args.get("region")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    df = get_session_df()
    if df is None or df.empty:
        return jsonify({"error": "No data found. Please upload a dataset first."}), 404

    # Ensure date is always Timestamp for comparison
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    
    if product_filter:
        df = df[df["product"].str.lower() == product_filter.lower()]
    if region_filter:
        df = df[df["region"].str.lower() == region_filter.lower()]
    if date_from:
        df = df[df["date"] >= pd.to_datetime(date_from)]
    if date_to:
        df = df[df["date"] <= pd.to_datetime(date_to)]

    if df.empty:
        return jsonify({
            "kpis": {"total_revenue": 0, "total_units": 0, "avg_order_value": 0, "growth_rate": 0},
            "top_products": [], "region_data": [], "category_data": [], "sales_trend": [],
            "filter_options": {"products": [], "regions": []}
        }), 200

    # KPIs
    total_revenue = round(float(df["revenue"].sum()), 2)
    total_units = int(df["units_sold"].sum())
    avg_order_value = round(float(df["revenue"].mean()), 2) if not df.empty else 0

    # Month-over-month growth
    df_sorted = df.dropna(subset=["date"]).sort_values("date")
    if not df_sorted.empty:
        monthly = df_sorted.groupby(df_sorted["date"].dt.to_period("M"))["revenue"].sum()
        if len(monthly) >= 2:
            prev, curr = monthly.iloc[-2], monthly.iloc[-1]
            growth_rate = round(float(((curr - prev) / prev) * 100), 2) if prev != 0 else 0
        else:
            growth_rate = 0
    else:
        growth_rate = 0

    # Top products by revenue
    top_products = (
        df.groupby("product")["revenue"].sum().sort_values(ascending=False).head(5).reset_index()
    )
    top_products = top_products.rename(columns={"revenue": "total_revenue"}).to_dict(orient="records")

    # Region breakdown
    region_data = (
        df.groupby("region")["revenue"].sum().reset_index()
        .rename(columns={"revenue": "total_revenue"})
        .to_dict(orient="records")
    ) if "region" in df.columns else []

    # Category breakdown
    category_data = (
        df.groupby("category")["revenue"].sum().reset_index()
        .rename(columns={"revenue": "total_revenue"})
        .to_dict(orient="records")
    ) if "category" in df.columns else []

    # Sales trend (monthly)
    sales_trend = (
        df_sorted.groupby(df_sorted["date"].dt.to_period("M"))["revenue"]
        .sum()
        .reset_index()
    )
    sales_trend["date"] = sales_trend["date"].astype(str)
    sales_trend_list = sales_trend.rename(columns={"revenue": "revenue"}).to_dict(orient="records")

    # Filter options
    products = sorted(df["product"].dropna().unique().tolist()) if "product" in df.columns else []
    regions = sorted(df["region"].dropna().unique().tolist()) if "region" in df.columns else []

    return jsonify(
        {
            "kpis": {
                "total_revenue": total_revenue,
                "total_units": total_units,
                "avg_order_value": avg_order_value,
                "growth_rate": growth_rate,
            },
            "top_products": top_products,
            "region_data": region_data,
            "category_data": category_data,
            "sales_trend": sales_trend_list,
            "filter_options": {"products": products, "regions": regions},
        }
    ), 200
