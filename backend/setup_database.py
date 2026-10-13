"""
SquadSync - Automated PostgreSQL Setup, Migration & Seeding Tool
===============================================================
Ensures that:
1. PostgreSQL server is online and reachable.
2. Target database (squadsync_db) exists (creates it if missing).
3. All Alembic database migrations are applied to head.
4. Core tables and constraints are verified.
5. Rich demo data (Users, DNA, Roster, Game Accounts, Stats) is seeded.
6. A comprehensive diagnostic status report is displayed.

Usage:
  python setup_database.py            # Check connection, migrate, seed if empty
  python setup_database.py --seed     # Force seed test data
  python setup_database.py --reset    # Wipe tables, re-migrate and re-seed from scratch
  python setup_database.py --check    # Check status without modifying data
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import asyncpg
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.models import Base
from seed_data import seed as run_seed_data


# Set stdout encoding for Windows console compatibility
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def print_step(title: str):
    print(f"\n\033[1;36m===> {title}\033[0m")

def print_success(msg: str):
    print(f"  \033[32m[+] {msg}\033[0m")

def print_warning(msg: str):
    print(f"  \033[33m[!] {msg}\033[0m")

def print_error(msg: str):
    print(f"  \033[31m[-] {msg}\033[0m")

def print_info(msg: str):
    print(f"  \033[34m[*] {msg}\033[0m")


async def check_server_and_ensure_db():
    """Checks PostgreSQL connectivity and creates squadsync_db if missing."""
    print_step("1. Verifying PostgreSQL Server Connectivity & Target Database")
    
    server = settings.POSTGRES_SERVER
    port = settings.POSTGRES_PORT
    user = settings.POSTGRES_USER
    password = settings.POSTGRES_PASSWORD
    target_db = settings.POSTGRES_DB

    print_info(f"Connecting to host: {server}:{port} as user '{user}'...")

    # First attempt: connect directly to target database
    try:
        conn = await asyncpg.connect(
            host=server,
            port=port,
            user=user,
            password=password,
            database=target_db,
            timeout=5.0,
        )
        await conn.close()
        print_success(f"Successfully connected to target database '{target_db}' on port {port}.")
        return True
    except asyncpg.InvalidCatalogNameError:
        print_warning(f"Database '{target_db}' does not exist yet. Creating it now...")
    except Exception as e:
        print_error(f"Cannot connect to PostgreSQL on {server}:{port}: {e}")
        print_info("Common remedies:")
        print_info(f" - Ensure PostgreSQL service is started.")
        print_info(f" - Check if your PostgreSQL runs on port 5432 or 5431 (currently configured for {port} in backend/.env).")
        print_info(f" - Verify password in backend/.env (currently: '{password}').")
        return False

    # Connect to default 'postgres' database to create target_db
    try:
        conn = await asyncpg.connect(
            host=server,
            port=port,
            user=user,
            password=password,
            database="postgres",
            timeout=5.0,
        )
        # Check if target_db exists
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", target_db
        )
        if not exists:
            # CREATE DATABASE cannot run in transaction block
            await conn.execute(f'CREATE DATABASE "{target_db}" OWNER "{user}";')
            print_success(f"Created database '{target_db}' successfully!")
        await conn.close()
        return True
    except Exception as e:
        print_error(f"Failed to create database '{target_db}' via maintenance db: {e}")
        return False


async def run_alembic_migrations():
    """Runs Alembic upgrade head in a worker thread to apply all pending schema changes."""
    print_step("2. Applying Alembic Schema Migrations")
    alembic_ini_path = BACKEND_DIR / "alembic.ini"
    if not alembic_ini_path.exists():
        print_error(f"Alembic config not found at: {alembic_ini_path}")
        return False

    try:
        cfg = Config(str(alembic_ini_path))
        await asyncio.to_thread(command.upgrade, cfg, "head")
        print_success("Alembic schema migrations successfully applied to 'head'!")
        return True
    except Exception as e:
        print_error(f"Alembic migration failed: {e}")
        return False


async def reset_database():
    """Drops all tables and re-creates them using SQLAlchemy Base metadata."""
    print_step("Re-initializing PostgreSQL Schema (Reset Mode)")
    temp_engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False)
    async with temp_engine.begin() as conn:
        print_warning("Dropping existing tables and foreign key constraints...")
        # Drop with CASCADE via raw SQL if needed, or drop_all
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        print_success("Schema wiped. Rebuilding tables...")
        await conn.run_sync(Base.metadata.create_all)
    await temp_engine.dispose()
    print_success("All tables rebuilt from DeclarativeBase!")


async def get_table_counts():
    """Returns row counts for all tables in the public schema."""
    counts = {}
    try:
        conn = await asyncpg.connect(
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            database=settings.POSTGRES_DB,
            timeout=5.0,
        )
        tables = await conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        )
        for row in tables:
            tname = row["table_name"]
            count = await conn.fetchval(f'SELECT count(*) FROM "{tname}"')
            counts[tname] = count
        await conn.close()
    except Exception as e:
        print_error(f"Error reading table counts: {e}")
    return counts


async def main():
    parser = argparse.ArgumentParser(description="SquadSync PostgreSQL Database Setup & Seeder")
    parser.add_argument("--seed", action="store_true", help="Force re-seeding demo data")
    parser.add_argument("--reset", action="store_true", help="Wipe database, re-create schema and seed afresh")
    parser.add_argument("--check", action="store_true", help="Only check database status without modifications")
    args = parser.parse_args()

    print("\n" + "=" * 65)
    print("        SQUADSYNC - POSTGRESQL DATABASE SETUP UTILITY")
    print("=" * 65)
    print(f" Database Server : {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}")
    print(f" Database Name   : {settings.POSTGRES_DB}")
    print(f" Database User   : {settings.POSTGRES_USER}")
    print(f" Connection URI  : {settings.SQLALCHEMY_DATABASE_URI.split('@')[0]}@...")
    print("=" * 65)

    # 1. Connectivity Check & DB Existence
    db_ready = await check_server_and_ensure_db()
    if not db_ready:
        print_error("\n[ABORTED] Could not establish connection to PostgreSQL.")
        sys.exit(1)

    if args.check:
        print_step("Checking Database Status & Table Inventory")
        counts = await get_table_counts()
        for tname, cnt in counts.items():
            print(f"  • {tname:<25} : {cnt} rows")
        print_success("Database check complete.")
        return

    # 2. Reset or Run Alembic Migrations
    if args.reset:
        await reset_database()
    else:
        migrated = await run_alembic_migrations()
        if not migrated:
            print_warning("Falling back to SQLAlchemy Base.metadata.create_all...")
            temp_engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False)
            async with temp_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            await temp_engine.dispose()
            print_success("SQLAlchemy tables verified/created!")

    # 3. Check existing data or seed
    print_step("3. Verifying Seed Data & Application Demo Records")
    counts = await get_table_counts()
    user_count = counts.get("users", 0)

    if user_count == 0 or args.seed or args.reset:
        print_info(f"Target database has {user_count} users. Seeding full test suite...")
        await run_seed_data()
        counts = await get_table_counts()
    else:
        print_success(f"Database already populated with {user_count} users and active rosters.")

    # 4. Final Diagnostics & Credentials Summary
    print_step("4. PostgreSQL Setup & Inventory Summary")
    print("\n  Table Inventory:")
    for tname, cnt in counts.items():
        print(f"    • {tname:<24} : \033[1;32m{cnt}\033[0m rows")

    print("\n" + "=" * 65)
    print(" \033[1;32m[SUCCESS] POSTGRESQL DATABASE IS READY FOR PRODUCTION / DEV\033[0m")
    print("=" * 65)
    print("  Pre-seeded Test Accounts:")
    print("   1. Pro Gamer Account  : \033[1;36mgamer@squadsync.gg\033[0m   | Password: \033[1;33mpassword123\033[0m")
    print("   2. System Admin       : \033[1;36madmin@squadsync.gg\033[0m   | Password: \033[1;33mpassword123\033[0m")
    print("   3. Squadmates         : nova@squadsync.gg, echo@squadsync.gg, ghost@squadsync.gg")
    print("\n  Services:")
    print("   - Backend API Docs    : http://127.0.0.1:8000/docs")
    print("   - Health Check        : http://127.0.0.1:8000/health")
    print("   - Frontend Web App    : http://localhost:5173")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
