"""
Database configuration and connection management using Motor (AsyncIO).
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient
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
        logger.info(f"Connecting to MongoDB at {settings.mongodb_uri}")
        client = AsyncIOMotorClient(settings.mongodb_uri)
        
        # Verify connection
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Initialize database indexes
        await init_indexes()
        
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

async def get_database():
    """
    Dependency to get the database instance.
    """
    global client
    if client is None:
        # Fallback if connection wasn't established (e.g. during tests)
        await connect_to_mongo()
    
    # Return the default database
    return client.get_default_database()

async def init_indexes():
    """
    Create necessary indexes for collections.
    """
    db = await get_database()
    
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