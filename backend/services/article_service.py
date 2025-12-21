"""
Service for fetching and managing articles.
"""
import logging
import feedparser
import requests
from bs4 import BeautifulSoup
from typing import Optional
from datetime import datetime
from time import mktime
from database import get_database

logger = logging.getLogger(__name__)

# Target RSS Feed
RSS_FEED_URL = "https://www.sciencedaily.com/rss/health_medicine/menopause.xml"

def determine_category(title: str, summary: str) -> str:
    """
    Simple heuristic to categorize articles based on keywords.
    """
    text = (title + " " + summary).lower()
    
    nutrition_keywords = ['diet', 'food', 'nutrition', 'eat', 'vitamin', 'supplement', 'tea', 'coffee', 'sugar', 'protein', 'carb', 'fat']
    symptoms_keywords = ['symptom', 'pain', 'flash', 'sweat', 'sleep', 'insomnia', 'mood', 'anxiety', 'depression', 'fog', 'weight', 'ache']
    
    if any(k in text for k in nutrition_keywords):
        return 'Nutrition'
    if any(k in text for k in symptoms_keywords):
        return 'Symptoms'
    
    return 'Essential'

def extract_og_image(url: str) -> Optional[str]:
    """
    Fetches the URL and extracts the Open Graph image URL.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        # Short timeout to avoid blocking for too long
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            og_image = soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                return og_image["content"]
    except Exception as e:
        logger.warning(f"Error extracting OG image from {url}: {e}")
    
    return None

async def fetch_external_articles():
    """
    Fetches articles from the configured RSS feed and upserts them into the database.
    Returns the number of new articles added.
    """
    logger.info(f"Starting article fetch from {RSS_FEED_URL}")
    
    # Note: feedparser.parse is synchronous/blocking. 
    # In a heavy-load scenario, run this in a thread executor.
    feed = feedparser.parse(RSS_FEED_URL)
    
    if feed.bozo:
        logger.error(f"Error parsing RSS feed: {feed.bozo_exception}")
        # We might still have entries even if bozo is 1 (malformed XML), so we continue if entries exist
        if not feed.entries:
            return 0

    new_articles_count = 0
    db = await get_database()
    collection = db.articles

    for entry in feed.entries:
        try:
            # Extract basic fields
            title = entry.get('title', 'No Title')
            link = entry.get('link', '')
            
            # Skip if no link
            if not link:
                continue

            # Clean summary (sometimes contains HTML)
            # For simplicity, we take the summary as provided. 
            # Ideally, strip HTML tags if needed, but MNT usually provides clean text or basic HTML.
            summary = entry.get('summary', '')

            # Parse Publication Date
            published_at = datetime.utcnow()
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published_at = datetime.fromtimestamp(mktime(entry.published_parsed))

            # Attempt to extract image URL
            # RSS feeds vary wildly. MNT often uses media_content or similar extensions.
            image_url = None
            if 'media_content' in entry:
                # media_content is usually a list of dicts
                media = entry.media_content
                if media and isinstance(media, list) and 'url' in media[0]:
                    image_url = media[0]['url']
            elif 'media_thumbnail' in entry:
                media = entry.media_thumbnail
                if media and isinstance(media, list) and 'url' in media[0]:
                    image_url = media[0]['url']

            # Optimization: Check if article already exists with an image to avoid re-fetching
            existing_article = await collection.find_one({"url": link}, {"image_url": 1})
            
            if existing_article and existing_article.get("image_url"):
                # Use existing image if available and we didn't find one in RSS
                if not image_url:
                    image_url = existing_article["image_url"]
            
            # If still no image, try fetching from OG tags
            if not image_url:
                image_url = extract_og_image(link)

            # Prepare document
            category = determine_category(title, summary)
            
            article_doc = {
                "title": title,
                "summary": summary,
                "url": link,
                "image_url": image_url,
                "source": "ScienceDaily",
                "category": category,
                "published_at": published_at,
                "updated_at": datetime.utcnow()
            }

            # Upsert into database
            # Update if URL exists, Insert if not.
            result = await collection.update_one(
                {"url": link},
                {
                    "$set": article_doc,
                    "$setOnInsert": {"created_at": datetime.utcnow()}
                },
                upsert=True
            )

            # Check if it was an insert (upserted_id is present)
            if result.upserted_id:
                new_articles_count += 1

        except Exception as e:
            logger.error(f"Failed to process article entry: {e}")
            continue

    logger.info(f"Article fetch completed. Added {new_articles_count} new articles.")
    return new_articles_count