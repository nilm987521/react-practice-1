import numpy as np
import pickle
import os
from collections import defaultdict

class TicTacToeAI:
    """
    使用 Q-Learning 強化學習的井字遊戲 AI
    """

    def __init__(self, learning_rate=0.1, discount_factor=0.9, epsilon=0.1):
        """
        初始化 AI

        Args:
            learning_rate: 學習率 (alpha)
            discount_factor: 折扣因子 (gamma)
            epsilon: 探索率 (epsilon-greedy)
        """
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        self.q_table = defaultdict(lambda: defaultdict(float))
        self.model_path = 'model/q_table.pkl'
        self.stats = {
            'total_games': 0,
            'wins': 0,
            'losses': 0,
            'draws': 0
        }

    def get_state_key(self, board):
        """將棋盤狀態轉換為字符串鍵"""
        return tuple(board)

    def get_valid_moves(self, board):
        """獲取所有合法的移動"""
        return [i for i, cell in enumerate(board) if cell == 0]

    def _minimax(self, board, is_maximizing, alpha=-float('inf'), beta=float('inf')):
        """
        Minimax 演算法（帶 Alpha-Beta 剪枝）

        Args:
            board: 棋盤狀態
            is_maximizing: 是否為最大化玩家 (O = True, X = False)
            alpha: Alpha 值
            beta: Beta 值

        Returns:
            最佳分數
        """
        winner = self.check_winner(board)

        # 終止條件
        if winner == -1:  # O 贏
            return 10
        elif winner == 1:  # X 贏
            return -10
        elif winner == 0:  # 平局
            return 0

        valid_moves = self.get_valid_moves(board)
        if not valid_moves:
            return 0

        if is_maximizing:
            max_eval = -float('inf')
            for move in valid_moves:
                board[move] = -1  # O
                eval_score = self._minimax(board, False, alpha, beta)
                board[move] = 0
                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    break
            return max_eval
        else:
            min_eval = float('inf')
            for move in valid_moves:
                board[move] = 1  # X
                eval_score = self._minimax(board, True, alpha, beta)
                board[move] = 0
                min_eval = min(min_eval, eval_score)
                beta = min(beta, eval_score)
                if beta <= alpha:
                    break
            return min_eval

    def _get_minimax_move(self, board):
        """
        使用 Minimax 演算法獲取最佳移動
        """
        valid_moves = self.get_valid_moves(board)
        best_move = None
        best_score = -float('inf')

        for move in valid_moves:
            board[move] = -1  # O
            score = self._minimax(board, False)
            board[move] = 0

            if score > best_score:
                best_score = score
                best_move = move

        return best_move

    def get_best_move(self, board, symbol='O'):
        """
        獲取最佳移動（混合策略：Q-Learning + Minimax）

        Args:
            board: 棋盤狀態 (list of 9 elements: 1=X, -1=O, 0=empty)
            symbol: AI 的符號

        Returns:
            最佳移動的位置 (0-8)
        """
        state = self.get_state_key(board)
        valid_moves = self.get_valid_moves(board)

        if not valid_moves:
            return None

        # 優先使用啟發式檢查（必勝或必擋）
        win_or_block = self._heuristic_move(board, valid_moves)

        # 如果有必勝或必擋的位置，直接返回
        win_move = self._check_win_or_block(board, -1)
        if win_move is not None:
            return win_move
        block_move = self._check_win_or_block(board, 1)
        if block_move is not None:
            return block_move

        # 選擇 Q 值最高的移動
        q_values = {move: self.q_table[state][move] for move in valid_moves}

        # 如果 Q-table 沒有足夠的知識，使用 Minimax
        # if all(v == 0 for v in q_values.values()) or len(self.q_table) < 100:
        #     return self._get_minimax_move(board.copy())

        max_q = max(q_values.values())
        # 如果有多個最佳移動，隨機選擇一個
        best_moves = [move for move, q in q_values.items() if q == max_q]
        return np.random.choice(best_moves)

    def _check_win_or_block(self, board, player):
        """
        檢查是否有立即獲勝或需要阻擋的位置

        Args:
            board: 棋盤狀態
            player: 玩家 (1 或 -1)

        Returns:
            可以獲勝或阻擋的位置，如果沒有則返回 None
        """
        win_conditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # 橫
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # 豎
            [0, 4, 8], [2, 4, 6]              # 斜
        ]

        for condition in win_conditions:
            values = [board[i] for i in condition]
            # 檢查是否有兩個相同且一個空位
            if values.count(player) == 2 and values.count(0) == 1:
                # 返回空位的索引
                for i in condition:
                    if board[i] == 0:
                        return i
        return None

    def _heuristic_move(self, board, valid_moves):
        """
        改進的啟發式策略：
        1. 檢查是否可以獲勝
        2. 檢查是否需要阻擋對手
        3. 優先選擇中心，然後角落，最後邊緣
        """
        # 1. 檢查是否可以立即獲勝 (O = -1)
        win_move = self._check_win_or_block(board, -1)
        if win_move is not None and win_move in valid_moves:
            return win_move

        # 2. 檢查是否需要阻擋對手 (X = 1)
        block_move = self._check_win_or_block(board, 1)
        if block_move is not None and block_move in valid_moves:
            return block_move

        # 3. 優先順序：中心(4) > 角落(0,2,6,8) > 邊緣(1,3,5,7)
        center = 4
        corners = [0, 2, 6, 8]
        edges = [1, 3, 5, 7]

        if center in valid_moves:
            return center

        corner_moves = [m for m in valid_moves if m in corners]
        if corner_moves:
            return np.random.choice(corner_moves)

        edge_moves = [m for m in valid_moves if m in edges]
        if edge_moves:
            return np.random.choice(edge_moves)

        return valid_moves[0]

    def check_winner(self, board):
        """
        檢查遊戲是否結束

        Returns:
            1: X 贏
            -1: O 贏
            0: 平局
            None: 遊戲繼續
        """
        # 所有可能的勝利組合
        win_conditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # 橫
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # 豎
            [0, 4, 8], [2, 4, 6]              # 斜
        ]

        for condition in win_conditions:
            if (board[condition[0]] == board[condition[1]] == board[condition[2]] != 0):
                return board[condition[0]]

        # 檢查是否平局
        if 0 not in board:
            return 0

        return None

    def update_q_value(self, state, action, reward, next_state):
        """
        更新 Q 值

        Q(s,a) = Q(s,a) + α * [r + γ * max(Q(s',a')) - Q(s,a)]
        """
        current_q = self.q_table[state][action]

        # 獲取下一個狀態的最大 Q 值
        valid_moves = self.get_valid_moves(list(next_state))
        if valid_moves:
            max_next_q = max([self.q_table[next_state][move] for move in valid_moves])
        else:
            max_next_q = 0

        # Q-Learning 更新公式
        new_q = current_q + self.lr * (reward + self.gamma * max_next_q - current_q)
        self.q_table[state][action] = new_q

    def train_episode(self):
        """
        訓練一局遊戲（AI vs AI）
        """
        board = [0] * 9
        history = []  # 記錄 (state, action)
        current_player = 1  # 1 = X, -1 = O

        while True:
            state = self.get_state_key(board)
            valid_moves = self.get_valid_moves(board)

            if not valid_moves:
                break

            # Epsilon-greedy 選擇動作
            if np.random.random() < self.epsilon:
                action = np.random.choice(valid_moves)
            else:
                q_values = {move: self.q_table[state][move] for move in valid_moves}
                if all(v == 0 for v in q_values.values()):
                    action = self._heuristic_move(board, valid_moves)
                else:
                    max_q = max(q_values.values())
                    best_moves = [move for move, q in q_values.items() if q == max_q]
                    action = np.random.choice(best_moves)

            # 執行動作
            board[action] = current_player
            history.append((state, action, current_player))

            # 檢查遊戲是否結束
            winner = self.check_winner(board)
            if winner is not None:
                # 改進的獎勵系統：根據步數給予遞減獎勵
                for i, (s, a, player) in enumerate(history):
                    if winner == 0:  # 平局
                        reward = 0.1
                    elif winner == player:  # 贏
                        # 越早贏獎勵越高
                        steps_to_win = len(history) - i
                        reward = 1.0 + (0.1 * (9 - steps_to_win))
                    else:  # 輸
                        # 輸的懲罰
                        reward = -1.0

                    # 更新 Q 值
                    if i < len(history) - 1:
                        next_s = history[i + 1][0]
                    else:
                        next_s = self.get_state_key(board)

                    self.update_q_value(s, a, reward, next_s)

                # 更新統計
                self.stats['total_games'] += 1
                if winner == 1:
                    self.stats['wins'] += 1
                elif winner == -1:
                    self.stats['losses'] += 1
                else:
                    self.stats['draws'] += 1

                return winner

            # 切換玩家
            current_player *= -1

    def train(self, episodes=1000000):
        """
        訓練 AI

        Args:
            episodes: 訓練局數
        """
        print(f"開始訓練 {episodes} 局...")

        for i in range(episodes):
            self.train_episode()

            if (i + 1) % 1000 == 0:
                print(f"已訓練 {i + 1} 局")
                print(f"勝率: {self.stats['wins']}/{self.stats['total_games']} = {self.stats['wins']/max(1, self.stats['total_games']):.2%}")

        print("訓練完成！")
        print(f"總計: {self.stats['total_games']} 局")
        print(f"X 勝: {self.stats['wins']} ({self.stats['wins']/self.stats['total_games']:.2%})")
        print(f"O 勝: {self.stats['losses']} ({self.stats['losses']/self.stats['total_games']:.2%})")
        print(f"平局: {self.stats['draws']} ({self.stats['draws']/self.stats['total_games']:.2%})")
        print(f"Q-table 大小: {len(self.q_table)} 個狀態")

    def save_model(self):
        """儲存模型"""
        os.makedirs('model', exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'q_table': dict(self.q_table),
                'stats': self.stats
            }, f)
        print(f"模型已儲存至 {self.model_path}")

    def load_model(self):
        """載入模型"""
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.q_table = defaultdict(lambda: defaultdict(float), data['q_table'])
                self.stats = data['stats']
            print(f"模型已載入，包含 {len(self.q_table)} 個狀態")
            return True
        else:
            print("找不到已訓練的模型，將使用新模型")
            return False

    def reset_model(self):
        """重置模型"""
        self.q_table = defaultdict(lambda: defaultdict(float))
        self.stats = {
            'total_games': 0,
            'wins': 0,
            'losses': 0,
            'draws': 0
        }
        print("模型已重置")

    def get_stats(self):
        """獲取統計資料"""
        return {
            'q_table_size': len(self.q_table),
            **self.stats
        }


if __name__ == '__main__':
    # 測試訓練
    ai = TicTacToeAI()
    ai.train(episodes=50000)
    ai.save_model()
