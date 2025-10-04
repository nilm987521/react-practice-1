from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ai_agent import TicTacToeAI
import numpy as np
import os

# 指向前端 build 目錄
app = Flask(__name__,
            static_folder='./build',
            static_url_path='')
CORS(app)

# 初始化 AI
ai_agent = TicTacToeAI()
ai_agent.load_model()

@app.route('/v1', methods=['POST'])
def chat_completions():
    """
    簡化的 API 介面
    接收: { board: [...], symbol: 'O' }
    回傳: { move: 4 }
    """

    print(request)
    data = request.get_json()

    # 獲取棋盤狀態和角色
    board = data.get('board')
    symbol = data.get('symbol', 'O')

    if board is None:
        return jsonify({'error': 'Missing board parameter'}), 400

    if len(board) != 9:
        return jsonify({'error': 'Board must have 9 elements'}), 400

    # 轉換為 AI 可用的格式 (null -> 0, 'X' -> 1, 'O' -> -1)
    board_state = []
    for cell in board:
        if cell == 'X':
            board_state.append(1)
        elif cell == 'O':
            board_state.append(-1)
        else:  # null
            board_state.append(0)

    # 獲取 AI 的下一步
    move = ai_agent.get_best_move(board_state, symbol=symbol)

    # 返回簡化的格式（轉換為 Python int）
    return jsonify({'move': int(move)})

@app.route('/train', methods=['POST'])
def train():
    """
    訓練 AI 模型
    """
    data = request.get_json()
    episodes = data.get('episodes', 10000)

    ai_agent.train(episodes=episodes)
    ai_agent.save_model()

    return jsonify({
        'status': 'success',
        'message': f'訓練完成 {episodes} 局'
    })

@app.route('/reset', methods=['POST'])
def reset():
    """
    重置 AI 模型
    """
    ai_agent.reset_model()
    return jsonify({
        'status': 'success',
        'message': 'AI 模型已重置'
    })

@app.route('/stats', methods=['GET'])
def stats():
    """
    獲取 AI 統計資料
    """
    return jsonify(ai_agent.get_stats())

# 提供前端靜態檔案
@app.route('/')
def index():
    """
    提供前端首頁
    """
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """
    提供其他靜態資源（JS, CSS, 圖片等）
    如果檔案不存在，返回 index.html（支援 React Router）
    """
    if path.startswith('v1') or path.startswith('train') or path.startswith('reset') or path.startswith('stats'):
        # API 路由，不處理
        return jsonify({'error': 'Not found'}), 404

    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        # 支援 React Router（SPA）
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=1234, debug=True)
