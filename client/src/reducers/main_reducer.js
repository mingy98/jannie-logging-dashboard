import * as Action from 'actions/index'


const VIRTUAL_PAGE_SIZE = 10;

const DEFAULT = {
  rows: [],
  skip: 0,
  requestedSkip: 0,
  take: VIRTUAL_PAGE_SIZE * 2,
  totalCount: 0,
  loading: false,
  lastQuery: '',
  searchString: '',
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
            case Action.CHANGE_SEARCH:
                return {
                  ...state,
                  forceReload: true,
                  requestedSkip: 0,
                  rows: [],
                  searchString: action.payload,
                };
        default: 
            return state
    }

}
