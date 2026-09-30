import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from app.services.llm_chain import generate_summary, _grounding_check, summary_cache, breaker

def test_grounding_check_pass():
    fragment = "The court observed in Section 482 that the FIR must be quashed in 2021."
    summary = "The court quashed the FIR under Section 482 in 2021."
    assert _grounding_check(summary, fragment) == True

def test_grounding_check_fail_section():
    fragment = "The court observed in Section 482."
    summary = "The court observed in Section 482 and Section 302."
    assert _grounding_check(summary, fragment) == False

def test_grounding_check_fail_year():
    fragment = "This case was decided today."
    summary = "This case was decided in 2023."
    assert _grounding_check(summary, fragment) == False

@pytest.mark.asyncio
async def test_llm_chain_fallback_on_timeout():
    # Mock the _call_provider to always raise a TimeoutError
    with patch("app.services.llm_chain._call_provider", new_callable=AsyncMock) as mock_call:
        mock_call.side_effect = asyncio.TimeoutError("Timeout")
        
        # Ensure cache and breaker are clear
        summary_cache.clear()
        breaker.failures.clear()
        
        res = await generate_summary("doc123", "quash FIR", "The fragment")
        
        # Should fallback to excerpt
        assert res["provider"] == "fallback"
        assert "excerpt, no AI summary" in res["ai_summary"]

@pytest.mark.asyncio
async def test_llm_chain_grounding_rejection():
    # Mock the _call_provider to return a hallucinated summary
    with patch("app.services.llm_chain._call_provider", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = "The court quashed under Section 302." # 302 is not in fragment
        
        summary_cache.clear()
        breaker.failures.clear()
        
        res = await generate_summary("doc123", "quash FIR", "The fragment mentions Section 482.")
        
        # Grounding check should fail, falling back
        assert res["provider"] == "fallback"
        assert "excerpt, no AI summary" in res["ai_summary"]

@pytest.mark.asyncio
async def test_llm_chain_success_and_cache():
    # Mock the _call_provider to return a valid summary
    with patch("app.services.llm_chain._call_provider", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = "The court quashed under Section 482."
        
        summary_cache.clear()
        breaker.failures.clear()
        
        # First call
        res1 = await generate_summary("doc123", "quash FIR", "The fragment mentions Section 482.")
        assert res1["provider"] == "mock", f"Expected mock, got: {res1}"
        assert "AI-generated" in res1["ai_summary"]
        assert res1["cache_hit"] == False
        
        # Second call (should hit cache)
        res2 = await generate_summary("doc123", "quash FIR", "The fragment mentions Section 482.")
        assert res2["provider"] == "mock"
        assert res2["cache_hit"] == True
