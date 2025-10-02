import React from 'react';
import Board from "./Board";
import './game.css';
import {addStep, clearHistory, regretStep, jumpToStep} from './store/GameStore';
import {useSelector, useDispatch} from 'react-redux';

export default function Game() {
    // 從 Redux store 獲取狀態
    const {history, stepNumber} = useSelector((state) => state);
    // 獲取 dispatch 函數
    const dispatch = useDispatch();

    const restartClick = () => {
        dispatch(clearHistory());
    }

    const calculateWinner = (squares) => {
        // 勝利條件
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        // 逐條規則檢查，當前棋盤上是否有連續(3個位子為同樣符號)
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    }

    const handleClick = (i) => {
        const __history = history.slice(0, stepNumber + 1);
        const current = __history[__history.length - 1];
        const squares = current.square.slice();

        // 不為null 就return
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = (stepNumber % 2) === 0 ? 'O' : 'X';
        dispatch(addStep({square: squares}));
    }

    const regret = () => {
        if (stepNumber === 0) return;
        dispatch(regretStep());
    }

    const current = history[stepNumber].square;
    const winner = calculateWinner(current);

    const moves = history.map((step, move) => {
        const desc = move ?
            'Go to move #' + move :
            'Go to game start';

        return (
            <li key={move}>
                <button onClick={() => dispatch(jumpToStep(move))}>{desc}</button>
            </li>
        );
    });

    let status;
    if (winner) {
        status = 'Winner: ' + winner;
    } else if (stepNumber === 9) {
        status = 'Tie!!';
    } else {
        status = 'Next player: ' + ((stepNumber % 2) === 0 ? 'O' : 'X');
    }

    return (
        <div className="game">
            <div className="game-board">
                <Board
                    squares={current}
                    onClick={(i) => handleClick(i)}
                />
            </div>
            <div className="game-info">
                {(stepNumber !== history.length - 1 || history.length === 1) ||
                    <button onClick={() => regret()}>REGRET!!</button>}
                <div>{status}</div>
                {stepNumber === 9 || winner ?
                    <button onClick={() => restartClick()}>Restart</button> :
                    <ol>{moves}</ol>}
            </div>
        </div>
    );
}

// export default class Game extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             history: [{
//                 squares: Array(9).fill(null),
//             }],
//             stepNumber: 0,
//             xIsNext: true,
//         };
//     }
//
//     restartClick() {
//         this.setState({
//             history: [{
//                 squares: Array(9).fill(null),
//             }],
//             stepNumber: 0,
//             xIsNext: true,
//         })
//     }
//
//     calculateWinner(squares) {
//         // 勝利條件
//         const lines = [
//             [0, 1, 2],
//             [3, 4, 5],
//             [6, 7, 8],
//             [0, 3, 6],
//             [1, 4, 7],
//             [2, 5, 8],
//             [0, 4, 8],
//             [2, 4, 6],
//         ];
//
//         for (let i = 0; i < lines.length; i++) {
//             const [a, b, c] = lines[i];
//             if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
//                 return squares[a];
//             }
//         }
//         console.log(this.state.stepNumber);
//         return null;
//     }
//
//     handleClick(i) {
//         const history = this.state.history.slice(0, this.state.stepNumber + 1);
//         const current = history[history.length - 1];
//         const squares = current.squares.slice();
//
//         // 不為null 就return
//         if (this.calculateWinner(squares) || squares[i]) {
//             return;
//         }
//         squares[i] = this.state.xIsNext ? 'X' : 'O';
//         this.setState({
//             history: history.concat([{
//                 squares: squares,
//             }]),
//             xIsNext: !this.state.xIsNext,
//             stepNumber: history.length,
//         });
//     }
//
//     jumpTo(step) {
//         this.setState({
//             stepNumber: step,
//             xIsNext: (step % 2) === 0,
//         });
//     }
//
//     render() {
//         const history = this.state.history;
//         const current = history[this.state.stepNumber];
//         const winner = this.calculateWinner(current.squares);
//
//         const moves = history.map((step, move) => {
//             const desc = move ?
//                 'Go to move #' + move :
//                 'Go to game start';
//             return (
//                 <li key={move}>
//                     <button onClick={() => this.jumpTo(move)}>{desc}</button>
//                 </li>
//             );
//         });
//
//
//         let status;
//         if (winner) {
//             status = 'Winner: ' + winner;
//         } else if (this.state.stepNumber === 9) {
//             status = 'Tie!!';
//         } else {
//             status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
//         }
//
//         return (
//             <div className="game">
//                 <div className="game-board">
//                     <Board
//                         squares={current.squares}
//                         onClick={(i) => this.handleClick(i)}
//                     />
//                 </div>
//                 <div className="game-info">
//                     <div>{status}</div>
//                     {this.state.stepNumber === 9 || winner ?
//                         <button onClick={ () => this.restartClick() }>Restart</button> :
//                         <ol>{moves}</ol>}
//                 </div>
//             </div>
//         );
//     }
// }