import {createStore} from 'redux';

// Action Types
const ADD_STEP = 'game/addStep';
const CLEAR_HISTORY = 'game/clearHistory';
const REGRET_STEP = 'game/regret'

// Action Creators
export const addStep = (step) => ({type: ADD_STEP, step: step});
export const clearHistory = () => ({type: CLEAR_HISTORY});
export const regretStep = () => ({type: REGRET_STEP});

// Initial State
const initialState = {
    steps: [{square: Array(9).fill(null)}]
};

// Reducer
function stepReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_STEP:
            return {
                ...state,
                steps: state.steps.concat(action.step)
            }
        case CLEAR_HISTORY:
            return {
                steps: [{square: Array(9).fill(null)}]
            }
        case REGRET_STEP:
            return {
                ...state,
                steps: state.steps.slice(0, state.steps.length - 1)
            }
        default:
            return state;
    }
}

export const historyStore = createStore(stepReducer);