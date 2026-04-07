# Lahore Hotel & Restaurant

A full-stack AI-powered hotel and restaurant concierge. Guests can make, look up, and cancel reservations by talking to **Parveen** — a LiveKit voice agent powered by Gemini (via Ollama Cloud), Deepgram STT, and Edge TTS. The frontend also supports text chat, room bookings, and a full restaurant menu with cart.

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
    │   ├── types.ts
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

```bash
cd backend
uv sync
```

**2. Configure environment variables**

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
# LiveKit
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_ROOM=restaurant-lobby

# Deepgram (STT)
DEEPGRAM_API_KEY=your_deepgram_api_key

# Google (optional, for direct Gemini access)
GOOGLE_API_KEY=your_google_api_key

# Ollama Cloud
OLLAMA_MODEL=gemini-3-flash-preview:cloud
OLLAMA_BASE_URL=http://localhost:11434/v1

# n8n webhook (room bookings)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-path

# Server ports
TOKEN_SERVER_PORT=8080
CHAT_SERVER_PORT=8081
RESERVATIONS_SERVER_PORT=8082
ROOMS_SERVER_PORT=8083
```

**3. Pull the Ollama cloud model**

```bash
ollama signin
ollama pull gemini-3-flash-preview:cloud
```

**4. Start all services**

```bash
python start.py dev
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
cp .env.example .env
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
5. On confirmed bookings, a PDF receipt is saved to `backend/reservations/` and appended to a running log PDF.
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

## Restaurant

- Breakfast: 7:00 AM - 11:00 AM
- Lunch: 12:00 PM - 4:00 PM
- Dinner: 6:00 PM - 11:00 PM
- Location: Mall Road, Lahore, Punjab, Pakistan
- Max party size: 20 | Bookings up to 60 days in advance

---

## Room Booking API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/room-bookings` | List all bookings |
| POST | `/room-bookings` | Create a booking |
| DELETE | `/room-bookings/:code` | Cancel a booking |

---

## Reservations API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reservations` | List all reservations |

---

## n8n Configuration

Room bookings fire a webhook to n8n on every successful `POST /room-bookings`. Use this to send confirmation emails, update a spreadsheet, notify staff via Slack, etc.

**1. Create a Webhook node in n8n**

- Trigger: `Webhook`
- Method: `POST`
- Path: anything you like, e.g. `/hotel-room-booking`
- Authentication: none (or add a header check for security)

Copy the production webhook URL and set it in `backend/.env`:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/hotel-room-booking
```

**2. Payload shape**

n8n receives this JSON body on every new booking:

```json
{
  "confirmation_code": "A1B2C3",
  "guest_name": "Jane Smith",
  "room_id": "deluxe-01",
  "room_name": "Deluxe Room",
  "room_type": "Deluxe",
  "check_in": "2025-08-01",
  "check_out": "2025-08-04",
  "guests": 2,
  "price_per_night": 120,
  "special_requests": "Late check-in",
  "created_at": "2025-07-20T14:32:00.000000"
}
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Motion |
| Voice | LiveKit Agents, Deepgram STT, Edge TTS |
| LLM | Gemini via Ollama Cloud (OpenAI-compatible) |
| Backend | Python 3.11, plain `http.server` |
| PDF | ReportLab + pypdf |
| Automation | n8n webhooks |

---

## Reservations API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reservations` | List all reservations |

---

## n8n Configuration

Room bookings fire a webhook to n8n on every successful `POST /room-bookings`. Use this to send confirmation emails, update a spreadsheet, notify staff via Slack, etc.

**1. Create a Webhook node in n8n**

- Trigger: `Webhook`
- Method: `POST`
- Path: anything you like, e.g. `/hotel-room-booking`
- Authentication: none (or add a header check for security)

Copy the production webhook URL and set it in `backend/.env`:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/hotel-room-booking
```

**2. Payload shape**

n8n receives this JSON body on every new booking:

```json
{
  "confirmation_code": "A1B2C3",
  "guest_name": "Jane Smith",
  "room_id": "deluxe-01",
  "room_name": "Deluxe Room",
  "room_type": "Deluxe",
  "check_in": "2025-08-01",
  "check_out": "2025-08-04",
  "guests": 2,
  "price_per_night": 120,
  "special_requests": "Late check-in",
  "created_at": "2025-07-20T14:32:00.000000"
}
```



## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Motion |
| Voice | LiveKit Agents, Deepgram STT, Edge TTS |
| LLM | Gemini via Ollama Cloud (OpenAI-compatible) |
| Backend | Python 3.11, plain `http.server` |
| PDF | ReportLab + pypdf |
| Automation | n8n webhooks |
