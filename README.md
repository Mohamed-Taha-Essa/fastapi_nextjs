# FastAPI + Next.js Chat Service with AI-Powered Document Ingestion

> A full-stack application enabling semantic search and AI-powered Q&A over custom document collections using LangChain, ChromaDB, and LLMs.

## 🎯 Overview

This system provides an intelligent document management and query platform that allows users to:
- Upload and ingest various document formats (PDF, Markdown, plain text)
- Store documents with intelligent chunking and embedding
- Query knowledge bases using semantic search
- Receive AI-powered answers with source attribution
- Manage authentication and authorization

## ✨ Key Features

- **Multi-Format Document Support**: PDF, Markdown, and plain text ingestion
- **Semantic Search**: Vector-based similarity search using sentence transformers
- **AI-Powered Responses**: LLM integration via LangChain for intelligent Q&A
- **Async Processing**: Celery task queue for long-running document processing
- **User Authentication**: JWT-based authentication with secure password hashing
- **RESTful API**: Comprehensive FastAPI endpoints with automatic OpenAPI documentation
- **Modern Frontend**: Next.js 16 with TypeScript and Tailwind CSS
- **Real-Time Collaboration**: Ready for team-based document management
- **Scalable Architecture**: Containerized with Docker and Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.10+
- Node.js 18+
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fastapi_nextjs
   ```

2. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   This starts:
   - PostgreSQL database
   - Redis (Celery broker & result backend)
   - Backend FastAPI server
   - Frontend Next.js application

3. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8001/docs
   - Health Check: http://localhost:8001/health

### Local Development (Without Docker)

**Backend Setup:**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env

# Run migrations
alembic upgrade head

# Start FastAPI server
uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8001
```

**Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Start Celery Worker:**
```bash
celery -A src.app.workers.celery_app worker --loglevel=info
```

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get access token
- `POST /api/v1/auth/refresh` - Refresh access token

### Document Ingestion
- `POST /api/v1/ingest/upload` - Upload and process documents
- `GET /api/v1/ingest/jobs` - List ingestion jobs
- `GET /api/v1/ingest/jobs/{job_id}` - Get job status
- `GET /api/v1/ingest/sources` - List document sources

### AI Queries
- `POST /api/v1/ai/query` - Query knowledge base with semantic search
- `POST /api/v1/ai/chat` - Chat with AI using conversation history
- `GET /api/v1/ai/suggestions` - Get query suggestions

### Knowledge Base
- `GET /api/v1/documents` - List all documents
- `GET /api/v1/documents/{doc_id}` - Get document details
- `DELETE /api/v1/documents/{doc_id}` - Delete document
- `GET /api/v1/chunks/{doc_id}` - Get document chunks

## 🏗️ Project Structure

```
fastapi_nextjs/
├── src/app/
│   ├── api/                    # API route handlers
│   │   ├── auth_routes.py
│   │   ├── ai_routes.py
│   │   └── ingestion_routes.py
│   ├── core/                   # Configuration & security
│   │   ├── config.py
│   │   └── security.py
│   ├── models/                 # Database models (SQLAlchemy)
│   │   ├── users.py
│   │   ├── document.py
│   │   ├── chunk.py
│   │   └── ingestion_job.py
│   ├── schemas/                # Pydantic validation schemas
│   ├── services/               # Business logic
│   │   ├── ingestion_service.py
│   │   ├── ai_query_service.py
│   │   ├── embedding_service.py
│   │   ├── chunking_service.py
│   │   └── vector_store_service.py
│   ├── db/                     # Database configuration
│   │   ├── database.py
│   │   └── vector_db.py
│   └── workers/                # Celery task definitions
│       ├── celery_app.py
│       └── tasks.py
│
├── frontend/                   # Next.js React application
│   ├── src/
│   │   ├── app/               # App router pages
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React context (auth)
│   │   └── lib/               # Utilities & API client
│   └── public/                # Static assets
│
├── alembic/                    # Database migrations
├── docker-compose.yml          # Container orchestration
├── Dockerfile                  # Backend container
├── frontend/Dockerfile         # Frontend container
└── requirements.txt            # Python dependencies
```

## 🔧 Technology Stack

### Backend
- **Framework**: FastAPI (async Python web framework)
- **Database**: PostgreSQL (relational) + ChromaDB (vector store)
- **Task Queue**: Celery + Redis
- **AI/ML**: LangChain, Sentence Transformers, Hugging Face
- **Authentication**: JWT with bcrypt
- **ORM**: SQLAlchemy
- **Document Processing**: PyPDF, Unstructured, python-markdown

### Frontend
- **Framework**: Next.js 16 (React meta-framework)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **UI Components**: Lucide React icons
- **State Management**: React Context API

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Alembic
- **Message Queue**: Redis
- **Process Management**: Celery

## 📖 Configuration

### Environment Variables

Create `.env` file in the root directory:

```env
# API Configuration
SERVICE_NAME=Chat Service
VERSION=1.0.0
DEBUG=True

# Server
HOST=0.0.0.0
PORT=8001

# Database
DATABASE_URL=postgresql://copilot:copilot_pass@postgres:5432/copilot_db

# Redis
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Models
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
LLM_MODEL_NAME=google/gemma-3-1b-it
VECTOR_DB_NAME=chroma

# Chunking
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
```

## 🧪 Testing

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run test suite
pytest

# With coverage
pytest --cov=src
```

### API Testing with cURL

```bash
# Register user
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure_password"}'

# Login
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure_password"}'

# Query knowledge base (requires token)
curl -X POST http://localhost:8001/api/v1/ai/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the main topic?","top_k":5}'
```

## 🚀 Deployment

### Production Deployment

1. **Update environment variables** for production:
   ```bash
   DEBUG=False
   JWT_SECRET_KEY=<generate-strong-key>
   DATABASE_URL=<production-db-url>
   ```

2. **Run migrations**:
   ```bash
   alembic upgrade head
   ```

3. **Build and deploy with Docker**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

4. **Set up reverse proxy** (Nginx/Caddy recommended)

5. **Enable HTTPS** with Let's Encrypt

### Scaling Considerations
- Horizontal scaling with multiple Celery workers
- Load balancing with Nginx
- Database replication for high availability
- Vector DB clustering with ChromaDB
- CDN for frontend static assets

## 📝 Development Workflow

### Creating a New Route

1. Define schema in `schemas/`
2. Create route handler in `api/`
3. Implement service logic in `services/`
4. Add database models if needed in `models/`
5. Update tests

### Adding a New Task

1. Define task in `workers/tasks.py`
2. Add task schema in `schemas/`
3. Create Celery route endpoint
4. Monitor with Flower: `celery -A src.app.workers.celery_app flower`

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add new field"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Change port in docker-compose.yml or use:
docker-compose down && docker-compose up --force-recreate
```

**Database connection errors**:
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations: `alembic upgrade head`

**Celery tasks not processing**:
- Check Redis is running
- Verify CELERY_BROKER_URL is correct
- Check worker logs: `celery -A src.app.workers.celery_app events`

**Vector DB issues**:
- Clear ChromaDB cache: `rm -rf .chroma/`
- Verify embedding model is downloaded

## 📊 Monitoring

### Health Checks

- Backend: `curl http://localhost:8001/health`
- Frontend: http://localhost:3000
- API Docs: http://localhost:8001/docs
- Celery Flower: `pip install flower && celery -A src.app.workers.celery_app flower`

### Logging

All services log to stdout. Configure log levels in:
- Backend: `config.py`
- Frontend: `.env.local`

## 📚 API Documentation

Full interactive API documentation available at:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and commit: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

### Code Style
- Python: Follow PEP 8 with Black formatter
- TypeScript: Follow ESLint rules
- Commit messages: Use conventional commits

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review API documentation at `/docs`
3. Check logs in respective containers
4. Open GitHub issue with detailed description

## 🗺️ Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Multi-language document support
- [ ] Advanced RAG with re-ranking
- [ ] Custom LLM fine-tuning
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] GraphQL API endpoint

## 📞 Contact

For questions or feedback, reach out through:
- GitHub Issues
- Email: support@example.com
- Documentation: See ARCHITECTURE.md for technical details

---

**Last Updated**: May 2026
