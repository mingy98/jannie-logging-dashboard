export const FETCH_LOGS = 'FETCH_LOGS'
export const STORE_LOGS = 'STORE_LOGS'
export const UPDATE_ROWS = 'UPDATE_ROWS' // update logs
export const CHANGE_SORTING = 'CHANGE_SORTING'
export const CHANGE_FILTERS = 'CHANGE_FILTERS'
export const START_LOADING = 'START_LOADING'
export const REQUEST_ERROR = 'REQUEST_ERROR'
export const FETCH_INIT = 'FETCH_INIT'
export const UPDATE_QUERY = 'UPDATE_QUERY'
export const CHANGE_SEARCH = 'CHANGE_SEARCH'



export function fetchLogs() {
    return {
        type: FETCH_LOGS,
    }
}
 
export function storeLogs(logs) {
    return {
        type: STORE_LOGS,
        logs,
    }
}

