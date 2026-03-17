from unittest.mock import AsyncMock, patch

import pytest


@pytest.fixture
def mock_article_from_wikipedia():
    return (
        "Python (programming language)",
        "Python is a high-level programming language. It is used for web development and data science.",
        "https://en.wikipedia.org/wiki/Python_(programming_language)",
    )


def test_get_article_returns_detail(client, mock_article_from_wikipedia):
    title, extract, wikipedia_url = mock_article_from_wikipedia
    with patch(
        "features.articles.controllers.get_article_from_wikipedia",
        new_callable=AsyncMock,
        return_value=mock_article_from_wikipedia,
    ):
        response = client.get("/articles/123")

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == title
    assert "summary" in data
    assert data["word_count"] > 0
    assert isinstance(data["top_words"], list)
    assert data["wikipedia_url"] == wikipedia_url


def test_get_article_not_found_returns_404(client):
    from features.articles.services import ArticleNotFoundError

    with patch(
        "features.articles.controllers.get_article_from_wikipedia",
        new_callable=AsyncMock,
        side_effect=ArticleNotFoundError("not found"),
    ):
        response = client.get("/articles/99999999")

    assert response.status_code == 404
    assert "not found" in response.json().get("detail", "").lower()


def test_get_article_invalid_id_returns_400(client):
    response = client.get("/articles/abc")
    assert response.status_code == 400
