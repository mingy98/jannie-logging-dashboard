import * as Action from 'actions/index'

export default function reducer(state, { type, payload }) {
    switch (type) {
        case Action.UPDATE_ROWS:
            return {
                ...state,
                ...payload,
                loading: false,
            };
        case Action.START_LOADING:
            return { 
                ...state,
                requestedSkip: payload.requestedSkip,
                take: payload.take,
            };
        case Action.REQUEST_ERROR:
            return {
                ...state,
                loading: false,
            };
        case Action.FETCH_INIT:
            return {
                ...state,
                loading: true,
                forceReload: false,
            };
        case Action.UPDATE_QUERY:
            return {
                ...state,
                lastQuery: payload,
            };
        case Action.CHANGE_SEARCH:
            return {
                ...state,
                forceReload: true,
                requestedSkip: 0,
                rows: [],
                searchString: payload,
            };
        case Action.CHANGE_SELECTION:
            return {
                ...state,
                selected: payload[1],
                selectionChanged: true,
            };
        case Action.CHANGE_SELECTION_DONE:
            return {
                ...state,
                selectionChanged: false,
            };
        case Action.SET_SELECTION_DATA:
            return {
                ...state,
                selected_data: payload
            }

        default:
            return state;
    }
}