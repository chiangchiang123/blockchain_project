# ──────────────────────────────────────────────
#  Confession App — 開發用 Makefile
# ──────────────────────────────────────────────

# source 指令是 bash 內建，預設的 /bin/sh 不支援，必須指定 bash
SHELL := /bin/bash

# .PHONY：告訴 make 這些 target 不是真實的檔案名稱
# 若不加，make 看到資料夾 "frontend" 存在就會誤以為已完成而不執行
.PHONY: dev node backend frontend deploy stop setup setup-backend setup-blockchain setup-frontend

# ── 一鍵啟動所有服務 ──────────────────────────
dev:
	@echo ">>> [1/4] 啟動 Hardhat 本地節點..."
	@cd blockchain && npx hardhat node &
	@echo ">>> 等待節點就緒 (10s)..."
	@sleep 10
	@echo ">>> [2/4] 部署合約..."
	@cd blockchain && npx hardhat ignition deploy ignition/modules/Confession.ts --network localhost --reset
	@echo ">>> [3/4] 啟動 FastAPI 後端..."
	@cd backend && source .venv/bin/activate && uvicorn main:app --reload &
	@echo ">>> [4/4] 啟動前端..."
	@cd frontend && npm run dev

# ── 單獨啟動各服務 ────────────────────────────
node:
	cd blockchain && npx hardhat node

backend:
	cd backend && source .venv/bin/activate && uvicorn main:app --reload

frontend:
	cd frontend && npm run dev

# ── 部署合約到本地節點 ────────────────────────
# 注意：執行前必須先確認 hardhat node 已在跑
# --reset：強制重新部署，清除舊的 journal 紀錄
deploy:
	cd blockchain && npx hardhat ignition deploy ignition/modules/Confession.ts --network localhost --reset

# ── 停止所有服務 ──────────────────────────────
# || true：就算 process 不存在（pkill 找不到）也不回傳錯誤
stop:
	@pkill -f "hardhat node"      || true
	@pkill -f "uvicorn main:app"  || true
	@pkill -f "vite"              || true
	@echo "All services stopped."

# ── 環境初始化（第一次 clone 後執行）─────────
setup: setup-backend setup-blockchain setup-frontend
	@echo "========================================="
	@echo "  環境建置完成，可以執行 make dev 了！"
	@echo "========================================="

setup-backend:
	@echo ">>> [Backend] 建立 Python 虛擬環境..."
	python3 -m venv backend/.venv
	@echo ">>> [Backend] 安裝套件..."
	backend/.venv/bin/pip install --upgrade pip
	backend/.venv/bin/pip install -r backend/requirements.txt
	@echo ">>> [Backend] 建立 .env..."
	cp -n backend/.env.example backend/.env

setup-blockchain:
	@echo ">>> [Blockchain] 安裝 npm 套件..."
	cd blockchain && npm install

setup-frontend:
	@echo ">>> [Frontend] 安裝 npm 套件..."
	cd frontend && npm install
	@echo ">>> [Frontend] 建立 .env..."
	cp -n frontend/.env.example frontend/.env
