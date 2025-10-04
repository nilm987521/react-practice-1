export const askAiNextMove = async (symbol, squares) => {
    // 使用相對路徑，自動適配開發和生產環境
    const apiUrl = process.env.NODE_ENV === 'production' ? '/v1' : 'http://localhost:1234/v1';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            board: squares,
            symbol: symbol
        }),
    })
    return response.json();
}