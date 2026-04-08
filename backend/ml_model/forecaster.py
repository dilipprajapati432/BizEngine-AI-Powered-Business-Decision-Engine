import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression


def generate_forecast(df: pd.DataFrame, periods: int = 6):
    """
    Predictive Analytics Engine.
    
    Implements a Supervised Learning (Linear Regression) approach to 
    forecast monthly revenue based on historical time-series trends.
    
    Args:
        df: Processed Pandas DataFrame containing 'date' and 'revenue'.
        periods: Number of months to forecast into the future.
        
    Returns:
        tuple (forecast, metadata): List of forecast objects and model 
        confidence metadata (R-Squared score analysis).
    """
    empty_meta = {
        "model": "Linear Regression (sklearn)",
        "basis": "Insufficient historical data",
        "data_points": 0,
        "confidence": "Low",
    }

    if df is None or df.empty:
        return [], empty_meta

    df = df.dropna(subset=["date"]).copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])

    monthly = (
        df.groupby(df["date"].dt.to_period("M"))["revenue"]
        .sum()
        .reset_index()
    )
    monthly.columns = ["period", "revenue"]
    monthly = monthly.sort_values("period").reset_index(drop=True)

    if len(monthly) < 2:
        return [], empty_meta

    monthly["t"] = np.arange(len(monthly))

    X = monthly[["t"]].values
    y = monthly["revenue"].values

    model = LinearRegression()
    model.fit(X, y)

    # ── R² Score for Confidence ──────────────────────────────────────────
    r2 = model.score(X, y)
    if r2 >= 0.7:
        confidence = "High"
    elif r2 >= 0.4:
        confidence = "Medium"
    else:
        confidence = "Low"

    forecast_meta = {
        "model": "Linear Regression (sklearn)",
        "basis": "Historical monthly revenue aggregates",
        "data_points": int(len(monthly)),
        "r_squared": round(r2, 3),
        "confidence": confidence,
    }

    last_t = monthly["t"].max()
    last_period = monthly["period"].max()

    forecast = []

    # Append historical points
    for _, row in monthly.iterrows():
        forecast.append({
            "month": str(row["period"]),
            "actual": round(row["revenue"], 2),
            "predicted": None
        })

    # Connect the lines so discrete segments join elegantly
    if not monthly.empty:
        last_val = monthly.iloc[-1]["revenue"]
        forecast[-1]["predicted"] = round(last_val, 2)

    for i in range(1, periods + 1):
        future_t = last_t + i
        future_period = last_period + i
        predicted_revenue = float(model.predict([[future_t]])[0])
        predicted_revenue = max(0, predicted_revenue)  # clamp to non-negative
        forecast.append(
            {
                "month": str(future_period),
                "actual": None,
                "predicted": round(predicted_revenue, 2),
            }
        )

    return forecast, forecast_meta
