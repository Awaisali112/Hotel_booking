# Lahore Hotel & Restaurant

A full-stack AI-powered hotel and restaurant concierge. Guests can make, look up, and cancel reservations by talking to **Parveen** — a LiveKit voice agent powered by Gemini (via Ollama Cloud), Deepgram STT, and Edge TTS. The frontend also supports text chat and room bookings with n8n webhook integration.

---

## Project Structure

```
hotel/
├── backend/
│   ├── voice_agent_module.py   # LiveKit voice agent + reservation tools + PDF receipts
│   ├── start.py                # Starts all services in one command
│   ├── token_server.py         # LiveKit token endpoint        (port 8080)
│   ├── chat_server.py          # Text chat endpoint            (port 8081)
│   ├── reservations_server.py  # Reservations REST API         (port 8082)
│   ├── rooms_server.py         # Room bookings REST API        (port 8083)
│   ├── edge_tts_plugin.py      # Edge TTS plugin for LiveKit
│   ├── pyproject.toml
│   └── reservations/           # Auto-generated PDF receipts (gitignored)
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── lib/
    │   │   ├── useSofia.ts     # Voice agent (LiveKit) hook
    │   │   ├── useChat.ts      # Text chat hook
    │   │   └── useCart.ts      # Cart hook
    │   └── data/
    │       ├── menu.ts         # Restaurant menu data
    │       └── rooms.ts        # Hotel rooms data
    ├── index.html
    └── package.json
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) — Python package manager
- [Ollama](https://ollama.com) v0.12+ signed in to Ollama Cloud
- A [LiveKit Cloud](https://livekit.io) project
- A [Deepgram](https://deepgram.com) API key

---

## Backend Setup

**1. Install dependencies**

```powershell
cd backend
uv sync
```

**2. Activate the virtual environment**

```powershell
.\.venv\Scripts\Activate.ps1
```

**3. Configure environment variables**

```powershell
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_ROOM=restaurant-lobby

DEEPGRAM_API_KEY=your_deepgram_api_key

OLLAMA_MODEL=gemini-3-flash-preview:cloud
OLLAMA_BASE_URL=http://localhost:11434/v1

N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-path

TOKEN_SERVER_PORT=8080
CHAT_SERVER_PORT=8081
RESERVATIONS_SERVER_PORT=8082
ROOMS_SERVER_PORT=8083
```

**4. Pull the Ollama cloud model**

```bash
ollama signin
ollama pull gemini-3-flash-preview:cloud
```

**5. Start all services**

```powershell
python backend/start.py dev
```

| Service | Port |
|---|---|
| Token server | 8080 |
| Chat server | 8081 |
| Reservations server | 8082 |
| Rooms server | 8083 |
| LiveKit voice agent | — |

---

## Frontend Setup

**1. Install dependencies**

```bash
cd frontend
npm install
```

**2. Configure environment**

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_TOKEN_SERVER_URL=http://localhost:8080
```

**3. Start the dev server**

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## How It Works

1. Guest opens the app and connects to a LiveKit room via a token from the token server.
2. Parveen (the voice agent) greets the guest and listens via Deepgram STT.
3. Gemini LLM via Ollama Cloud processes the conversation and calls tools.
4. Responses are spoken back using Edge TTS (Microsoft Azure Neural voices).
5. On confirmed bookings, a PDF receipt is saved to `backend/reservations/`.
6. Room bookings fire a webhook to n8n for downstream automation.

---

## Voice Agent Tools

| Tool | Description |
|---|---|
| `check_availability` | Validates date and party size |
| `make_reservation` | Stages a booking (requires guest confirmation) |
| `get_reservation` | Looks up by name or confirmation code |
| `cancel_reservation` | Stages a cancellation (requires guest confirmation) |
| `confirm_action` | Executes or discards a pending action after yes/no |

---

## Room Booking API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/room-bookings` | List all bookings |
| POST | `/room-bookings` | Create a booking |
| DELETE | `/room-bookings/:code` | Cancel a booking |
