import pandas as pd

COLUMN_ALIASES = {
    "date": ["date", "order_date", "sale_date", "transaction_date", "period"],
    "product": ["product", "product_name", "item", "item_name", "sku"],
    "category": ["category", "category_name", "type", "segment"],
    "region": ["region", "area", "territory", "location", "market", "state"],
    "units_sold": ["units_sold", "quantity", "qty", "units", "count", "sales_qty"],
    "unit_price": ["unit_price", "price", "price_per_unit", "selling_price", "rate"],
    "revenue": ["revenue", "total_revenue", "sales", "total_sales", "amount", "total"],
}


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Rename columns using alias mapping."""
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    rename_map = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in df.columns and canonical not in df.columns:
                rename_map[alias] = canonical
    return df.rename(columns=rename_map)


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = _normalize_columns(df)

    # Drop fully empty rows
    df = df.dropna(how="all")

    # Parse date
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce", dayfirst=True)
    else:
        df["date"] = pd.NaT

    # Numeric coercion
    for col in ["units_sold", "unit_price", "revenue"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Derive revenue if missing
    if "revenue" not in df.columns:
        if "units_sold" in df.columns and "unit_price" in df.columns:
            df["revenue"] = df["units_sold"] * df["unit_price"]
        else:
            df["revenue"] = None

    # Default units_sold to 1 if missing entirely
    if "units_sold" not in df.columns:
        df["units_sold"] = 1.0

    # Fill missing numerics with defaults
    for col, default_val in [("units_sold", 1.0), ("unit_price", 0.0), ("revenue", 0.0)]:
        if col in df.columns:
            df[col] = df[col].fillna(default_val)

    # Fill missing string cols with Unknown
    for col in ["product", "category", "region"]:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown")
        else:
            df[col] = "Unknown"

    return df
