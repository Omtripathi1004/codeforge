import { RepositoryContext, Mission, SolutionOption } from '../types/codeforge';

export const SAMPLE_REPOSITORIES: RepositoryContext[] = [
  {
    id: 'repo_fastapi_auth',
    name: 'nexus-backend-api',
    fullName: 'acme-corp/nexus-backend-api',
    defaultBranch: 'main',
    language: 'Python',
    framework: 'FastAPI + SQLAlchemy + Redis',
    packageManager: 'poetry / pip',
    structure: {
      totalFiles: 48,
      entryPoints: ['app/main.py', 'app/api/v1/router.py'],
      apiEndpoints: [
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/refresh',
        'POST /api/v1/payments/charge',
        'GET /api/v1/users/me',
        'GET /api/v1/health'
      ],
      databaseModels: ['User', 'SessionToken', 'PaymentLedger', 'AuditLog'],
      testSuites: ['tests/test_auth_flow.py', 'tests/test_payments.py', 'tests/test_rate_limit.py'],
      riskyFiles: ['app/services/token_manager.py', 'app/middleware/auth.py', 'app/database/session.py'],
      dependencies: {
        'fastapi': '^0.111.0',
        'uvicorn': '^0.30.1',
        'sqlalchemy': '^2.0.30',
        'redis': '^5.0.4',
        'pyjwt': '^2.8.0',
        'pydantic': '^2.7.4',
        'pytest': '^8.2.1',
        'httpx': '^0.27.0'
      }
    },
    stats: {
      stars: 432,
      forks: 89,
      openIssues: 14,
      lastCommit: '2 hours ago'
    }
  },
  {
    id: 'repo_nextjs_commerce',
    name: 'hyper-checkout-service',
    fullName: 'acme-corp/hyper-checkout-service',
    defaultBranch: 'main',
    language: 'TypeScript',
    framework: 'Next.js 14 App Router + Stripe SDK',
    packageManager: 'pnpm',
    structure: {
      totalFiles: 62,
      entryPoints: ['src/app/api/checkout/route.ts', 'src/middleware.ts'],
      apiEndpoints: [
        'POST /api/checkout/session',
        'POST /api/webhook/stripe',
        'GET /api/orders/[id]'
      ],
      databaseModels: ['Order', 'OrderItem', 'IdempotencyRecord'],
      testSuites: ['__tests__/checkout.test.ts', '__tests__/idempotency.test.ts'],
      riskyFiles: ['src/lib/stripe.ts', 'src/lib/idempotency.ts'],
      dependencies: {
        'next': '14.2.15',
        'stripe': '^16.1.0',
        '@prisma/client': '^5.14.0',
        'ioredis': '^5.4.1',
        'zod': '^3.23.8'
      }
    },
    stats: {
      stars: 1280,
      forks: 210,
      openIssues: 26,
      lastCommit: '4 hours ago'
    }
  },
  {
    id: 'repo_distributed_queue',
    name: 'event-stream-gateway',
    fullName: 'acme-corp/event-stream-gateway',
    defaultBranch: 'main',
    language: 'Python',
    framework: 'AsyncIO + RabbitMQ Worker Pool',
    packageManager: 'uv',
    structure: {
      totalFiles: 35,
      entryPoints: ['src/worker.py', 'src/consumer.py'],
      apiEndpoints: ['WS /events/stream', 'GET /metrics'],
      databaseModels: ['EventMessage', 'DeadLetterQueue'],
      testSuites: ['tests/test_concurrency.py', 'tests/test_retry.py'],
      riskyFiles: ['src/connection_pool.py', 'src/ack_manager.py'],
      dependencies: {
        'aio-pika': '^9.4.1',
        'prometheus-client': '^0.20.0',
        'pytest-asyncio': '^0.23.6'
      }
    },
    stats: {
      stars: 640,
      forks: 74,
      openIssues: 8,
      lastCommit: '1 day ago'
    }
  }
];

export const DEMO_PRESET_MISSIONS: Record<string, Partial<Mission>> = {
  'repo_fastapi_auth': {
    issueNumber: 142,
    issueTitle: 'Fix JWT Race Condition & Token Replay during Concurrent Token Refresh',
    issueDescription: `Under high concurrency, when two mobile clients send simultaneous refresh requests with the same refresh token, one of the requests triggers a token invalidation exception while the other issues a duplicate JWT pair. This causes random 401 logouts for active users. 
    
Requirements:
1. Implement Redis-backed distributed atomic lock (or single-flight deduplication) with 15-second grace period for valid in-flight rotations.
2. Ensure invalid/replayed tokens are flagged for potential token-theft breach detection.
3. Pass tests in 'tests/test_auth_flow.py' with 100 concurrent simulated requests.`,
    solutions: {
      solution_a: {
        id: 'solution_a',
        title: 'Solution A — Conservative / Minimal Change',
        subtitle: 'In-Memory Lock + Atomic Refresh Grace Window',
        type: 'conservative',
        tagline: 'Preserves existing session table; patches token_manager.py with minimal blast radius.',
        description: 'Implements an atomic Redis SET NX key with a 15-second grace window in the existing `token_manager.py` without modifying the underlying database schema.',
        filesAffected: ['app/services/token_manager.py', 'tests/test_auth_flow.py'],
        linesAdded: 24,
        linesRemoved: 8,
        complexity: 'Low',
        risk: 'Low',
        securityImpact: 'Eliminates concurrent token collision; maintains token security.',
        performanceImpact: '0.8ms Redis lock overhead during refresh only.',
        dependencyImpact: 'Zero new dependencies. Uses existing redis-py.',
        testImpact: 'Adds 2 concurrent unit tests in test_auth_flow.py.',
        estimatedEffort: 'Fast (~1 min autonomous build & verify)',
        recommended: false,
        explanation: 'Best if you want the smallest possible diff that quickly fixes the 401 bug with minimal regression risk.',
        diffs: [
          {
            filePath: 'app/services/token_manager.py',
            language: 'python',
            oldCode: `async def refresh_access_token(db: AsyncSession, refresh_token: str) -> TokenPair:
    payload = verify_jwt(refresh_token)
    user_id = payload.get("sub")
    
    # Bug: Unsynchronized check and immediate invalidation
    token_record = await db.query(SessionToken).filter_by(token=refresh_token).first()
    if not token_record or token_record.is_revoked:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    token_record.is_revoked = True
    await db.commit()
    
    return create_token_pair(user_id)`,
            newCode: `async def refresh_access_token(db: AsyncSession, refresh_token: str, redis: Redis) -> TokenPair:
    payload = verify_jwt(refresh_token)
    user_id = payload.get("sub")
    lock_key = f"lock:refresh:{refresh_token}"
    
    # Atomic rotation lock with 15s grace period to handle concurrent network retries
    async with redis.lock(lock_key, timeout=10, blocking_timeout=2):
        cached_pair = await redis.get(f"grace:{refresh_token}")
        if cached_pair:
            return TokenPair.parse_raw(cached_pair)
            
        token_record = await db.query(SessionToken).filter_by(token=refresh_token).with_for_update().first()
        if not token_record or token_record.is_revoked:
            # Check for possible replay theft
            await log_security_event(user_id, "TOKEN_REPLAY_DETECTED")
            raise HTTPException(status_code=401, detail="Invalid or replayed refresh token")
            
        token_record.is_revoked = True
        new_pair = create_token_pair(user_id)
        
        # Store in grace cache for 15s to serve concurrent requests
        await redis.setex(f"grace:{refresh_token}", 15, new_pair.json())
        await db.commit()
        return new_pair`
          }
        ]
      },
      solution_b: {
        id: 'solution_b',
        title: 'Solution B — Optimized / Architecture Improvement',
        subtitle: 'Single-Flight Token Rotation + Cryptographic Family Tree & Threat Detection',
        type: 'architectural',
        tagline: 'Modern token family rotation pattern with automated breach containment & revocation cascades.',
        description: 'Implements RFC 6749 recommended Token Family IDs. If an old token in the family is presented after rotation, CodeForge revokes all child tokens immediately to neutralize stolen credentials.',
        filesAffected: [
          'app/services/token_manager.py',
          'app/database/models.py',
          'app/middleware/auth.py',
          'tests/test_auth_flow.py'
        ],
        linesAdded: 68,
        linesRemoved: 14,
        complexity: 'Moderate',
        risk: 'Medium',
        securityImpact: 'Enterprise-grade zero-trust token family rotation with automatic revocation cascades on breach.',
        performanceImpact: 'Optimized via pipelined Redis transaction + asynchronous audit logging.',
        dependencyImpact: 'Zero external dependencies; uses existing SQLAlchemy and Redis stack.',
        testImpact: 'Adds comprehensive fuzzing, concurrency stress test (200 workers) and breach recovery tests.',
        estimatedEffort: 'Comprehensive (~2 min autonomous build, test, and verification)',
        recommended: true,
        explanation: 'Recommended: This architectural solution permanently eliminates race conditions while dramatically strengthening the backend against credential theft.',
        diffs: [
          {
            filePath: 'app/services/token_manager.py',
            language: 'python',
            oldCode: `async def refresh_access_token(db: AsyncSession, refresh_token: str) -> TokenPair:
    payload = verify_jwt(refresh_token)
    user_id = payload.get("sub")
    token_record = await db.query(SessionToken).filter_by(token=refresh_token).first()
    if not token_record or token_record.is_revoked:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    token_record.is_revoked = True
    await db.commit()
    return create_token_pair(user_id)`,
            newCode: `async def refresh_access_token(
    db: AsyncSession, 
    refresh_token: str, 
    redis: Redis,
    client_ip: str
) -> TokenPair:
    payload = verify_jwt(refresh_token)
    user_id = payload.get("sub")
    family_id = payload.get("family_id")
    
    lock_key = f"token_family_lock:{family_id}"
    
    async with redis.lock(lock_key, timeout=12, blocking_timeout=3):
        # 1. Check if token was rotated in the last 15s grace window
        cached_result = await redis.get(f"token_grace:{refresh_token}")
        if cached_result:
            return TokenPair.model_validate_json(cached_result)
            
        token_record = await db.query(SessionToken).filter_by(token_hash=hash_token(refresh_token)).first()
        
        # 2. Token Family Breach Detection: If token already used, revoke entire family
        if token_record and token_record.is_revoked:
            await db.execute(
                update(SessionToken)
                .where(SessionToken.family_id == family_id)
                .values(is_revoked=True, revoked_reason="FAMILY_COMPROMISE")
            )
            await db.commit()
            await alert_security_soc(user_id, family_id, client_ip)
            raise HTTPException(status_code=401, detail="Token family compromised. All sessions revoked.")
            
        if not token_record:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        # 3. Issue next generation in family
        token_record.is_revoked = True
        new_token_pair = generate_family_token_pair(user_id, family_id)
        
        new_session = SessionToken(
            user_id=user_id,
            family_id=family_id,
            token_hash=hash_token(new_token_pair.refresh_token),
            expires_at=datetime.utcnow() + timedelta(days=30)
        )
        db.add(new_session)
        
        # 4. Cache grace rotation in Redis
        await redis.setex(f"token_grace:{refresh_token}", 15, new_token_pair.model_dump_json())
        await db.commit()
        return new_token_pair`
          },
          {
            filePath: 'app/database/models.py',
            language: 'python',
            oldCode: `class SessionToken(Base):
    __tablename__ = "session_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String(512), unique=True)
    is_revoked = Column(Boolean, default=False)`,
            newCode: `class SessionToken(Base):
    __tablename__ = "session_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    family_id = Column(String(64), index=True, nullable=False)
    token_hash = Column(String(64), unique=True, index=True)
    is_revoked = Column(Boolean, default=False)
    revoked_reason = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)`
          }
        ]
      }
    }
  }
};
