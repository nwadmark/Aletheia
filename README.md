# Aletheia - Health Tracking Application

A comprehensive health tracking application that helps users monitor symptoms, visualize trends, and sync their health data with Google Calendar.

## 🌟 Features

### Core Features
- 📝 **Symptom Logging** - Track daily symptoms with severity ratings
- 📊 **Trend Analysis** - Visualize health patterns over time
- 📅 **Calendar View** - See your health history at a glance
- 🎓 **Educational Resources** - Learn about health management
- 👥 **Community Support** - Connect with others on similar journeys

### 📅 Google Calendar Integration
Seamlessly sync your symptom logs to Google Calendar for:
- 📱 Cross-device access to your health data
- 🤝 Easy sharing with healthcare providers
- 📊 Visualizing health patterns alongside life events
- 🔄 Automatic real-time synchronization

**Key Capabilities:**
- ✅ Secure OAuth 2.0 authentication
- ✅ Encrypted token storage
- ✅ Dedicated "Altheia Health" calendar
- ✅ Color-coded events by severity
- ✅ Auto-sync and manual sync options
- ✅ Batch sync for multiple logs

👉 **[Complete Google Calendar Integration Guide](GOOGLE_CALENDAR_INTEGRATION_GUIDE.md)**

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (Backend)
- Node.js 18+ (Frontend)
- MongoDB
- Google Cloud Platform account (for Calendar integration)

### Installation

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure your .env file
python main.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Google Calendar Setup
For detailed setup instructions, see:
- 📖 [Google Calendar Integration Guide](GOOGLE_CALENDAR_INTEGRATION_GUIDE.md)
- 🔧 [Backend Setup Guide](backend/GOOGLE_CALENDAR_SETUP.md)
- 🧪 [Testing Guide](GOOGLE_CALENDAR_TESTING.md)

## 📚 Documentation

### Main Documentation
- [Google Calendar Integration Guide](GOOGLE_CALENDAR_INTEGRATION_GUIDE.md) - Complete setup and usage guide
- [Google Calendar Testing Guide](GOOGLE_CALENDAR_TESTING.md) - Comprehensive testing scenarios

### Backend Documentation
- [Backend README](backend/README.md) - API documentation
- [Google Calendar Setup](backend/GOOGLE_CALENDAR_SETUP.md) - Step-by-step setup
- [Implementation Summary](backend/IMPLEMENTATION_SUMMARY.md) - Technical details

### Frontend Documentation
- [Frontend Implementation](frontend/GOOGLE_CALENDAR_FRONTEND_IMPLEMENTATION.md) - Frontend integration details

### Planning Documentation
- [Integration Architecture Plan](Google-Calendar-Integration-Plan.md) - Original architecture design

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  - React Components                                          │
│  - State Management                                          │
│  - Google Calendar UI                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                        │
│  - REST API                                                  │
│  - Google Calendar Service                                   │
│  - OAuth 2.0 Authentication                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  - MongoDB (User data, logs)                                 │
│  - Google Calendar API                                       │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Security

- 🔐 OAuth 2.0 for secure authentication
- 🔑 Fernet encryption for token storage
- 🛡️ CSRF protection with state parameters
- 🔒 HTTPS required in production
- 🎯 Minimal API scopes requested

## 🧪 Testing

Run the complete test suite:

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

For detailed testing scenarios, see [GOOGLE_CALENDAR_TESTING.md](GOOGLE_CALENDAR_TESTING.md).

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

[Add your license information here]

## 🆘 Support

For issues or questions:
- 📖 Check the [documentation](GOOGLE_CALENDAR_INTEGRATION_GUIDE.md)
- 🐛 Review [troubleshooting guide](GOOGLE_CALENDAR_INTEGRATION_GUIDE.md#troubleshooting)
- 💬 Open an issue on GitHub

## 🎯 Roadmap

### Current Features (v1.0)
- ✅ Symptom logging and tracking
- ✅ Calendar visualization
- ✅ Google Calendar integration (one-way sync)
- ✅ Trend analysis
- ✅ Educational resources

### Planned Features
- 🔄 Two-way Google Calendar sync
- ⏰ Event reminders
- 📊 Advanced analytics
- 🔔 Notification system
- 📱 Mobile app

---

**Version**: 1.0.0
**Last Updated**: December 2024
