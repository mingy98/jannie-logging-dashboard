import * as Action from 'actions/index'

const DEFAULT = {
    logs: [],
    //rows: [],
    skip: 0,
    requestedSkip: 0,
    take: 200,
    totalCount: 0,
    loading: false,
    lastQuery: '',
    sorting: [],
    filters: [],
    forceReload: false,
}

export default function (state = DEFAULT, action) {
    switch (action.type) {
        case Action.STORE_LOGS:
            return {
                ...state,
                logs: action.logs,
            }
            case Action.UPDATE_ROWS:
                return {
                  ...state,
                  ...action.payload,
                  loading: false,
                };
            case Action.CHANGE_SORTING:
                return {
                  ...state,
                  forceReload: true,
                  rows: [],
                  sorting: action.payload,
                };
            case Action.CHANGE_FILTERS:
                return {
                  ...state,
                  forceReload: true,
                  requestedSkip: 0,
                  rows: [],
                  filters: action.payload,
                };
            case Action.START_LOADING:
                return {
                  ...state,
                  requestedSkip: action.payload.requestedSkip,
                  take: action.payload.take,
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
                  lastQuery: action.payload,
            };
        default: 
            return state
    }

}
