# System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [System Diagram](#system-diagram)
3. [Data Flow](#data-flow)
4. [Component Details](#component-details)
5. [Scaling Approach](#scaling-approach)
6. [Trade-offs](#trade-offs)
7. [Performance Considerations](#performance-considerations)

---

## System Overview

The FastAPI + Next.js Chat Service is a full-stack application that implements a **Retrieval-Augmented Generation (RAG)** pipeline for semantic search and AI-powered question answering over custom document collections.

### Core Responsibilities

| Layer | Responsibility |
|-------|-----------------|
| **Presentation** | Next.js frontend UI with real-time user interactions |
| **API Gateway** | FastAPI HTTP server with JWT authentication |
| **Business Logic** | Ingestion pipeline, AI querying, authentication services |
| **Data Processing** | Asynchronous task queue with Celery workers |
| **Persistence** | PostgreSQL (relational data) + ChromaDB (vector embeddings) |
| **Infrastructure** | Redis (caching, message broker), Docker orchestration |

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER LAYER                                     │
│  Web Browser (Chrome, Firefox, Safari, etc.)                           │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (Port 3000)                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Next.js 16 + TypeScript + Tailwind CSS                          │  │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │  │
│  │ │  Auth Pages     │  │ Dashboard Pages │  │  Chat Interface │  │  │
│  │ │ (login/register)│  │ (upload/query)  │  │   Component     │  │  │
│  │ └─────────────────┘  └─────────────────┘  └─────────────────┘  │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │ React Context (Auth State) + Axios HTTP Client            │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                  ↓ REST API (JSON)
┌─────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & AUTHENTICATION                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ FastAPI (Port 8001)                                              │  │
│  │ ┌──────────────────────────────────────────────────────────────┐ │  │
│  │ │ JWT Authentication Middleware + CORS                        │ │  │
│  │ │ Rate Limiting & Request Validation                          │ │  │
│  │ └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                ↓ Routes                    ↓ Routes                    ↓ Routes
    ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
    │   AUTH ROUTES        │    │  INGESTION ROUTES    │    │   AI QUERY ROUTES    │
    │ /auth/register       │    │ /ingest/upload       │    │ /ai/query            │
    │ /auth/login          │    │ /ingest/status       │    │ /ai/chat             │
    │ /auth/refresh        │    │ /ingest/jobs         │    │ /ai/suggestions      │
    └──────────────────────┘    └──────────────────────┘    └──────────────────────┘
            ↓                            ↓                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER (Business Logic)                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ AuthService      │  │ IngestionService │  │ AIQueryService       │ │
│  │ • Register       │  │ • Dedup Check    │  │ • Semantic Search    │ │
│  │ • Login          │  │ • Extract Text   │  │ • Query Embedding    │ │
│  │ • JWT Generation │  │ • Chunk Content  │  │ • Vector Similarity  │ │
│  │ • Token Refresh  │  │ • Generate Embed │  │ • LLM Integration    │ │
│  │                  │  │ • Store in DB    │  │                      │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘ │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ ChunkingService  │  │ EmbeddingService │  │ VectorStoreService   │ │
│  │ • Split Text     │  │ • Sentence Txfm  │  │ • Similarity Search  │ │
│  │ • Smart Split    │  │ • HuggingFace    │  │ • CRUD Operations    │ │
│  │ • Overlap Chunks │  │ • Caching        │  │ • Vector Indexing    │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
        ↓                         ↓                      ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│  ASYNC WORKERS   │  │  MESSAGE BROKER  │  │   DATA PERSISTENCE      │
│  (Celery)        │  │   Redis (Port    │  │                          │
│                  │  │   6379)          │  │  ┌──────────────────────┐│
│ • Document       │  │                  │  │  │ PostgreSQL           ││
│   Processing     │  │ • Task Queue     │  │  │ (Port 5432)          ││
│ • Embedding Gen  │  │ • Result Storage │  │  │ • Users              ││
│ • Long-Running   │  │ • State mgmt     │  │  │ • Documents          ││
│   Tasks          │  │                  │  │  │ • Chunks             ││
│                  │  │                  │  │  │ • Ingestion Jobs     ││
│                  │  │                  │  │  │ • Sources            ││
│                  │  │                  │  │  └──────────────────────┘│
│                  │  │                  │  │                          │
│                  │  │                  │  │  ┌──────────────────────┐│
│                  │  │                  │  │  │ ChromaDB Vector DB   ││
│                  │  │                  │  │  │ • Embeddings         ││
│                  │  │                  │  │  │ • Similarity Index   ││
│                  │  │                  │  │  │ • Collections        ││
│                  │  │                  │  │  └──────────────────────┘│
│                  │  │                  │  │                          │
│                  │  │                  │  │  ┌──────────────────────┐│
│                  │  │                  │  │  │ HuggingFace / LLM    ││
│                  │  │                  │  │  │ • Embeddings API     ││
│                  │  │                  │  │  │ • LLM Inference      ││
│                  │  │                  │  │  │ • Transformers       ││
│                  │  │                  │  │  └──────────────────────┘│
└──────────────────┘  └──────────────────┘  └──────────────────────────┘
```

---

## Data Flow

### 1. Authentication Flow

```
User Input (Email/Password)
          ↓
    Next.js Form
          ↓
  axios.post(/auth/register or /auth/login)
          ↓
  FastAPI Route Handler
          ↓
  AuthService.register() or AuthService.login()
          ↓
  Password Validation (bcrypt)
          ↓
  JWT Token Generation
          ↓
  Store in PostgreSQL (users table)
          ↓
  Return JWT Token to Frontend
          ↓
  Store in LocalStorage/SessionStorage
          ↓
  Attach to subsequent API requests (Authorization: Bearer <token>)
```

### 2. Document Ingestion Flow

```
User Uploads File (UI)
          ↓
    Next.js upload handler
          ↓
  axios.post(/ingest/upload) with file
          ↓
  FastAPI receives multipart form-data
          ↓
  Extract text (PDF/Markdown/TXT parser)
          ↓
  Generate content hash for deduplication
          ↓
  Check if document already exists in PostgreSQL
          ↓
  If new:
    │
    ├─→ Split into chunks (ChunkingService)
    │   • Respects max token size (1000 tokens)
    │   • Maintains overlap (200 tokens)
    │   • Preserves context
    │
    ├─→ Generate embeddings (EmbeddingService)
    │   • Uses sentence-transformers/all-MiniLM-L6-v2
    │   • Runs on HuggingFace or locally
    │   • Creates 384-dimensional vectors
    │
    ├─→ Celery Task Queuing
    │   • Task pushed to Redis message queue
    │   • Celery worker picks up task
    │   • Returns job_id to frontend immediately
    │
    └─→ Store results:
        • Chunks → PostgreSQL (chunks table)
        • Embeddings → ChromaDB (vector store)
        • Metadata → PostgreSQL (documents table)
          ↓
  Return ingestion_job status to Frontend
          ↓
  Frontend polls /ingest/jobs/{job_id} for status
          ↓
  Display processing progress to user
```

### 3. Query & Search Flow

```
User Types Query (Chat Interface)
          ↓
  Next.js captures query input
          ↓
  axios.post(/ai/query) with query text
          ↓
  FastAPI receives request
          ↓
  JWT token validation
          ↓
  AIQueryService processes query
          ↓
  Generate query embedding
    • Same model as document embeddings
    • 384-dimensional vector
          ↓
  Semantic search in ChromaDB
    • Calculate cosine similarity
    • Retrieve top-k similar chunks (k=5 default)
    • Each chunk returns metadata + content
          ↓
  Retrieve full documents from PostgreSQL
    • Join chunks with documents table
    • Assemble context window
          ↓
  Optional: LLM Query Enhancement
    • Pass context to LLM (via LangChain)
    • Generate answer with source attribution
          ↓
  Return response with:
    • Answer (if LLM enabled)
    • Source chunks
    • Confidence scores
    • Document references
          ↓
  Next.js displays results
    • Shows answer
    • Lists source documents
    • Allows drill-down to full documents
```

### 4. End-to-End Request Lifecycle

```
┌─ Request Created in Frontend ─────────────────────────────────────┐
│                                                                   │
│  1. User Action → React Component State Update                   │
│  2. HTTP Request Created with Authorization Header               │
│  3. Axios Interceptor adds JWT token                             │
│  4. Request sent to FastAPI backend (http://localhost:8001)      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                                ↓
┌─ Request Received by FastAPI ─────────────────────────────────────┐
│                                                                   │
│  5. CORS Middleware validation                                   │
│  6. Request parsing & validation (Pydantic schemas)              │
│  7. JWT authentication middleware verification                   │
│  8. User identification from token                               │
│  9. Route handler execution                                      │
│  10. Business logic delegation to service layer                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                                ↓
┌─ Service Layer Processing ────────────────────────────────────────┐
│                                                                   │
│  For long operations:                                            │
│  • Create Celery task                                            │
│  • Push to Redis queue                                           │
│  • Return job_id immediately to client                           │
│  • Client polls for status updates                               │
│                                                                   │
│  For synchronous operations:                                     │
│  • Perform business logic                                        │
│  • Query databases (PostgreSQL/ChromaDB)                         │
│  • Prepare response                                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                                ↓
┌─ Response Preparation & Return ───────────────────────────────────┐
│                                                                   │
│  11. Serialize response to JSON (Pydantic serialization)         │
│  12. Set HTTP status code                                        │
│  13. Add response headers                                        │
│  14. Send response back to frontend                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                                ↓
┌─ Frontend Receives Response ──────────────────────────────────────┐
│                                                                   │
│  15. Axios resolves promise                                      │
│  16. Response interceptor processes data                         │
│  17. React state updated                                         │
│  18. Component re-renders with new data                          │
│  19. User sees updated UI                                        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Backend Components

#### 1. **FastAPI Application Layer** (`src/app/main.py`)
- Initializes FastAPI application
- Registers route routers (auth, ingestion, AI)
- Adds CORS middleware
- Provides health check endpoint

#### 2. **Authentication Service** (`src/app/services/auth_service.py`)
```python
Responsibilities:
  • User registration with password hashing (bcrypt)
  • User login with credential validation
  • JWT token generation and validation
  • Token refresh mechanism
  • Role-based access control (future)
```

#### 3. **Ingestion Service** (`src/app/services/ingestion_service.py`)
```python
Responsibilities:
  • Orchestrate document processing pipeline
  • Deduplication check (content hash)
  • Coordinate chunking, embedding, and storage
  • Track ingestion job status
  • Handle errors and retries
```

#### 4. **Chunking Service** (`src/app/services/chunking_service.py`)
```python
Responsibilities:
  • Split documents into semantically coherent chunks
  • Maintain configurable overlap (default: 200 tokens)
  • Preserve metadata and source information
  • Handle various document formats
```

#### 5. **Embedding Service** (`src/app/services/embedding_service.py`)
```python
Responsibilities:
  • Generate vector embeddings for text
  • Use sentence-transformers for consistency
  • Cache embeddings for performance
  • Handle batch embedding operations
```

#### 6. **Vector Store Service** (`src/app/services/vector_store_service.py`)
```python
Responsibilities:
  • CRUD operations on ChromaDB
  • Similarity search queries
  • Vector indexing and retrieval
  • Manage collections
```

#### 7. **AI Query Service** (`src/app/services/ai_query_service.py`)
```python
Responsibilities:
  • Convert queries to embeddings
  • Perform semantic search
  • Retrieve relevant context
  • Generate LLM prompts (future)
```

### Frontend Components

#### 1. **Authentication Pages**
- Registration form with validation
- Login form with error handling
- JWT token storage and refresh
- Protected route wrapper

#### 2. **Dashboard Layout**
- Sidebar navigation
- User profile management
- Role-based menu items

#### 3. **Chat Interface**
- Query input form
- Response display with formatting
- Source document attribution
- Chat history (if implemented)

#### 4. **Upload Component**
- File drag-and-drop interface
- Progress tracking
- Job status polling
- Error handling

#### 5. **Document Browser**
- List all uploaded documents
- Preview document chunks
- Delete documents
- Filter and search

### Infrastructure Components

#### PostgreSQL Database Schema
```sql
users table:
  - id (UUID, PK)
  - email (VARCHAR, unique)
  - hashed_password (VARCHAR)
  - created_at (TIMESTAMP)

documents table:
  - id (UUID, PK)
  - user_id (FK to users)
  - title (VARCHAR)
  - source_type (VARCHAR)
  - content_hash (VARCHAR, unique)
  - metadata (JSONB)
  - created_at (TIMESTAMP)

chunks table:
  - id (UUID, PK)
  - document_id (FK to documents)
  - chunk_index (INTEGER)
  - text_content (TEXT)
  - metadata (JSONB)
  - created_at (TIMESTAMP)

sources table:
  - id (UUID, PK)
  - user_id (FK to users)
  - source_type (VARCHAR)
  - url (VARCHAR, nullable)
  - last_synced (TIMESTAMP)

ingestion_jobs table:
  - id (UUID, PK)
  - user_id (FK to users)
  - document_id (FK to documents, nullable)
  - status (VARCHAR: pending, processing, completed, failed)
  - progress (INTEGER: 0-100)
  - created_at (TIMESTAMP)
  - completed_at (TIMESTAMP, nullable)
```

#### ChromaDB Vector Store Schema
```
Collections:
  - knowledge_base (default)
    • Embeddings: 384-dimensional vectors
    • Documents: chunks + metadata
    • Metadata fields:
      - document_id
      - chunk_index
      - source_type
      - user_id
```

#### Redis Data Structures
```
Keys:
  - celery task queue: celery
  - task results: celery-task-meta-<task-id>
  - cache keys: cache:<key>
  - session cache: session:<session-id>
```

---

## Scaling Approach

### Horizontal Scaling

#### 1. **Load Balancing Frontend**
```
Users
  ├─ nginx/haproxy (load balancer)
  ├─ Next.js Instance 1 (Port 3000)
  ├─ Next.js Instance 2 (Port 3001)
  └─ Next.js Instance 3 (Port 3002)
```

**Implementation:**
- Deploy multiple Next.js containers behind Nginx reverse proxy
- Use sticky sessions for WebSocket support
- Deploy to Kubernetes or Docker Swarm

#### 2. **API Gateway Scaling**
```
Load Balancer (Nginx/HAProxy)
  ├─ FastAPI Instance 1 (Port 8001)
  ├─ FastAPI Instance 2 (Port 8002)
  └─ FastAPI Instance 3 (Port 8003)
```

**Implementation:**
- Deploy multiple FastAPI instances
- Use Nginx upstream to distribute requests
- Share PostgreSQL connection pool
- Implement health checks

#### 3. **Celery Worker Scaling**
```
Redis Message Broker
  ├─ Celery Worker 1 (CPU-intensive tasks)
  ├─ Celery Worker 2 (I/O-intensive tasks)
  ├─ Celery Worker 3 (Embedding generation)
  └─ Celery Worker N (Auto-scaling based on queue depth)
```

**Implementation:**
- Deploy workers on separate instances
- Use task routing for specialized workers
- Monitor queue depth with Flower
- Auto-scale with Kubernetes or Docker Swarm

#### 4. **Database Scaling**
```
PostgreSQL
  ├─ Primary (Write operations)
  ├─ Replica 1 (Read replicas)
  └─ Replica 2 (Read replicas)

ChromaDB
  ├─ Instance 1 (Shard A)
  ├─ Instance 2 (Shard B)
  └─ Instance 3 (Shard C)
```

**Implementation:**
- PostgreSQL streaming replication
- Read replicas for reporting queries
- Connection pooling with PgBouncer
- ChromaDB cluster mode (enterprise)

#### 5. **Redis Clustering**
```
Redis Cluster
  ├─ Node 1 (Slots 0-5460)
  ├─ Node 2 (Slots 5461-10922)
  └─ Node 3 (Slots 10923-16383)
```

**Implementation:**
- Redis Cluster for horizontal scaling
- Sentinel for automatic failover
- Persistent storage (RDB/AOF)

### Vertical Scaling

**For Immediate Needs:**
- Increase machine CPU/RAM
- Upgrade database server specs
- Increase ChromaDB cache size
- Increase Celery worker pool

### Caching Strategy

```
Level 1: Frontend (Browser Cache)
  • Static assets (images, CSS, JS)
  • API responses with TTL
  • localStorage for user preferences

Level 2: Application (Redis Cache)
  • Query embeddings cache
  • Popular search results
  • User authentication tokens

Level 3: Database (Query Results)
  • Materialized views for common queries
  • ChromaDB similarity search cache
```

### Database Optimization

```sql
Indices to create:
  • users(email) - for login lookups
  • documents(user_id, created_at) - for document listing
  • chunks(document_id, chunk_index) - for chunk retrieval
  • chunks(user_id) - for user-scoped queries
  • ingestion_jobs(user_id, status) - for job tracking
```

### Vector Database Optimization

```
ChromaDB Optimization:
  • Use appropriate distance metrics (cosine, l2, ip)
  • Partition by user_id or document category
  • Batch similar queries
  • Periodically rebuild indices
  • Archive old embeddings to cold storage
```

### Monitoring & Alerting

```
Metrics to Monitor:
  • API response time (p50, p95, p99)
  • Database query latency
  • Celery task queue depth
  • Worker CPU/Memory usage
  • Cache hit rate
  • Vector DB query latency
  • Error rate by endpoint

Tools:
  • Prometheus (metrics collection)
  • Grafana (visualization)
  • ELK Stack (logging)
  • Jaeger (distributed tracing)
  • PagerDuty (alerting)
```

---

## Trade-offs

### 1. **Synchronous vs Asynchronous Processing**

**Choice: Hybrid Approach**

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Authentication | Synchronous | Must be immediate for UX |
| Document Upload | Asynchronous (Celery) | Can be time-consuming (PDFs, large files) |
| Embedding Generation | Asynchronous (Celery) | Compute-intensive, can take seconds |
| Query Processing | Synchronous | Users expect instant results |
| LLM Generation | Asynchronous (optional) | Can take 10-30 seconds |

**Trade-off:**
- ✅ Better UX: instant feedback on uploads
- ✅ Better resource utilization: non-blocking operations
- ❌ Increased complexity: job tracking, polling, state management
- ❌ Potential inconsistency: eventual consistency for data

### 2. **Vector Database Choice: ChromaDB vs Alternatives**

**Choice: ChromaDB**

| Criteria | ChromaDB | Pinecone | Weaviate | Milvus |
|----------|----------|----------|----------|--------|
| **Setup Complexity** | Simple (embedded) | Simple (cloud) | Medium | Complex |
| **Self-hosted** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Cost** | Free | Pay-per-use | Free (self) | Free (self) |
| **Scalability** | Medium | ✅ High | ✅ High | ✅ High |
| **Performance** | Good | ✅ Excellent | Good | ✅ Excellent |

**Trade-offs:**
- ✅ No vendor lock-in with self-hosted ChromaDB
- ✅ Lower operational costs initially
- ❌ Scaling limitations at massive scale (billions of vectors)
- ❌ Limited built-in backup/replication (enterprise only)
- **Recommendation:** ChromaDB for MVP; migrate to Pinecone/Milvus for scale

### 3. **Embedding Model Choice: Lightweight vs High-Quality**

**Choice: `sentence-transformers/all-MiniLM-L6-v2`**

| Model | Size | Dims | Quality | Speed |
|-------|------|------|---------|-------|
| **all-MiniLM-L6-v2** | 22MB | 384 | Good | ✅ Fast |
| all-mpnet-base-v2 | 420MB | 768 | ✅ Excellent | Medium |
| bge-large-en-v1.5 | 1.3GB | 1024 | ✅ Excellent | Slow |
| OpenAI ada | N/A | 1536 | ✅ State-of-art | Depends |

**Trade-offs:**
- ✅ Fast inference (good UX)
- ✅ Small model size (easy deployment)
- ✅ Reasonable quality for most use cases
- ❌ Lower semantic understanding vs larger models
- ❌ Non-commercial usage restrictions apply
- **Recommendation:** Current choice good for MVP; upgrade to `bge-large-en-v1.5` for production with compute resources

### 4. **LLM Provider Choice: Local vs Cloud API**

**Choice: Configurable (currently Google Gemma)**

| Approach | Pro | Con |
|----------|-----|-----|
| **Local LLM (Gemma 3.1B)** | Privacy, no API cost, offline | Lower quality, needs GPU |
| **OpenAI API** | Excellent quality, reliable | Cost per request, latency, privacy |
| **Anthropic Claude** | High quality, safety focus | Expensive, rate limits |
| **HuggingFace Inference** | Open models, flexible | Variable quality, rate limits |

**Trade-offs:**
- ✅ Self-hosted LLM provides data privacy
- ✅ No API costs at scale
- ✅ Offline capability
- ❌ Lower quality answers
- ❌ Requires GPU for decent performance
- **Recommendation:** Local LLM for MVP; switch to OpenAI/Claude for production quality

### 5. **Database Architecture: Monolithic vs Microservices**

**Choice: Monolithic with Logical Separation**

```
Monolithic Architecture (Current)
├─ Single PostgreSQL instance
├─ Single ChromaDB instance
├─ All services in one FastAPI app
└─ Shared database connections
```

**Trade-offs:**
- ✅ Simpler deployment and operations
- ✅ Easier debugging and monitoring
- ✅ Lower latency (no inter-service communication)
- ✅ Easier to maintain ACID transactions
- ❌ Scaling bottleneck: all services share resources
- ❌ Hard to scale individual components independently
- ❌ One service down = entire app down

**When to Migrate to Microservices:**
- Ingestion service becomes bottleneck (extract to separate service)
- Query service needs independent scaling
- Teams working on different features grow
- Need for polygot persistence (different databases)

### 6. **Authentication: JWT vs Session Cookies**

**Choice: JWT**

| Aspect | JWT | Session Cookies |
|--------|-----|-----------------|
| **Stateless** | ✅ Yes | ❌ No |
| **Scalability** | ✅ High | Medium |
| **Mobile-friendly** | ✅ Yes | Limited |
| **CSRF Protection** | Implicit | Needs token |
| **Token Revocation** | Hard | Easy |

**Trade-offs:**
- ✅ Scales better (no server session store needed)
- ✅ Works well with SPAs and mobile
- ❌ Token revocation is challenging
- ❌ Larger payload size
- **Mitigation for revocation:** Maintain token blacklist in Redis with TTL

### 7. **Frontend State Management: Context API vs Redux**

**Choice: React Context API**

**Trade-offs:**
- ✅ No additional dependencies
- ✅ Simpler for small-to-medium apps
- ✅ Avoids Redux boilerplate
- ❌ Performance issues with frequent updates
- ❌ No time-travel debugging
- ❌ Harder to debug complex flows

**When to migrate to Redux:**
- App state becomes complex
- Multiple components need frequent updates
- Performance profiling shows Context re-renders issue
- Team familiar with Redux patterns

### 8. **Chunking Strategy: Fixed vs Semantic**

**Choice: Fixed-size with Overlap**

```
Current: 1000 tokens per chunk, 200 token overlap
Alternative: Semantic chunking (split by sentences/paragraphs)
```

**Trade-offs:**
- ✅ Fixed chunking: predictable, simple, fast
- ✅ Overlap reduces context loss
- ❌ May split semantic units inappropriately
- ❌ Overlap wastes storage
- **Recommendation:** Add semantic chunking as future feature option

### 9. **Deduplication Strategy**

**Choice: Content Hash**

```python
hash = hashlib.sha256(content.encode()).hexdigest()
# Check if hash exists in documents table before ingesting
```

**Trade-offs:**
- ✅ Simple, fast lookup
- ✅ Prevents exact duplicate ingestion
- ❌ Doesn't detect similar (near-duplicate) documents
- ❌ Small content changes create new hash
- **Future enhancement:** Use approximate matching (LSH) for near-deduplication

### 10. **Deployment: Docker vs Bare Metal**

**Choice: Docker & Docker Compose**

**Trade-offs:**
- ✅ Consistent environments (dev ≈ production)
- ✅ Easy deployment and rollback
- ✅ Enables horizontal scaling
- ✅ Resource isolation
- ❌ Small performance overhead (~3-5%)
- ❌ Added operational complexity
- ❌ Requires Docker knowledge

**Recommendation:** Keep Docker for MVP; consider Kubernetes for production

---

## Performance Considerations

### 1. **API Response Time Targets**

```
Endpoint                    Target      Current
─────────────────────────────────────────────────
/auth/login                 < 100ms     ~50ms ✅
/auth/register              < 100ms     ~60ms ✅
/ai/query (semantic search) < 500ms     ~200ms ✅
/ingest/upload              < 1000ms    ~800ms ✅
  (returns job_id, processing async)
/health                     < 50ms      ~10ms ✅
```

### 2. **Database Query Optimization**

```sql
-- Add indices for common queries
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_chunks_document_id ON chunks(document_id);
CREATE INDEX idx_chunks_user_id ON chunks(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Connection pooling
-- Use PgBouncer: max_client_conn = 1000, default_pool_size = 25
```

### 3. **Vector Search Optimization**

```python
# ChromaDB Performance Tips:
# 1. Batch queries: search 10-50 queries at once
# 2. Use appropriate k (top_k=5 default is good)
# 3. Pre-filter by metadata before vector search
# 4. Periodic index rebuilding
# 5. Archive old embeddings
```

### 4. **Embedding Caching**

```python
# Cache query embeddings for 1 hour
cache_key = f"embedding:{hashlib.md5(query.encode()).hexdigest()}"
cached_embedding = redis.get(cache_key)
if cached_embedding:
    use_cached
else:
    embedding = generate_embedding(query)
    redis.setex(cache_key, 3600, embedding)
```

### 5. **Frontend Performance**

```javascript
// Next.js optimization strategies:
1. Code splitting (automatic with App Router)
2. Image optimization (next/image)
3. Dynamic imports for heavy components
4. API response caching with SWR or React Query
5. Lazy load non-critical routes

// Metrics
Metric          Target      Tool
─────────────────────────────────
First Contentful Paint   < 1.8s   Lighthouse
Largest Contentful Paint < 2.5s   Lighthouse
Cumulative Layout Shift  < 0.1    Lighthouse
```

### 6. **Memory Management**

```python
# Celery worker memory optimization
# 1. Set max_concurrency based on available memory
# 2. Use task soft time limits to prevent memory leaks
# 3. Monitor with memory_profiler
# 4. Implement task result expiration

# FastAPI memory optimization
# 1. Use streaming responses for large files
# 2. Implement connection pooling
# 3. Use async generators for streaming
```

---

## Future Architecture Enhancements

### Phase 2: Advanced Features
1. **Multi-modal RAG**: Support images, tables, charts
2. **Real-time Collaboration**: WebSocket support for live document updates
3. **Advanced Chunking**: Semantic chunking with thematic clustering
4. **Fine-tuned Models**: Custom model fine-tuning on domain data
5. **Graph RAG**: Knowledge graph construction for complex reasoning

### Phase 3: Enterprise Features
1. **Multi-tenancy**: Isolated data per organization
2. **RBAC**: Fine-grained access control
3. **Audit Logging**: Complete audit trail
4. **Advanced Search**: Full-text search + semantic search
5. **Document Versioning**: Track document history

### Phase 4: Scale
1. **Microservices**: Separate ingestion, query, and indexing services
2. **GraphQL**: Add GraphQL interface alongside REST
3. **Machine Learning Pipeline**: Continuous model training
4. **Advanced Caching**: Distributed cache layer (Redis Cluster)
5. **Event Streaming**: Kafka for event-driven architecture

---

## Conclusion

This architecture provides a solid foundation for a modern AI-powered document management system. The choices made prioritize:
- **Developer Experience**: Simple to understand and modify
- **Operational Simplicity**: Easy to deploy and maintain
- **User Experience**: Fast response times
- **Cost**: Minimal infrastructure requirements

As the system grows, architectural decisions can be revisited and improved based on specific bottlenecks and requirements identified through monitoring and profiling.

**Last Updated**: May 2026
