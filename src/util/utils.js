export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const nextSymbol = (stepNumber) => {return (stepNumber % 2) === 0 ? 'O' : 'X'}