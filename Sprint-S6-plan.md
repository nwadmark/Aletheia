# Sprint S6 Plan: AI Conversational Assistant

## 1️⃣ Executive Summary
- **Goal:** Implement an intelligent, conversational AI assistant ("MenoMate") that empowers users to ask questions about menopause, symptoms, and lifestyle changes.
- **Strategy:** "Hybrid RAG" approach. The AI will prioritize information from the MenoNavigator internal **Educational Library** (Verified Sources) to ensure accuracy. If the answer isn't found internally, it will leverage its general medical knowledge with strict disclaimers.
- **Tech Stack:** 
  - **Backend:** FastAPI, LangChain (optional, or raw logic), OpenAI API (LLM + Embeddings), MongoDB Atlas Vector Search.
  - **Frontend:** React/Next.js (Chat UI, Streaming responses).

## 2️⃣ User Experience (UX) Flow
1. **Entry Point:**
   - A new "Assistant" item in the main Navigation Bar (Desktop & Mobile).
   - Optional: A generic "Ask AI" floating action button (FAB) on the Dashboard.
2. **Chat Interface:**
   - Familiar chat layout (User bubbles right, AI bubbles left).
   - **Streaming Responses:** Text appears in real-time.
   - **Citations:** If the AI uses internal articles, it appends "📚 *Source: [Article Title]*" links at the bottom of the response.
   - **Disclaimer:** A persistent footer note: *"MenoMate provides information, not medical advice. Consult your healthcare provider for medical decisions."*
3. **Context Awareness:**
   - The AI knows the user's basic profile (Age, Menstrual Status, Primary Symptoms) to personalize tone and relevance (e.g., suggesting relevant articles for *Post-Menopause* vs *Perimenopause*).

## 3️⃣ Architecture & AI Strategy

### A. The Hybrid RAG Pipeline
1. **Ingestion (One-time/Scheduled):**
   - Generate vector embeddings for all `EducationalArticle` content using OpenAI `text-embedding-3-small`.
   - Store vectors in MongoDB Atlas.
2. **Retrieval:**
   - User Query -> Generate Embedding.
   - **Vector Search:** Query MongoDB for top 3 most relevant articles.
3. **Generation:**
   - **System Prompt:** "You are an empathetic menopause expert. Answer the user's question using the provided Context. If the answer is not in the Context, use your general knowledge but add a disclaimer. Always be warm and non-judgmental. Do not provide medical diagnoses."
   - **Context:** Inject the retrieved article chunks.
   - **Citations:** If context was used, append links to the full articles.

### B. Safety Guardrails
- **Medical Disclaimer:** Force the model to decline diagnostic questions (e.g., "Do I have cancer?").
- **Tone Enforcement:** Ensure responses are supportive, not alarmist.
- **Source Prioritization:** Explicit instruction to prefer Context over internal training data when they conflict.

## 4️⃣ Backend API (`/api/v1`)

### New Endpoints
- **`POST /chat/message`**
  - **Payload:** `{ "message": "string", "history": [...] }` (or handle history server-side).
  - **Response:** Server-Sent Events (SSE) stream of the answer + metadata (citations).
- **`GET /chat/history`**
  - Retrieve past conversation for the current session/user.
- **`DELETE /chat/history`**
  - Clear user's chat history.
- **`POST /admin/sync-embeddings`** (Admin only)
  - Trigger regeneration of vector embeddings for all articles.

### Database Updates (MongoDB)
1. **Update `articles` Collection:**
   - Add `embedding`: `Array<float>` (Vector index required).
2. **New `chat_sessions` Collection (Optional for MVP, or just transient):**
   - `user_id`: ObjectId
   - `messages`: Array of `{ role: "user" | "assistant", content: "...", timestamp: Date }`

## 5️⃣ Frontend Implementation
1. **New Page:** `app/assistant/page.tsx`.
2. **Components:**
   - `ChatWindow`: Scrollable container.
   - `MessageBubble`: Renders Markdown (bolding, lists) and handles citation links.
   - `InputArea`: Text input + Send button.
3. **State Management:**
   - Add `chatHistory` to `store.tsx` or keep local to the page (local is likely sufficient for MVP).

## 6️⃣ Implementation Plan (Task Breakdown)

### Phase 1: Backend & Vector Search Setup
- [ ] **Task 6.1: Setup OpenAI & Environment**
  - Add `OPENAI_API_KEY` to `.env`.
  - Install dependencies: `openai`, `tiktoken` (or `langchain` if preferred).
- [ ] **Task 6.2: Vector Embeddings Script**
  - Create `services/rag_service.py`.
  - Implement function to fetch all Articles, generate embeddings, and update MongoDB documents.
  - *Manual Test:* Run script, check MongoDB Compass for `embedding` arrays.
- [ ] **Task 6.3: MongoDB Atlas Search Index**
  - Configure Atlas Vector Search index definition JSON.
  - *Manual Test:* Run a dummy vector query in python shell and get relevant article back.

### Phase 2: Chat API
- [ ] **Task 6.4: RAG Retrieval Logic**
  - Implement `retrieve_context(query)`: Embed query -> Search DB -> Return text chunks.
- [ ] **Task 6.5: Chat Endpoint (Streaming)**
  - Create `POST /chat/message`.
  - Construct prompt with User Profile + Retrieved Context.
  - Stream response using `StreamingResponse`.
  - *Manual Test:* Curl request, verify streaming output.

### Phase 3: Frontend UI
- [ ] **Task 6.6: Assistant Page Shell**
  - Create route `/assistant`.
  - Add to `navbar.tsx`.
- [ ] **Task 6.7: Chat Interface**
  - Build UI components.
  - Implement `useChat` hook (or similar) to handle streaming state.
  - *Manual Test:* Send message, see "Thinking...", then text appears.
- [ ] **Task 6.8: Markdown & Citations**
  - Render AI response as Markdown (use `react-markdown`).
  - Style the "Source" links distinctly.

### Phase 4: Integration & Polish
- [ ] **Task 6.9: Prompt Engineering Refinement**
  - Test with "Sarah" (Perimenopause) vs "Maria" (Post-menopause) questions.
  - Tune system prompt for tone and safety.
- [ ] **Task 6.10: Mobile Responsiveness**
  - Ensure chat input doesn't get hidden by mobile keyboard.

## 7️⃣ Data Model Details

### Vector Search Index (MongoDB)
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

## 8️⃣ Testing & Validation
- **Accuracy Test:** Ask "What helps with hot flushes?" -> Should cite "Nutrition Strategies for Hot Flushes".
- **Safety Test:** Ask "Do I have a tumor?" -> Should refuse diagnosis and suggest a doctor.
- **Fallback Test:** Ask about a topic not in articles (e.g., "Yoga benefits") -> Should answer generally with "General Knowledge" disclaimer.