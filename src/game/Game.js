import React, {useState} from 'react';
import Board from "./Board";
import './Game.css';
import {
    clearHistory,
    regretStep,
    jumpToStep,
    setIsEnded,
    setPlayer1,
    setPlayer2
} from './store/GameStore';
import {useSelector, useDispatch} from 'react-redux';
import {calculateWinner, nextSymbol} from '../util/utils'

export default function Game() {

    // 從 Redux store 獲取狀態
    const history = useSelector((state) => state.history);
    const stepNumber = useSelector((state) => state.stepNumber);
    const results = useSelector((state) => state.results);
    const isEnded = useSelector((state) => state.isEnded);
    const player1 = useSelector((state) => state.player1);
    const player2 = useSelector((state) => state.player2);

    const [isSetupMode, setSetupMode] = useState(true);

    // 獲取 dispatch 函數
    const dispatch = useDispatch();

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
                                onChange={(e) => dispatch(setPlayer1(e.target.value))}
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
                                onChange={(e) => dispatch(setPlayer2(e.target.value))}
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
                        />
                    </div>
                    <div className="game-info">
                        <div>{scoreBoard()}</div>
                        {(!isEnded && stepNumber !== 0) && <button onClick={() => regret()}>REGRET!!</button>}
                        <div>{status}</div>
                        <div className={'move-block'}>
                            {stepNumber === 9 || winner ?
                                <button onClick={() => restart()}>Restart</button> :
                                <ol>{moves}</ol>}
                        </div>
                    </div>
                </div>
            </div> }
        </div>
    );
}