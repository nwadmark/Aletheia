"""
Service for interacting with Google's Gemini API.
"""
import google.generativeai as genai
from config import get_settings

settings = get_settings()

class ChatService:
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        # Using the specific model requested by the user
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
    async def get_response(self, message: str) -> str:
        """
        Get a response from the Gemini model.
        
        Args:
            message: The user's message
            
        Returns:
            The model's response
        """
        try:
            # System prompt to guide the model's behavior
            system_instruction = """
            You are a helpful assistant for women's health, specifically focusing on Menopause and similar situations.
            
            Guidelines:
            1. Give small and concise answers.
            2. If the client describes severe symptoms or medical emergencies, strictly advise them to consult a doctor.
            3. If the question is NOT related to women's Menopause or similar women's health situations, reply exactly with: "This is not a relevant question."
            4. Be empathetic but professional.
            """
            
            chat = self.model.start_chat(history=[
                {"role": "user", "parts": [system_instruction]},
                {"role": "model", "parts": ["Understood. I will act as a women's health assistant focusing on Menopause, providing concise answers and referring to doctors for severe symptoms. I will decline irrelevant questions."]}
            ])
            
            response = chat.send_message(message)
            return response.text
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again later."

# Global instance
_chat_service = None

def get_chat_service() -> ChatService:
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service