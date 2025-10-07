import {createStore} from 'redux';

// Action Types
const ADD_STEP = 'game/addStep';
const CLEAR_HISTORY = 'game/clearHistory';
const REGRET_STEP = 'game/regret'
const JUMP_TO_STEP = 'game/jumpToStep';
const ADD_RESULT = 'game/addResult';
const IS_ENDED = 'game/isEnded';

// Action Creators
export const addStep = (step) => ({type: ADD_STEP, step: step});
export const clearHistory = () => ({type: CLEAR_HISTORY});
export const regretStep = () => ({type: REGRET_STEP});
export const jumpToStep = (step) => ({type: JUMP_TO_STEP, step: step});
export const addResult = (result) => ({type: ADD_RESULT, result: result});
export const setIsEnded = (isEnded) => ({type: IS_ENDED, isEnded: isEnded});

// Initial State
const initialState = {
    history: [{square: Array(9).fill(null)}],
    stepNumber: 0,
    results: [],
    isEnded: false,
};

// Reducer
function gameReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_STEP:
            return {
                ...state,
                history: state.history.concat(action.step),
                stepNumber: state.stepNumber + 1,
            }
        case CLEAR_HISTORY:
            return {
                ...state,
                history: [{square: Array(9).fill(null)}],
                stepNumber: 0,
            }
        case REGRET_STEP:
            return {
                ...state,
                history: state.history.slice(0, state.history.length - 2),
                stepNumber: state.stepNumber - 2,
            }
        case JUMP_TO_STEP:
            return {
                ...state,
                stepNumber: action.step,
            }
        case ADD_RESULT: {
            return {
                ...state,
                results: state.results.concat(action.result),
            }
        }
        case IS_ENDED: {
            return {
                ...state,
                isEnded: action.isEnded,
            }
        }
        default:
            return state;
    }
}

export const gameStore = createStore(gameReducer);