import os
import pandas as pd
from flask import Blueprint, request, jsonify, session
from utils.memory_store import store
import uuid
from utils.data_cleaner import clean_dataframe

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route("/upload", methods=["POST"])
def upload_file():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided."}), 400

        file = request.files["file"]
        if file.filename == "" or not allowed_file(file.filename):
            return jsonify({"error": "Invalid or no file selected."}), 400

        try:
            ext = file.filename.rsplit(".", 1)[1].lower()
            if ext == "csv":
                # Fallback encoding to handle common enterprise datasets
                try:
                    df = pd.read_csv(file.stream, encoding='utf-8')
                except UnicodeDecodeError:
                    file.stream.seek(0)
                    df = pd.read_csv(file.stream, encoding='windows-1252')
            else:
                df = pd.read_excel(file.stream)
        except Exception as e:
            return jsonify({"error": f"Could not parse file structure: {str(e)}"}), 400

        # ── Business Schema Validation ──────────────────────────────────────────
        MAX_ROWS = 50000
        if len(df) > MAX_ROWS:
            return jsonify({"error": f"File too large. Maximum allowed is {MAX_ROWS} rows."}), 400
        
        if len(df) == 0:
            return jsonify({"error": "The uploaded file is empty."}), 400

        # Pre-clean to normalize columns and handle synonyms (e.g., 'Amount' -> 'revenue')
        df = clean_dataframe(df)

        # We need at least these to generate meaningful analytics
        required_cols = {"date", "product", "revenue"}
        missing = required_cols - set(df.columns)
        if missing:
            return jsonify({
                "error": f"Missing critical business columns: {', '.join(missing)}.",
                "suggestion": "Ensure your file contains 'Date', 'Product', and 'Revenue' (case-insensitive)."
            }), 400

        # ── Session & Memory Storage ────────────────────────────────────────────
        if "uid" not in session:
            session["uid"] = str(uuid.uuid4())
        
        uid = session["uid"]
        store.save_data(uid, df)

        preview = df.head(10).where(pd.notna(df), None).to_dict(orient="records")
        return jsonify(
            {
                "message": f"Ingested {len(df)} records temporarily into memory.",
                "columns": list(df.columns),
                "preview": preview,
                "total_rows": len(df),
            }
        ), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server process error: {str(e)}"}), 500
