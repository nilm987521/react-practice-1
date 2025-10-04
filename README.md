# 井字遊戲 AI 後端

混合策略井字遊戲 AI：結合 Q-Learning 強化學習與 Minimax 演算法，提供 HTTP API 與前端整合。

## 功能特色

- 🤖 混合策略 AI：Q-Learning + Minimax + 啟發式規則
- 🎯 自我對弈訓練系統
- 🧠 智能決策：必勝必擋自動偵測
- 💾 模型持久化（自動儲存/載入）
- 🌐 Flask REST API 後端
- 📊 訓練統計資料追蹤
- ⚡ Alpha-Beta 剪枝優化

## 安裝

1. 安裝 Python 依賴：

```bash
pip install -r requirements.txt
```

## 使用方式

### 1. 訓練 AI（首次使用或重新訓練）

直接執行 AI 模組進行訓練：

```bash
python ai_agent.py
```

這會訓練 50000 局，並自動儲存模型到 `model/q_table.pkl`。

### 2. 啟動後端服務

```bash
python app.py
```

伺服器會在 `http://localhost:1234` 啟動。

### 3. 與前端整合

前端已經設定好呼叫 `http://localhost:1234/v1`，直接啟動前端即可使用。

```bash
cd ..
npm start
```

## API 端點

### POST /v1
簡化的 AI 對弈端點。

**請求格式：**
```json
{
  "board": [null, "X", "O", null, null, null, null, null, null],
  "symbol": "O"
}
```

**參數說明：**
- `board`: 長度為 9 的陣列，表示棋盤狀態（`null`=空位, `"X"`, `"O"`）
- `symbol`: AI 的符號（`"X"` 或 `"O"`）

**回應格式：**
```json
{
  "move": 4
}
```

**回應說明：**
- `move`: AI 選擇的位置（0-8）

### POST /train
訓練 AI 模型。

**請求：**
```json
{
  "episodes": 10000
}
```

### POST /reset
重置 AI 模型到初始狀態。

### GET /stats
獲取 AI 訓練統計資料。

**回應：**
```json
{
  "q_table_size": 5478,
  "total_games": 50000,
  "wins": 23456,
  "losses": 12345,
  "draws": 14199
}
```

## AI 架構

### 混合決策策略

AI 使用三層決策機制，確保最佳表現：

#### 第一層：規則式判斷（最高優先）
1. **必勝檢測**：如果有位置可以立即獲勝，直接下該位置
2. **必擋檢測**：如果對手下一步能獲勝，立即阻擋

#### 第二層：Q-Learning 強化學習
使用 Q-Learning 演算法從自我對弈中學習：

```
Q(s,a) = Q(s,a) + α * [r + γ * max(Q(s',a')) - Q(s,a)]
```

**參數設定：**
- 學習率 (α): 0.1
- 折扣因子 (γ): 0.9
- 探索率 (ε): 訓練時 0.1

**改進的獎勵機制：**
- 勝利：1.0 + 額外獎勵（越早獲勝，獎勵越高）
- 失敗：-1.0
- 平局：0.1（降低平局吸引力）

#### 第三層：Minimax 演算法（後備策略）
當 Q-table 沒有足夠知識時，使用 Minimax 完美演算法：
- 帶 Alpha-Beta 剪枝優化
- 保證在未知狀態下做出最佳決策
- 理論上無法被打敗

### 決策流程

```
收到棋盤狀態
    ↓
檢查必勝位置 → 有 → 立即下該位置
    ↓ 無
檢查必擋位置 → 有 → 立即阻擋
    ↓ 無
查詢 Q-table → Q 值存在 → 選擇最高 Q 值
    ↓ Q 值不足
使用 Minimax → 計算最佳移動
    ↓
返回最佳位置
```

## 檔案結構

```
machine-learning/
├── app.py              # Flask 後端主程式
├── ai_agent.py         # AI 核心邏輯
├── requirements.txt    # Python 依賴
├── README.md          # 說明文件
└── model/             # 模型儲存目錄
    └── q_table.pkl    # 訓練好的 Q-table
```

## 技術細節

### 棋盤表示
- 內部格式：`[1=X, -1=O, 0=空位]`
- API 格式：`["X", "O", null]`

### 效能優化
- Q-table 使用 `defaultdict` 動態擴展，節省記憶體
- Minimax 採用 Alpha-Beta 剪枝，減少計算量
- 模型自動持久化，避免重複訓練

### 訓練建議
- 首次訓練建議 50,000 局以上
- 可透過 `/train` API 持續訓練
- 訓練越多局，Q-table 知識越豐富

## 常見問題

**Q: AI 還是太弱怎麼辦？**
A: 執行 `python ai_agent.py` 重新訓練，預設會訓練 50,000 局。訓練完成後重啟後端。

**Q: AI 會輸嗎？**
A: 理論上不會。AI 結合了 Minimax 完美演算法，最差結果是平局。

**Q: 可以調整 AI 難度嗎？**
A: 可以修改 `ai_agent.py:141` 的條件，調整何時使用 Minimax。

**Q: 訓練需要多久？**
A: 50,000 局約需 1-2 分鐘（依硬體而定）。
