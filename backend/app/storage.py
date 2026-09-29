import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

STORAGE_BUCKET = "case-documents"

def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable is not set.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def create_signed_upload_url(doc_id: str, filename: str) -> tuple[str, str]:
    """Generate a signed URL that allows the frontend to upload a file directly to Supabase Storage."""
    client = get_supabase()
    # Path in the bucket: <doc_id>/<original_filename>
    file_path = f"{doc_id}/{filename}"
    result = client.storage.from_(STORAGE_BUCKET).create_signed_upload_url(file_path)
    signed_url = result.get("signed_url") or result.get("signedUrl")
    return signed_url, file_path


def create_signed_download_url(file_path: str, expires_in: int = 3600) -> str:
    """Generate a short-lived signed URL for reading a file (1 hour default)."""
    client = get_supabase()
    result = client.storage.from_(STORAGE_BUCKET).create_signed_url(file_path, expires_in)
    signed_url = result.get("signed_url") or result.get("signedUrl")
    return signed_url
