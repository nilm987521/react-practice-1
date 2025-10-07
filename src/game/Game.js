import React, {useEffect, useState} from 'react';
import Board from "./Board";
import './Game.css';
import {addStep, clearHistory, regretStep, jumpToStep, addResult, setIsEnded} from './store/GameStore';
import {useSelector, useDispatch} from 'react-redux';
import {askAiNextMove} from "./Ai";
import {calculateWinner, nextSymbol} from '../util/utils'

export default function Game() {

    // 從 Redux store 獲取狀態
    const history = useSelector((state) => state.history);
    const stepNumber = useSelector((state) => state.stepNumber);
    const results = useSelector((state) => state.results);
    const isEnded = useSelector((state) => state.isEnded);

    const [isSetupMode, setSetupMode] = useState(true);
    const [player1, setPlayer1] = useState('human');
    const [player2, setPlayer2] = useState('human');

    // 獲取 dispatch 函數
    const dispatch = useDispatch();

    const handleClick = (i) => {
        // 輸入不回數字時拋錯
        if (!Number.isInteger(i)) {
            throw new Error("invalid number for handleClick");
        }

        // 遊戲結束時，無法操作
        if (isEnded) return;

        // Review Mode
        if (history.length !== stepNumber + 1) {
            return;
        }

        const previousSquares = history[history.length - 1].square.slice();

        // 不准重複點/覆蓋
        if (previousSquares[i]) return;

        const current = [...previousSquares];
        current[i] = nextSymbol(stepNumber)
        dispatch(addStep({square: current}));

        // 落子後，檢查是否有玩家勝利
        const winner = calculateWinner(current);
        if (winner !== null) {
            dispatch(setIsEnded(true));
            dispatch(addResult(winner));
        } else if (stepNumber === 8) {
            dispatch(addResult('='));
            dispatch(setIsEnded(true));
        }
    }

    const restart = () => {
        dispatch(setIsEnded(false));
        dispatch(clearHistory());
    }

    const regret = () => {
        if (stepNumber === 0) return;
        dispatch(regretStep());
        dispatch(setIsEnded(false));
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

    const scoreBoard = () => {
        return (
            <div>
                <span className={'green'}>X</span><span>: {results.filter( result => result === 'X').length}&nbsp; &nbsp;</span>
                <span className={'red'}>O</span><span>: {results.filter( result => result === 'O').length}</span>
            </div>
        )
    }

    let status;
    if (winner) {
        status = 'Winner: ' + winner;
    } else if (stepNumber === 9) {
        status = 'Draw!!';
    } else {
        status = 'Next player: ' + nextSymbol(stepNumber) + '(' + ((stepNumber %2) === 0 ? player1 : player2) + ')';
    }

    // 這邊做回合控制 => 引入AI對戰
    useEffect(() => {
        if (isEnded) return;
        if ((stepNumber % 2) === 0 && player1 === 'ai') {
            const current = history[stepNumber].square;
            let next = askAiNextMove('O', current);
            next.then((result) => {
                handleClick(result.move);
            });
        }
        if ((stepNumber % 2) === 1 && player2 === 'ai') {
            const current = history[stepNumber].square;
            let next = askAiNextMove('O', current);
            next.then((result) => {
                handleClick(result.move);
            });
        }
    }, [history]);

    const options = [
        { value: 'human', label: 'Human' },
        { value: 'ai', label: 'AI' },
    ];

    return (
        <div>
            {isSetupMode &&
                <div>
                    Player1 is :
                    {options.map((option) => (
                        <label key={option.value}>
                            <input
                                type="radio"
                                name="player1"
                                value={option.value}
                                checked={player1 === option.value}
                                onChange={(e) => setPlayer1(e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                    <br />
                    Player2 is :
                    {options.map((option) => (
                        <label key={option.value}>
                            <input
                                type="radio"
                                name="player2"
                                value={option.value}
                                checked={player2 === option.value}
                                onChange={(e) => setPlayer2(e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                    <br />
                    <button onClick={() => setSetupMode(false)}>Start Game</button>
                </div>
            }
            {isSetupMode || <div>
                <div className="game">
                    <div className="game-board">
                        <Board
                            squares={current}
                            onClick={(i) => handleClick(i)}
                        />
                    </div>
                    <div className="game-info">
                        <div>{scoreBoard()}</div>
                        {(!isEnded && stepNumber !== 0) && <button onClick={() => regret()}>REGRET!!</button>}
                        <div>{status}</div>
                        {stepNumber === 9 || winner ?
                            <button onClick={() => restart()}>Restart</button> :
                            <ol>{moves}</ol>}
                    </div>
                </div>
            </div> }
        </div>
    );
}