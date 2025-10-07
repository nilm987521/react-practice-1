import Square from "./Square";
import './Board.css'
import {useDispatch, useSelector} from "react-redux";
import {calculateWinner, nextSymbol} from "../util/utils";
import {addResult, addStep, setIsEnded} from "./store/GameStore";
import {useEffect} from "react";
import {askAiNextMove} from "./Ai";

function renderSquare(i, squares, onClick) {
    return <Square
        // 把Board的中定義元件傳入Square當props
        value={squares[i]}
        onClick={() => onClick(i)}
    />;
}

export default function Board(props) {
    // 從 Redux store 獲取狀態
    const history = useSelector((state) => state.history);
    const stepNumber = useSelector((state) => state.stepNumber);
    const isEnded = useSelector((state) => state.isEnded);
    const player1 = useSelector((state) => state.player1);
    const player2 = useSelector((state) => state.player2);

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

    return (
        <div>
            <div className="board-row first-row">
                {renderSquare(0, props.squares, handleClick)}
                {renderSquare(1, props.squares, handleClick)}
                {renderSquare(2, props.squares, handleClick)}
            </div>
            <div className="board-row middle-row">
                {renderSquare(3, props.squares, handleClick)}
                {renderSquare(4, props.squares, handleClick)}
                {renderSquare(5, props.squares, handleClick)}
            </div>
            <div className="board-row last-row">
                {renderSquare(6, props.squares, handleClick)}
                {renderSquare(7, props.squares, handleClick)}
                {renderSquare(8, props.squares, handleClick)}
            </div>
        </div>
    );
}