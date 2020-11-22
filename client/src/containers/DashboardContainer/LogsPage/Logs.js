import React, {
    useReducer, useState, useEffect, useMemo,
} from 'react';
import Paper from '@material-ui/core/Paper';
import {
    VirtualTableState,
    SelectionState,
    createRowCache,
    SearchState,
} from '@devexpress/dx-react-grid';

import {
    Grid,
    VirtualTable,
    TableHeaderRow,
    Toolbar,
    SearchPanel,
    TableSelection,
} from '@devexpress/dx-react-grid-material-ui';

import { Loading } from '../../../assets/Loading/loading.jsx';
import { config, VIRTUAL_PAGE_SIZE } from '../../../constants.js';
import LogInfo from 'containers/DashboardContainer/LogsPage/LogInfo/LogInfo.js';
import * as Action from 'actions/index'

const URL = config.url.PRIMARY_SERVER;

const getRowId = row => row.connection_id;

const initialState = {
    rows: [],
    skip: 0,
    requestedSkip: 0,
    take: VIRTUAL_PAGE_SIZE * 2,
    totalCount: 0,
    loading: false,
    lastQuery: '',
    searchString: '',
    forceReload: false,
    selectionChanged: false,
    selected: 0,
    data: [ { title: "Latency", data: [] },
            { title: "Average Decode Time", data: [] },
            { title: "Average Encode Time", data: [] },
            { title: "Average Encode Size", data: [] },
    ],
};

function reducer(state, { type, payload }) {
    switch (type) {
        case 'UPDATE_ROWS':
            return {
                ...state,
                ...payload,
                loading: false,
            };
        case 'START_LOADING':
            return {
                ...state,
                requestedSkip: payload.requestedSkip,
                take: payload.take,
            };
        case 'REQUEST_ERROR':
            return {
                ...state,
                loading: false,
            };
        case 'FETCH_INIT':
            return {
                ...state,
                loading: true,
                forceReload: false,
            };
        case 'UPDATE_QUERY':
            return {
                ...state,
                lastQuery: payload,
            };
        case 'CHANGE_SEARCH':
            return {
                ...state,
                forceReload: true,
                requestedSkip: 0,
                rows: [],
                searchString: payload,
            };
        case 'CHANGE_SELECTION':
            return {
                ...state,
                selected: payload[1],
                selectionChanged: true,
            };
        case 'CHANGE_SELECTION_DONE':
            return {
                ...state,
                selectionChanged: false,
            };
        case 'SET_SELECTION_DATA':
            return {
                ...state,
                data: payload
            }

        default:
            return state;
    }
}

export default () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const [columns] = useState([
        { name: 'username', title: 'Username', getCellValue: row => row.username },
        { name: 'connection_id', title: 'Connection Id', getCellValue: row => row.connection_id },
        { name: 'ip', title: 'IP', getCellValue: row => row.ip },
        { name: 'last_updated', title: 'Last Updated', getCellValue: row => row.last_updated },
        { name: 'version', title: 'Version', getCellValue: row => row.version },
    ]);
    const [tableColumnExtensions] = useState([
        { columnName: 'username', width: '300'},
        { columnName: 'connection_id', width: '150'},
        { columnName: 'ip', width: '150' },
        { columnName: 'last_updated', width: '200' },
        { columnName: 'version', width: '200' },
    ]);

    const cache = useMemo(() => createRowCache(VIRTUAL_PAGE_SIZE), [VIRTUAL_PAGE_SIZE]);
    const updateRows = (skip, count, newTotalCount) => {
        dispatch({
            type: 'UPDATE_ROWS',
            payload: {
                skip: Math.min(skip, newTotalCount),
                rows: cache.getRows(skip, count),
                totalCount: newTotalCount,
            },
        });
    };

    const getRemoteRows = (requestedSkip, take) => {
        dispatch({ type: 'START_LOADING', payload: { requestedSkip, take } });
    };

    const buildDataQuery = () => {
        const {
            requestedSkip, take, searchString,
        } = state;
        return `${URL}/logs?skip=${requestedSkip}&take=${take}&search=${searchString}`;
    };


    const buildSelectQuery = () => {
        const {
            selected,
        } = state;

        return `${URL}/getvisual?selected=${selected}`;
    };

    const loadData = () => {
        const {
            requestedSkip, take, lastQuery, loading, forceReload, totalCount, selected, selectionChanged,
        } = state;
        const dataQuery = buildDataQuery();
        if ((dataQuery !== lastQuery || forceReload) && !loading) {
            if (forceReload) {
                cache.invalidate();
            }
            const cached = cache.getRows(requestedSkip, take);
            if (cached.length === take) {
                updateRows(requestedSkip, take, totalCount);
            } else {
                dispatch({ type: 'FETCH_INIT' });
                fetch(dataQuery)
                    .then(response => {
                        return response.json()
                    })
                    .then((data) => {
                        cache.setRows(requestedSkip, data.logs);
                        updateRows(requestedSkip, take, data.totalCount);
                    })
                    .catch(() => dispatch({ type: 'REQUEST_ERROR' }));
            }
            dispatch({ type: 'UPDATE_QUERY', payload: dataQuery });
        }

        const selectQuery = buildSelectQuery();
        if ((selectionChanged) && !loading) {

            fetch(selectQuery)
                .then(response => {
                    return response.json()
                })
                .then((data) => { 
                    const value = [{ title: "Latency", data: data.latency },
                    { title: "Average Decode Time", data: data.decode_time },
                    { title: "Average Encode Time", data: data.encode_time },
                    { title: "Average Encode Size", data: data.encode_size },
                    ]
                    console.log(value)
                    dispatch({ type: 'SET_SELECTION_DATA', payload: value })
                })
                .catch(() => dispatch({ type: 'REQUEST_ERROR' }));
            dispatch({ type: 'CHANGE_SELECTION_DONE' });
        }
    };

    const changeSearch = (value) => {
        dispatch({ type: 'CHANGE_SEARCH', payload: value });
    };

    const changeSelection = (value) => {
        dispatch({ type: 'CHANGE_SELECTION', payload: value });
    };


    useEffect(() => loadData());

    const {
        rows, skip, totalCount, loading, selected, data
    } = state;


    return (
        <div>
            <LogInfo data={data} />
            <Paper>
                <Grid
                    rows={rows}
                    columns={columns}
                    getRowId={getRowId}
                >
                    <SearchState onValueChange={changeSearch} defaultValue="" />
                    <SelectionState
                        selection={[selected]}
                        onSelectionChange={changeSelection}
                        defaultValue=""
                    />
                    <VirtualTableState
                        loading={loading}
                        totalRowCount={totalCount}
                        pageSize={VIRTUAL_PAGE_SIZE}
                        skip={skip}
                        getRows={getRemoteRows}
                    />

                    <VirtualTable columnExtensions={tableColumnExtensions} />

                    <TableHeaderRow />
                    <TableSelection
                        selectByRowClick
                        highlightRow
                        showSelectionColumn={false}
                    />

                    <Toolbar />
                    <SearchPanel />

                </Grid>
                {loading && <Loading />}

            </Paper>
        </div>
    );
};