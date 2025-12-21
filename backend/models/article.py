"""
Article model for storing women's health news and resources.
"""
from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, Field, GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic_core import core_schema
from bson import ObjectId

# Re-defining PyObjectId here to avoid potential circular imports or coupling issues
# effectively keeping models independent.
class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.no_info_before_validator_function(cls.validate, core_schema.str_schema()),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: core_schema.CoreSchema, _handler: GetJsonSchemaHandler
    ) -> Dict[str, Any]:
        return {"type": "string"}

class ArticleBase(BaseModel):
    """Base article model."""
    title: str = Field(..., description="Article title")
    summary: str = Field(..., description="Article summary or description")
    url: str = Field(..., description="URL to the full article")
    image_url: Optional[str] = Field(None, description="URL to the article image")
    source: str = Field(..., description="Source of the article (e.g., Medical News Today)")
    category: str = Field(..., description="Article category")
    published_at: datetime = Field(..., description="When the article was published originally")

class ArticleCreate(ArticleBase):
    """Model for creating a new article."""
    pass

class ArticleInDB(ArticleBase):
    """Article model as stored in database."""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "_id": "6584c9f1bcf86cd799439011",
                "title": "Understanding Menopause Symptoms",
                "summary": "A comprehensive guide to common menopause symptoms.",
                "url": "https://example.com/menopause-guide",
                "image_url": "https://example.com/image.jpg",
                "source": "Health Daily",
                "category": "Menopause",
                "published_at": "2023-12-20T10:00:00Z",
                "created_at": "2023-12-21T10:00:00Z",
                "updated_at": "2023-12-21T10:00:00Z"
            }
        }

class ArticleResponse(ArticleBase):
    """Article model for API responses."""
    id: str = Field(..., description="Article ID")
    created_at: datetime = Field(..., description="Record creation timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "6584c9f1bcf86cd799439011",
                "title": "Understanding Menopause Symptoms",
                "summary": "A comprehensive guide to common menopause symptoms.",
                "url": "https://example.com/menopause-guide",
                "image_url": "https://example.com/image.jpg",
                "source": "Health Daily",
                "category": "Menopause",
                "published_at": "2023-12-20T10:00:00Z",
                "created_at": "2023-12-21T10:00:00Z"
            }
        }