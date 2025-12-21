"""
Router for article operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from database import get_database
from models.article import ArticleResponse
from services.article_service import fetch_external_articles

router = APIRouter(
    prefix="/api/articles",
    tags=["Articles"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    category: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db = Depends(get_database)
):
    """
    Retrieve articles from the database.
    Optionally filter by category.
    """
    query = {}
    if category:
        query["category"] = category

    cursor = db.articles.find(query).sort("published_at", -1).skip(skip).limit(limit)
    
    articles = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        articles.append(ArticleResponse(**doc))
        
    return articles

@router.post("/refresh", status_code=status.HTTP_200_OK)
async def refresh_articles():
    """
    Trigger a fetch of new articles from external sources.
    This would typically be protected or run via a scheduler.
    """
    count = await fetch_external_articles()
    return {"message": "Articles refreshed successfully", "new_articles_count": count}