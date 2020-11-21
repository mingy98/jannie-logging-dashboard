import React, {
    useReducer, useState, useEffect, useMemo, Component
} from 'react';
import Paper from '@material-ui/core/Paper';
import {
    VirtualTableState,
    DataTypeProvider,
    FilteringState,
    SortingState,
    createRowCache,
} from '@devexpress/dx-react-grid';
import {
    Grid,
    VirtualTable,
    TableHeaderRow,
    TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';
import { config } from '../../../../constants.js'
import {connect} from 'react-redux';


//import { Loading } from '../../../theme-sources/material-ui/components/loading';

const VIRTUAL_PAGE_SIZE = 100;
const MAX_ROWS = 50000;
//const URL = 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/Sales';
const URL = config.url.PRIMARY_SERVER + '/logs?start={0}&end={1}';
const getRowId = row => row.Id;



// client_logs: "https://fractal-technical-interview-data.s3.amazonaws.com/client1534.txt"
// connection_id: 28770
// ip: "52.237.153.167"
// last_updated: "06/30/2020, 21:02"
// server_logs: "https://fractal-technical-interview-data.s3.amazonaws.com/server51538.txt"
// username: "noah@apollohct.com"
// version: "1A32D5BE58D317FF"


const [tableColumnExtensions] = useState([
    { columnName: 'connection_id', width: 70 },
    { columnName: 'ip', width: 200 },
    { columnName: 'last_updated', width: 220 },
    { columnName: 'username', width: 100 },
    { columnName: 'version', width: 110 },
]);

const LogTable = (props) => {

    // constructor(props) {
    //     super(props)
    //     this.state = {}
    // }
    // getColumns = () => {

    // }

    const[state, dispatch] = useReducer(reducer, initialState);
    const[columns] = useState([
        { name: 'Id', title: 'Id', getCellValue: row => row.Id },
        { name: 'ProductCategoryName', title: 'Category', getCellValue: row => row.ProductCategoryName },
        { name: 'StoreName', title: 'Store', getCellValue: row => row.StoreName },
        { name: 'ProductName', title: 'Product', getCellValue: row => row.ProductName },
        { name: 'DateKey', title: 'Date', getCellValue: row => row.DateKey },
        { name: 'SalesAmount', title: 'Amount', getCellValue: row => row.SalesAmount },
    ]);
    // const[tableColumnExtensions] = useState([
    //     { columnName: 'Id', width: 70 },
    //     { columnName: 'ProductCategoryName', width: 200 },
    //     { columnName: 'StoreName', width: 220 },
    //     { columnName: 'DateKey', width: 100 },
    //     { columnName: 'SalesAmount', width: 110 },
    // ]);

    const cache = useMemo(() => createRowCache(VIRTUAL_PAGE_SIZE), [VIRTUAL_PAGE_SIZE]);
    const [columns] = useState([
    { name: 'connection_id', title: 'Id', getCellValue: row => row.connection_id },
    { name: 'ip', title: 'IP', getCellValue: row => row.ip },
    { name: 'last_updated', title: 'Last Updated', getCellValue: row => row.last_updated },
    { name: 'username', title: 'Username', getCellValue: row => row.username },
    { name: 'version', title: 'Version', getCellValue: row => row.version },
    ]);



    const buildQueryString = () => {
        const {
            requestedSkip, take, filters, sorting,
        } = this.state;
        const filterStr = filters
            .map(({ columnName, value, operation }) => (
                `["${columnName}","${operation}","${value}"]`
            )).join(',"and",');
        const sortingConfig = sorting
            .map(({ columnName, direction }) => ({
                selector: columnName,
                desc: direction === 'desc',
            }));
        const sortingStr = JSON.stringify(sortingConfig);
        const filterQuery = filterStr ? `&filter=[${escape(filterStr)}]` : '';
        const sortQuery = sortingStr ? `&sort=${escape(`${sortingStr}`)}` : '';

        return `${URL}?requireTotalCount=true&skip=${requestedSkip}&take=${take}${filterQuery}${sortQuery}`;
    };

    useEffect(() => loadData());


    const {
        rows, skip, totalCount, loading, sorting, filters,
    } = state;


        return (
            <Paper>
                <Grid
                    rows={rows}
                    columns={columns}
                    getRowId={getRowId}
                >
                    {/* <CurrencyTypeProvider for={['SalesAmount']} />
                    <DateTypeProvider for={['DateKey']} /> */}
                    <VirtualTableState
                        loading={loading}
                        totalRowCount={totalCount}
                        pageSize={VIRTUAL_PAGE_SIZE}
                        skip={skip}
                        getRows={this.props.getRemoteRows}
                    />
                    <SortingState
                        sorting={sorting}
                        onSortingChange={this.props.changeSorting}
                    />
                    <FilteringState
                        filters={filters}
                        onFiltersChange={this.props.changeFilters}
                    />
                    <VirtualTable columnExtensions={tableColumnExtensions} />
                    <TableHeaderRow showSortingControls />
                    <TableFilterRow />
                </Grid>
                {/* {loading && <Loading />} */}

            </Paper>
        );

    
}

const mapStateToProps = state => {
    return {
        rows: state.MainReducer.counter,
        skip: state.MainReducer.skip,
        requestedSkip: state.MainReducer.requestedSkip,
        take: state.MainReducer.take,
        totalCount: state.MainReducer.totalCount,
        loading: state.MainReducer.loading,
        lastQuery: state.MainReducer.lastQuery,
        sorting: state.MainReducer.sorting,
        filters: state.MainReducer.filters,
        forceReload: state.MainReducer.forceReload,
    }

}


const mapDispatchToProps = dispatch => {
    return {

        updateRows: (skip, count, newTotalCount) => {
            dispatch({
                type: 'UPDATE_ROWS',
                payload: {
                    skip: Math.min(skip, newTotalCount),
                    rows: cache.getRows(skip, count),
                    totalCount: newTotalCount < MAX_ROWS ? newTotalCount : MAX_ROWS,
                },
            });
        },

        getRemoteRows: (requestedSkip, take) => dispatch({ type: 'START_LOADING', payload: { requestedSkip, take } }),

        loadData: () => {
            const {
                requestedSkip, take, lastQuery, loading, forceReload, totalCount,
            } = this.state;
            const query = this.buildQueryString();
            if ((query !== lastQuery || forceReload) && !loading) {
                if (forceReload) {
                    cache.invalidate();
                }
                const cached = cache.getRows(requestedSkip, take);
                if (cached.length === take) {
                    this.props.updateRows(requestedSkip, take, totalCount);
                } else {
                    dispatch({ type: 'FETCH_INIT' });
                    fetch(query)
                        .then(response => response.json())
                        .then(({ data, totalCount: newTotalCount }) => {
                            cache.setRows(requestedSkip, data);
                            this.props.updateRows(requestedSkip, take, newTotalCount);
                        })
                        .catch(() => dispatch({ type: 'REQUEST_ERROR' }));
                }
                dispatch({ type: 'UPDATE_QUERY', payload: query });
            }
        },

        changeFilters: (value) => dispatch({ type: 'CHANGE_FILTERS', payload: value }),
        changeSorting: (value) => dispatch({ type: 'CHANGE_SORTING', payload: value }),
    }
}






export default connect(mapStateToProps, mapDispatchToProps)(LogTable);


  //   const CurrencyFormatter = ({ value }) => (
//     <b style={{ color: 'darkblue' }}>
//       {value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
//     </b>
//   );

//   const CurrencyTypeProvider = props => (
//     <DataTypeProvider
//       formatterComponent={CurrencyFormatter}
//       {...props}
//     />
//   );

//   const DateFormatter = ({ value }) => value.replace(/(\d{4})-(\d{2})-(\d{2})(T.*)/, '$3.$2.$1');

//   const DateTypeProvider = props => (
//     <DataTypeProvider
//       formatterComponent={DateFormatter}
//       {...props}
//     />
//   );

//   const initialState = {
//     rows: [],
//     skip: 0,
//     requestedSkip: 0,
//     take: VIRTUAL_PAGE_SIZE * 2,
//     totalCount: 0,
//     loading: false,
//     lastQuery: '',
//     sorting: [],
//     filters: [],
//     forceReload: false,
//   };

//   function reducer(state, { type, payload }) {
//     switch (type) {
//       case 'UPDATE_ROWS':
//         return {
//           ...state,
//           ...payload,
//           loading: false,
//         };
//       case 'CHANGE_SORTING':
//         return {
//           ...state,
//           forceReload: true,
//           rows: [],
//           sorting: payload,
//         };
//       case 'CHANGE_FILTERS':
//         return {
//           ...state,
//           forceReload: true,
//           requestedSkip: 0,
//           rows: [],
//           filters: payload,
//         };
//       case 'START_LOADING':
//         return {
//           ...state,
//           requestedSkip: payload.requestedSkip,
//           take: payload.take,
//         };
//       case 'REQUEST_ERROR':
//         return {
//           ...state,
//           loading: false,
//         };
//       case 'FETCH_INIT':
//         return {
//           ...state,
//           loading: true,
//           forceReload: false,
//         };
//       case 'UPDATE_QUERY':
//         return {
//           ...state,
//           lastQuery: payload,
//         };
//       default:
//         return state;
//     }
//   }


    // const[state, dispatch] = useReducer(reducer, initialState);
    // const[columns] = useState([
    //     { name: 'Id', title: 'Id', getCellValue: row => row.Id },
    //     { name: 'ProductCategoryName', title: 'Category', getCellValue: row => row.ProductCategoryName },
    //     { name: 'StoreName', title: 'Store', getCellValue: row => row.StoreName },
    //     { name: 'ProductName', title: 'Product', getCellValue: row => row.ProductName },
    //     { name: 'DateKey', title: 'Date', getCellValue: row => row.DateKey },
    //     { name: 'SalesAmount', title: 'Amount', getCellValue: row => row.SalesAmount },
    // ]);
    // const[tableColumnExtensions] = useState([
    //     { columnName: 'Id', width: 70 },
    //     { columnName: 'ProductCategoryName', width: 200 },
    //     { columnName: 'StoreName', width: 220 },
    //     { columnName: 'DateKey', width: 100 },
    //     { columnName: 'SalesAmount', width: 110 },
    // ]);

    // const cache = useMemo(() => createRowCache(VIRTUAL_PAGE_SIZE), [VIRTUAL_PAGE_SIZE]);
    // const updateRows = (skip, count, newTotalCount) => {
    //     dispatch({
    //         type: 'UPDATE_ROWS',
    //         payload: {
    //             skip: Math.min(skip, newTotalCount),
    //             rows: cache.getRows(skip, count),
    //             totalCount: newTotalCount < MAX_ROWS ? newTotalCount : MAX_ROWS,
    //         },
    //     });
    // };

    // const getRemoteRows = (requestedSkip, take) => {
    //     dispatch({ type: 'START_LOADING', payload: { requestedSkip, take } });
    // };

    // buildQueryString = () => {
    //     const {
    //         requestedSkip, take, filters, sorting,
    //     } = state;
    //     const filterStr = filters
    //         .map(({ columnName, value, operation }) => (
    //             `["${columnName}","${operation}","${value}"]`
    //         )).join(',"and",');
    //     const sortingConfig = sorting
    //         .map(({ columnName, direction }) => ({
    //             selector: columnName,
    //             desc: direction === 'desc',
    //         }));
    //     const sortingStr = JSON.stringify(sortingConfig);
    //     const filterQuery = filterStr ? `&filter=[${escape(filterStr)}]` : '';
    //     const sortQuery = sortingStr ? `&sort=${escape(`${sortingStr}`)}` : '';

    //     return `${URL}?requireTotalCount=true&skip=${requestedSkip}&take=${take}${filterQuery}${sortQuery}`;
    // };

    // const changeFilters = (value) => {
    //     dispatch({ type: 'CHANGE_FILTERS', payload: value });
    // };

    // const changeSorting = (value) => {
    //     dispatch({ type: 'CHANGE_SORTING', payload: value });
    // };