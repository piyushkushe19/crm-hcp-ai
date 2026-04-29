"""
Backend API tests using pytest + httpx AsyncClient.
Run with: pytest tests/ -v

These tests use an in-memory SQLite DB so no PostgreSQL is needed for CI.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Use SQLite for tests (no PostgreSQL required)
TEST_DB_URL = "sqlite+aiosqlite:///./test_crm.db"

import os
os.environ["DATABASE_URL"] = TEST_DB_URL
os.environ["GROQ_API_KEY"] = "test_key"
os.environ["SECRET_KEY"] = "test-secret-key-for-testing"

from main import app
from app.db.database import get_db, Base
from sqlalchemy.pool import StaticPool


# ── Test Database Fixture ──────────────────────────────────────────────────────

@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(
        TEST_DB_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine):
    session_factory = async_sessionmaker(bind=test_engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session):
    """HTTP client with overridden DB dependency."""
    async def override_db():
        yield db_session

    app.dependency_overrides[get_db] = override_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


# ── Helper: get auth token ─────────────────────────────────────────────────────

async def get_token(client: AsyncClient) -> str:
    resp = await client.post("/auth/login", json={"username": "admin", "password": "password123"})
    return resp.json()["access_token"]


# ── Auth Tests ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_success(client):
    resp = await client.post("/auth/login", json={"username": "admin", "password": "password123"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    resp = await client.post("/auth/login", json={"username": "admin", "password": "wrong"})
    assert resp.status_code == 401


# ── Interaction Tests ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_log_interaction(client):
    token = await get_token(client)
    payload = {
        "hcp_name": "Dr. Test",
        "hospital": "Test Hospital",
        "interaction_type": "Visit",
        "sentiment": "Positive",
        "follow_up_required": False,
        "source": "form",
    }
    resp = await client.post(
        "/interactions/log",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["hcp_name"] == "Dr. Test"
    assert data["id"] is not None


@pytest.mark.asyncio
async def test_list_interactions(client):
    token = await get_token(client)
    resp = await client.get("/interactions", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_edit_interaction(client):
    token = await get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create first
    create = await client.post("/interactions/log", json={
        "hcp_name": "Dr. Edit Test", "hospital": "Edit Hospital",
    }, headers=headers)
    iid = create.json()["id"]

    # Edit notes
    edit = await client.put(f"/interactions/edit/{iid}", json={"notes": "Updated note"}, headers=headers)
    assert edit.status_code == 200
    assert edit.json()["notes"] == "Updated note"


@pytest.mark.asyncio
async def test_delete_interaction(client):
    token = await get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    create = await client.post("/interactions/log", json={
        "hcp_name": "Dr. Delete", "hospital": "Delete Hospital",
    }, headers=headers)
    iid = create.json()["id"]

    delete = await client.delete(f"/interactions/{iid}", headers=headers)
    assert delete.status_code == 204

    # Verify gone
    all_resp = await client.get("/interactions", headers=headers)
    ids = [i["id"] for i in all_resp.json()]
    assert iid not in ids


@pytest.mark.asyncio
async def test_edit_nonexistent(client):
    token = await get_token(client)
    resp = await client.put(
        "/interactions/edit/99999",
        json={"notes": "x"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_unauthorized_access(client):
    resp = await client.get("/interactions")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_health_endpoint(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
