"""
Database configuration and connection management using Motor (AsyncIO).
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import urlparse
from config import get_settings

logger = logging.getLogger(__name__)

# Global database client instance
client: AsyncIOMotorClient = None

async def connect_to_mongo():
    """
    Connect to MongoDB and initialize the client.
    This should be called on application startup.
    """
    global client
    settings = get_settings()
    
    try:
        logger.info(f"Connecting to MongoDB...")
        client = AsyncIOMotorClient(settings.mongodb_uri)
        # Verify connection by trying to connect to the default database
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB.")
        # Initialize database indexes
        await init_indexes(client)
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    """
    Close MongoDB connection.
    This should be called on application shutdown.
    """
    global client
    if client:
        logger.info("Closing MongoDB connection")
        client.close()
        logger.info("MongoDB connection closed")

async def get_database() -> object:
    """
    Returns the database instance from the client.
    """
    settings = get_settings()
    db_name = urlparse(settings.mongodb_uri).path.lstrip('/')
    db = client[db_name]
    return db

async def init_indexes(client: AsyncIOMotorClient):
    """
    Create necessary indexes for collections.
    """
    settings = get_settings()
    db_name = urlparse(settings.mongodb_uri).path.lstrip('/')
    db = client[db_name]
    
    # User indexes
    # Email must be unique
    await db.users.create_index("email", unique=True)
    logger.info("Created unique index on users.email")
    
    # Symptom Log indexes
    # Composite unique index on user_id + date to ensure one log per day per user
    await db.symptom_logs.create_index(
        [("user_id", 1), ("date", 1)], 
        unique=True
    )
    logger.info("Created unique compound index on symptom_logs (user_id + date)")
    
    # User ID index for fast lookups in logs
    await db.symptom_logs.create_index("user_id")