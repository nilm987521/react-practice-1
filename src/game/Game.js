import React from 'react';
import Board from "./Board";
import './game.css';

export default function Game() {
    const [stepNumberState, setStepNumberState] = React.useState(0);
    const [historyState, setHistoryState] =
        React.useState([{square: Array(9).fill(null)}]);
    const [xIsNextState, setXIsNextState] = React.useState(true);

    const restartClick = () => {
        setStepNumberState(0);
        setXIsNextState(true);
        setHistoryState([{square: Array(9).fill(null)}]);
    }

    const calculateWinner = (squares) => {
        console.log('calculateWinner\'s square:  ', squares);
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

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    }

    const handleClick = (i) => {

        const history = historyState.slice(0, stepNumberState + 1);
        console.log('handleClick => history: ', history);
        const current = history[history.length - 1];
        const squares = current.square.slice();

        // 不為null 就return
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = xIsNextState ? 'X' : 'O';
        setHistoryState(historyState.concat({square: squares}));
        setStepNumberState(history.length)
        setXIsNextState(!xIsNextState);
    }

    const jumpTo = (step) => {
        setStepNumberState(step);
        setXIsNextState((step %2) === 0);
    }
    const current = historyState[stepNumberState].square;
    const winner = calculateWinner(current);

    const moves = historyState.map((step, move) => {
        const desc = move ?
            'Go to move #' + move :
            'Go to game start';
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{desc}</button>
            </li>
        );
    });

    let status;
    if (winner) {
        status = 'Winner: ' + winner;
    } else if (stepNumberState === 9) {
        status = 'Tie!!';
    } else {
        status = 'Next player: ' + (xIsNextState ? 'X' : 'O');
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
                <div>{status}</div>
                {stepNumberState === 9 || winner ?
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