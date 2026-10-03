import os
import uuid
import base64
import requests
from dotenv import load_dotenv
from Crypto.PublicKey import RSA
from Crypto.Hash import SHA256
from Crypto.Signature import PKCS1_v1_5

# Explicitly load .env file from the root directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(env_path)

IK_API_URL = "https://api.indiankanoon.org/search/"
IK_API_USER_ID = os.getenv("IK_API_USER_ID", "")


# Load the private key at module level
try:
    _key_path = os.path.join(os.path.dirname(__file__), "ik_private.pem")
    with open(_key_path, 'r') as f:
        _private_key = RSA.importKey(f.read())
except FileNotFoundError:
    _private_key = None

class IndianKanoonClient:
    """
    Production-grade IndianKanoon API client.
    Implements mandatory constraints: Request Signing using PKCS1_v1_5.
    """
    
    @staticmethod
    def _sign_message(message: bytes) -> bytes:
        if not _private_key:
            raise ValueError("ik_private.pem not found. Cannot sign request.")
        signer = PKCS1_v1_5.new(_private_key)
        digest = SHA256.new(message)
        return signer.sign(digest)

    @classmethod
    def search(cls, query: str, pagenum: int = 0, doctypes: str = "supremecourt", sortby: str = None) -> dict:
        if not IK_API_USER_ID:
            raise ValueError("IK_API_USER_ID is not set in environment variables.")

        # 1. Generate unique message
        raw_message = str(uuid.uuid4()).encode('utf-8')
        
        # 2. Sign message
        signature = cls._sign_message(raw_message)
        
        # 3. Base64 encode
        encoded_message = base64.b64encode(raw_message).decode('utf-8')
        encoded_signature = base64.b64encode(signature).decode('utf-8')
        
        headers = {
            "X-Customer": IK_API_USER_ID,
            "X-Message": encoded_message,
            "Authorization": f"HMAC {encoded_signature}",
            "Accept": "application/json",
            "User-Agent": "jurisAssist-Backend/1.0"
        }
        
        if doctypes:
            query = f"{query} doctypes: {doctypes}"
            
        if sortby:
            query = f"{query} sortby: {sortby}"
            
        payload = {
            "formInput": query,
            "pagenum": pagenum
        }
            
        response = requests.post(IK_API_URL, headers=headers, data=payload, timeout=10.0)
        
        if response.status_code == 403 or response.status_code == 401:
            raise Exception(f"IndianKanoon Authentication Failed ({response.status_code}): {response.text}")
            
        response.raise_for_status()
        return response.json()

    @classmethod
    def get_doc(cls, docid: str) -> dict:
        if not IK_API_USER_ID:
            raise ValueError("IK_API_USER_ID is not set in environment variables.")

        raw_message = str(uuid.uuid4()).encode('utf-8')
        signature = cls._sign_message(raw_message)
        
        encoded_message = base64.b64encode(raw_message).decode('utf-8')
        encoded_signature = base64.b64encode(signature).decode('utf-8')
        
        headers = {
            "X-Customer": IK_API_USER_ID,
            "X-Message": encoded_message,
            "Authorization": f"HMAC {encoded_signature}",
            "Accept": "application/json",
            "User-Agent": "jurisAssist-Backend/1.0"
        }
        
        url = f"https://api.indiankanoon.org/doc/{docid}/"
        response = requests.post(url, headers=headers, timeout=10.0)
        
        if response.status_code == 403 or response.status_code == 401:
            raise Exception(f"IndianKanoon Authentication Failed ({response.status_code}): {response.text}")
            
        response.raise_for_status()
        return response.json()
