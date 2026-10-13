@echo off
title SquadSync Database Setup
echo ====================================================================
echo        SquadSync - PostgreSQL Database Initialization
echo ====================================================================
echo.
if exist "backend\.venv\Scripts\python.exe" (
    "backend\.venv\Scripts\python.exe" backend\setup_database.py %*
) else (
    python backend\setup_database.py %*
)
pause
