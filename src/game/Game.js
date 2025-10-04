import React, {useEffect, useState} from 'react';
import Board from "./Board";
import './Game.css';
import {addStep, clearHistory, regretStep, jumpToStep, addResult, setIsEnded} from './store/GameStore';
import {useSelector, useDispatch} from 'react-redux';
import {askAiNextMove} from "./Ai";

export default function Game() {
    const [player1IsAI, setPlayer1IsAI] = useState(false);
    const [player2IsAI, setPlayer2IsAI] = useState(false);

    // 從 Redux store 獲取狀態
    const {history, stepNumber, results, isEnded} = useSelector((state) => state);
    // 獲取 dispatch 函數
    const dispatch = useDispatch();

    const restartClick = () => {
        dispatch(setIsEnded(false));
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
        if (!Number.isInteger(i)) {
            console.log('not number')
            return;
        }
        if (isEnded) return;
        const __history = history.slice(0, stepNumber + 1);
        const previousSquares = __history[__history.length - 1].square.slice();

        // 不准重複點/覆蓋
        if (previousSquares[i]) return;

        const current = [...previousSquares];
        current[i] = (stepNumber % 2) === 0 ? 'X' : 'O';
        dispatch(addStep({square: current}));

        // 落子後，檢查是否有玩家勝利
        if (calculateWinner(current)) {
            dispatch(setIsEnded(true));
            dispatch(addResult(current[i]));
        } else if (stepNumber === 8) {
            dispatch(addResult('='));
            dispatch(setIsEnded(true));
        }
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

    const resultRenderFunc = results.map((result, index) => {
        return (
            <span key={index}>{(index !== 0) && '、'} {index + 1}.{result} </span>
        )
    })

    let status;
    if (winner) {
        status = 'Winner: ' + winner;
    } else if (stepNumber === 9) {
        status = 'Tie!!';
    } else {
        status = 'Next player: ' + ((stepNumber % 2) === 0 ? 'X' : 'O');
    }

    // 這邊做回合控制 => 引入AI對戰
    useEffect(() => {
        if (isEnded) return;
        if ((stepNumber % 2) === 1) {
            const current = history[stepNumber].square;
            var next = askAiNextMove('O', current);
            next.then((result) => {
                handleClick(result.move);
            })
        }
    }, [history]);

    return (
        <div>
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current}
                        onClick={(i) => handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    {(stepNumber !== history.length - 1 || history.length === 1 || winner != null) ||
                        <button onClick={() => regret()}>REGRET!!</button>}
                    <div>{status}</div>
                    {stepNumber === 9 || winner ?
                        <button onClick={() => restartClick()}>Restart</button> :
                        <ol>{moves}</ol>}
                </div>
            </div>
            <div>{resultRenderFunc}</div>
        </div>
    );
}