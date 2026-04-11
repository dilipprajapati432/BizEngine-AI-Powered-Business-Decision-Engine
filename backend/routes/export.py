import io
import csv
import pandas as pd
from flask import Blueprint, jsonify, send_file, session
from utils.memory_store import store
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

export_bp = Blueprint("export", __name__)

# ── Shared data helpers ─────────────────────────────────────────────────────
def _get_report_data():
    """Fetch and aggregate data from session MemoryStore."""
    uid = session.get("uid")
    if not uid:
        return None
    
    df = store.get_data(uid)
    if df is None or df.empty:
        return None

    # Ensure format consistency
    df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce").fillna(0)
    df["units_sold"] = pd.to_numeric(df["units_sold"], errors="coerce").fillna(0)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    total_revenue = round(df["revenue"].sum(), 2)
    total_units = int(df["units_sold"].sum())
    avg_order = round(df["revenue"].mean(), 2) if len(df) > 0 else 0

    df_sorted = df.dropna(subset=["date"]).sort_values("date")
    monthly = df_sorted.groupby(df_sorted["date"].dt.to_period("M"))["revenue"].sum()
    if len(monthly) >= 2:
        prev_m, curr_m = monthly.iloc[-2], monthly.iloc[-1]
        growth = round(((curr_m - prev_m) / prev_m) * 100, 2) if prev_m != 0 else 0
    else:
        growth = 0

    # Get comprehensive insights (matches UI exactly)
    try:
        from routes.insights import build_insights_for_df
        insights_pkg = store.get_insights(uid)
        if not insights_pkg:
            insights_pkg = build_insights_for_df(df)
            store.save_insights(uid, insights_pkg)
        insight_rows = insights_pkg.get("paired_insights", [])
    except Exception as e:
        print(f"Export insight generation failed: {e}")
        insight_rows = []

    # Top products (fallback simple calculation for PDF summary table if needed)
    top_products = []
    if "product" in df.columns:
        prod_rev = df.groupby("product")["revenue"].sum().sort_values(ascending=False).head(5)
        for p, v in prod_rev.items():
            pct = round((v / total_revenue) * 100, 1) if total_revenue > 0 else 0
            top_products.append({"name": p, "revenue": round(v, 2), "pct": pct})

    return {
        "df": df,
        "total_revenue": total_revenue,
        "total_units": total_units,
        "avg_order": avg_order,
        "growth": growth,
        "insights": insight_rows,
        "top_products": top_products,
    }


# ── CSV Export (existing) ───────────────────────────────────────────────────
@export_bp.route("/export/csv", methods=["GET"])
def export_csv():
    uid = session.get("uid")
    df = store.get_data(uid) if uid else None
    
    if df is None or df.empty:
        return jsonify({"error": "No data to export."}), 404

    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["date", "product", "category", "region", "units_sold", "unit_price", "revenue"],
    )
    writer.writeheader()
    # Export rows
    for _, row in df.iterrows():
        # Clean row for CSV (dates to string)
        r_dict = row.to_dict()
        if isinstance(r_dict.get("date"), pd.Timestamp):
            r_dict["date"] = r_dict["date"].isoformat()[:10]
        writer.writerow({k: v for k, v in r_dict.items() if k in writer.fieldnames})

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype="text/csv",
        as_attachment=True,
        download_name="business_data_export.csv",
    )


# ── CSV Report ──────────────────────────────────────────────────────────────
@export_bp.route("/export/report", methods=["GET"])
def export_report():
    data = _get_report_data()
    if not data:
        return jsonify({"error": "No data to export."}), 404

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["=== KEY PERFORMANCE INDICATORS ==="])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Revenue", f"${data['total_revenue']:,.2f}"])
    writer.writerow(["Total Units Sold", f"{data['total_units']:,}"])
    writer.writerow(["Average Order Value", f"${data['avg_order']:,.2f}"])
    writer.writerow(["MoM Growth Rate", f"{data['growth']}%"])
    writer.writerow([])

    writer.writerow(["=== AI-GENERATED INSIGHTS ==="])
    writer.writerow(["#", "Type", "Insight", "Recommendation", "Key Insight?"])
    for i, pair in enumerate(data["insights"], 1):
        writer.writerow([
            i, "KEY" if pair.get("is_key") else "Standard",
            pair.get("insight", ""), pair.get("recommendation", ""),
            "Yes" if pair.get("is_key") else "No"
        ])
    writer.writerow([])

    writer.writerow(["=== PROCESSED DATASET ==="])
    fields = ["date", "product", "category", "region", "units_sold", "unit_price", "revenue"]
    writer.writerow(fields)
    for _, row in data["df"].iterrows():
        r_dict = row.to_dict()
        if isinstance(r_dict.get("date"), pd.Timestamp):
            r_dict["date"] = r_dict["date"].isoformat()[:10]
        writer.writerow([r_dict.get(f, "") for f in fields])

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype="text/csv", as_attachment=True,
        download_name="business_intelligence_report.csv",
    )


# ── PDF Report ──────────────────────────────────────────────────────────────
@export_bp.route("/export/pdf", methods=["GET"])
def export_pdf():
    data = _get_report_data()
    if not data:
        return jsonify({"error": "No data to export."}), 404

    buffer = io.BytesIO()

    # Colors
    PRIMARY = HexColor("#6366f1")
    DARK_BG = HexColor("#0f172a")
    ACCENT = HexColor("#22d3ee")
    SUCCESS = HexColor("#10b981")
    WARNING = HexColor("#f59e0b")
    TEXT = HexColor("#1e293b")
    TEXT_LIGHT = HexColor("#64748b")
    WHITE = HexColor("#ffffff")
    LIGHT_BG = HexColor("#f8fafc")
    BORDER = HexColor("#e2e8f0")

    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=25 * mm, rightMargin=25 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Title"],
        fontSize=22, leading=28, textColor=PRIMARY,
        spaceAfter=4, fontName="Helvetica-Bold"
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle", parent=styles["Normal"],
        fontSize=10, textColor=TEXT_LIGHT, spaceAfter=16
    )
    section_style = ParagraphStyle(
        "SectionHeader", parent=styles["Heading2"],
        fontSize=13, leading=18, textColor=PRIMARY,
        spaceBefore=20, spaceAfter=10, fontName="Helvetica-Bold"
    )
    body_style = ParagraphStyle(
        "BodyText", parent=styles["Normal"],
        fontSize=9, leading=14, textColor=TEXT
    )
    key_style = ParagraphStyle(
        "KeyInsight", parent=styles["Normal"],
        fontSize=9, leading=14, textColor=HexColor("#92400e"),
        fontName="Helvetica-Bold"
    )
    rec_style = ParagraphStyle(
        "Recommendation", parent=styles["Normal"],
        fontSize=8.5, leading=13, textColor=TEXT_LIGHT,
        leftIndent=12
    )

    elements = []

    # ── Title ────────────────────────────────────────────────────────────
    elements.append(Paragraph("BizEngine Intelligence Report", title_style))
    elements.append(Paragraph("AI-Powered Business Decision Engine — Comprehensive Analysis", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=16))

    # ── KPIs ─────────────────────────────────────────────────────────────
    elements.append(Paragraph("📊 Key Performance Indicators", section_style))

    kpi_data = [
        ["Metric", "Value"],
        ["Total Revenue", f"${data['total_revenue']:,.2f}"],
        ["Total Units Sold", f"{data['total_units']:,}"],
        ["Average Order Value", f"${data['avg_order']:,.2f}"],
        ["MoM Growth Rate", f"{data['growth']}%"],
        ["Total Transactions", f"{len(data['df']):,}"],
    ]
    kpi_table = Table(kpi_data, colWidths=[200, 280])
    kpi_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), LIGHT_BG),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (1, 1), (1, -1), TEXT),
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 8))

    # ── Top Products ─────────────────────────────────────────────────────
    if data["top_products"]:
        elements.append(Paragraph("🏆 Top Products by Revenue", section_style))
        prod_data = [["#", "Product", "Revenue", "Contribution"]]
        for i, p in enumerate(data["top_products"], 1):
            prod_data.append([
                str(i), p["name"],
                f"${p['revenue']:,.2f}", f"{p['pct']}%"
            ])
        prod_table = Table(prod_data, colWidths=[30, 230, 120, 100])
        prod_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ]))
        elements.append(prod_table)
        elements.append(Spacer(1, 8))

    # ── AI Insights ──────────────────────────────────────────────────────
    if data["insights"]:
        elements.append(Paragraph("🧠 AI-Generated Insights & Recommendations", section_style))

        for i, pair in enumerate(data["insights"], 1):
            is_key = pair.get("is_key", False)
            prefix = "🔥 KEY INSIGHT" if is_key else f"Insight {i}"
            style = key_style if is_key else body_style

            elements.append(Paragraph(f"<b>{prefix}:</b> {pair.get('insight', '')}", style))
            if pair.get("recommendation"):
                elements.append(Paragraph(f"→ <i>{pair.get('recommendation', '')}</i>", rec_style))
            elements.append(Spacer(1, 6))

    # ── Data Sample ──────────────────────────────────────────────────────
    elements.append(Paragraph("📋 Data Sample (First 15 Rows)", section_style))

    sample_df = data["df"].head(15)
    cols = ["date", "product", "category", "region", "units_sold", "revenue"]
    available_cols = [c for c in cols if c in sample_df.columns]

    header = [c.replace("_", " ").title() for c in available_cols]
    table_data = [header]
    for _, row in sample_df.iterrows():
        table_row = []
        for c in available_cols:
            val = row[c]
            if c == "date":
                val = str(val)[:10]
            elif c == "revenue":
                val = f"${float(val):,.2f}"
            elif c == "units_sold":
                val = str(int(float(val)))
            else:
                val = str(val)[:20]
            table_row.append(val)
        table_data.append(table_row)

    col_widths = [68, 100, 75, 65, 55, 80][:len(available_cols)]
    data_table = Table(table_data, colWidths=col_widths)
    data_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("ALIGN", (-1, 0), (-1, -1), "RIGHT"),
        ("ALIGN", (-2, 0), (-2, -1), "CENTER"),
    ]))
    elements.append(data_table)

    # ── Footer ───────────────────────────────────────────────────────────
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=8))
    footer_style = ParagraphStyle(
        "Footer", parent=styles["Normal"],
        fontSize=7.5, textColor=TEXT_LIGHT, alignment=TA_CENTER
    )
    elements.append(Paragraph("Generated by BizEngine — AI-Powered Business Decision Engine", footer_style))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)

    return send_file(
        buffer, mimetype="application/pdf",
        as_attachment=True,
        download_name="BizEngine_Intelligence_Report.pdf",
    )
