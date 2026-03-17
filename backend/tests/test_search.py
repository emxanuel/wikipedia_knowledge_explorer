from unittest.mock import AsyncMock, patch

import pytest

from features.search.schemas import SearchResult


@pytest.fixture
def mock_wikipedia_response() -> list[SearchResult]:
    return [
        SearchResult(
            id="123",
            title="Python (lenguaje de programación)",
            snippet="Python es un lenguaje de programación de alto nivel...",
        )
    ]


def test_search_returns_mapped_results(client, mock_wikipedia_response):
    with patch(
        "features.search.controllers.search_wikipedia",
        new_callable=AsyncMock,
        return_value=mock_wikipedia_response,
    ):
        response = client.get("/search", params={"q": "python"})

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == "123"
    assert data[0]["title"] == "Python (lenguaje de programación)"
    assert "snippet" in data[0]
    assert "Python es un lenguaje" in data[0]["snippet"]


def test_search_empty_q_returns_400(client):
    response = client.get("/search", params={"q": ""})
    assert response.status_code == 400
    assert "q" in response.json().get("detail", "").lower() or "required" in response.json().get("detail", "").lower()


def test_search_missing_q_returns_400(client):
    response = client.get("/search")
    assert response.status_code == 400
