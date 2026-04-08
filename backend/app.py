import os
from flask import Flask, session
from flask_cors import CORS
from dotenv import load_dotenv

import uuid
from routes.upload import upload_bp
from routes.analytics import analytics_bp
from routes.insights import insights_bp
from routes.export import export_bp
from routes.chat import chat_bp

def create_app():
    """
    Application Factory for BizEngine.
    
    Configures the Flask instance, initializes the database (SQLAlchemy),
    enables Cross-Origin Resource Sharing (CORS), and registers 
    modular blueprints for Uploads, Analytics, Insights, and AI Features.
    """
    load_dotenv()
    app = Flask(__name__)
    app.secret_key = os.environ.get("SECRET_KEY", "privacy-first-secret-8877")

    # ── Configuration ───────────────────────────────────────────────────────────
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB

    # ── Extensions ──────────────────────────────────────────────────────────────
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    CORS(app, origins=[frontend_url], supports_credentials=True)

    # ── Blueprints ──────────────────────────────────────────────────────────────
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api")
    app.register_blueprint(insights_bp, url_prefix="/api")
    app.register_blueprint(export_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")

    @app.route("/")
    def index():
        return {"status": "Backend running in Non-Persistent Privacy Mode."}

    @app.route("/api/logout", methods=["POST"])
    def logout():
        from utils.memory_store import store
        uid = session.get("uid")
        if uid:
            store.clear_data(uid)
            session.clear()
        return {"message": "Session purged successfully."}

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
