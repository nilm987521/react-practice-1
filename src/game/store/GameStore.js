import {createStore} from 'redux';

// Action Types
const ADD_STEP = 'game/addStep';
const CLEAR_HISTORY = 'game/clearHistory';
const REGRET_STEP = 'game/regret'
const JUMP_TO_STEP = 'game/jumpToStep';

// Action Creators
export const addStep = (step) => ({type: ADD_STEP, step: step});
export const clearHistory = () => ({type: CLEAR_HISTORY});
export const regretStep = () => ({type: REGRET_STEP});
export const jumpToStep = (step) => ({type: JUMP_TO_STEP, step: step});

// Initial State
const initialState = {
    history: [{square: Array(9).fill(null)}],
    stepNumber: 0,
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
                history: [{square: Array(9).fill(null)}],
                stepNumber: 0,
            }
        case REGRET_STEP:
            return {
                ...state,
                history: state.history.slice(0, state.history.length - 1),
                stepNumber: state.stepNumber - 1,
            }
        case JUMP_TO_STEP:
            return {
                ...state,
                stepNumber: action.step,
            }
        default:
            return state;
    }
}

export const gameStore = createStore(gameReducer);