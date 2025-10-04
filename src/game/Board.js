import React from 'react';
import Square from "./Square";
import './Board.css'

function renderSquare(i, squares, onClick) {
    return <Square
        // 把Board的中定義元件傳入Square當props
        value={squares[i]}
        onClick={() => onClick(i)}
    />;
}

export default function Board(props) {
    return (
        <div>
            <div className="board-row first-row">
                {renderSquare(0, props.squares, props.onClick)}
                {renderSquare(1, props.squares, props.onClick)}
                {renderSquare(2, props.squares, props.onClick)}
            </div>
            <div className="board-row middle-row">
                {renderSquare(3, props.squares, props.onClick)}
                {renderSquare(4, props.squares, props.onClick)}
                {renderSquare(5, props.squares, props.onClick)}
            </div>
            <div className="board-row last-row">
                {renderSquare(6, props.squares, props.onClick)}
                {renderSquare(7, props.squares, props.onClick)}
                {renderSquare(8, props.squares, props.onClick)}
            </div>
        </div>
    );
}