import pytest
from app.services.pii_stripper import pii_stripper

def test_strip_names():
    text = "My client Rahul Sharma was arrested on Friday."
    stripped = pii_stripper.strip_pii(text)
    assert "Rahul Sharma" not in stripped
    assert "[NAME]" in stripped

def test_strip_phones():
    text = "Call me at +91-9876543210 or 9876543210 immediately."
    stripped = pii_stripper.strip_pii(text)
    assert "+91-9876543210" not in stripped
    assert "9876543210" not in stripped
    assert "[PHONE]" in stripped

def test_strip_addresses():
    text = "The incident took place in Mumbai near the central park."
    stripped = pii_stripper.strip_pii(text)
    assert "Mumbai" not in stripped
    assert "[ADDRESS]" in stripped

def test_strip_case_numbers():
    text = "Regarding FIR No. 123/2023 and W.P. (C) 456/2024."
    stripped = pii_stripper.strip_pii(text)
    assert "FIR No. 123/2023" not in stripped
    assert "W.P. (C) 456/2024" not in stripped
    assert "[CASE_NUMBER]" in stripped

def test_mixed_pii():
    text = "Mr. Ankit Verma from Delhi (Phone: 9999988888) filed FIR No 12/2024."
    stripped = pii_stripper.strip_pii(text)
    assert "Ankit Verma" not in stripped
    assert "Delhi" not in stripped
    assert "9999988888" not in stripped
    assert "FIR No 12/2024" not in stripped
    assert "[NAME]" in stripped
    assert "[ADDRESS]" in stripped
    assert "[PHONE]" in stripped
    assert "[CASE_NUMBER]" in stripped
