"""
Router for chatbot functionality.
"""
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from services.chat_service import get_chat_service

router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"],
    responses={404: {"description": "Not found"}},
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest = Body(...)):
    """
    Send a message to the women's health chatbot.
    """
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    service = get_chat_service()
    response_text = await service.get_response(request.message)
    
    return ChatResponse(response=response_text)