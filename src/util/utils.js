export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const nextSymbol = (stepNumber) => {return (stepNumber % 2) === 0 ? 'X' : 'O'}
export const calculateWinner = (squares) => {
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

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
