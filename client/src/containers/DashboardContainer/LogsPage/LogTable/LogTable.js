import React, {
  useReducer, useState, useEffect, useMemo,
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

import { Loading } from '../../../../assets/Loading/loading.jsx';
import { config } from '../../../../constants.js'

const VIRTUAL_PAGE_SIZE = 100;
const MAX_ROWS = 50000;
//const URL = 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/Sales';
//const URL = 'http://127.0.0.1:5000/logs';
const URL = config.url.PRIMARY_SERVER + '/logs'; //+ '/logs?start=0&end=100';


const getRowId = row => row.Id;


const initialState = {
  rows: [],
  skip: 0,
  requestedSkip: 0,
  take: VIRTUAL_PAGE_SIZE * 2,
  totalCount: 50000,
  loading: false,
  lastQuery: '',
  sorting: [],
  filters: [],
  forceReload: false,
};

function reducer(state, { type, payload }) {
  switch (type) {
      case 'UPDATE_ROWS':
          return {
              ...state,
              ...payload,
              loading: false,
          };
      case 'CHANGE_SORTING':
          return {
              ...state,
              forceReload: true,
              rows: [],
              sorting: payload,
          };
      case 'CHANGE_FILTERS':
          return {
              ...state,
              forceReload: true,
              requestedSkip: 0,
              rows: [],
              filters: payload,
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
      default:
          return state;
  }
}

export default () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [columns] = useState([
      { name: 'username', title: 'Username', getCellValue: row => row.username },
      { name: 'connection_id', title: 'Id', getCellValue: row => row.connection_id },
      { name: 'ip', title: 'IP', getCellValue: row => row.ip },
      { name: 'last_updated', title: 'Last Updated', getCellValue: row => row.last_updated },
      { name: 'version', title: 'Version', getCellValue: row => row.version },
  ]);
  const [tableColumnExtensions] = useState([
      { columnName: 'username', width: 275 },
      { columnName: 'connection_id', width: 100 },
      { columnName: 'ip', width: 150 },
      { columnName: 'last_updated', width: 175 },
      { columnName: 'version', width: 200 },
  ]);

  const cache = useMemo(() => createRowCache(VIRTUAL_PAGE_SIZE), [VIRTUAL_PAGE_SIZE]);
  const updateRows = (skip, count, newTotalCount) => {
      dispatch({
          type: 'UPDATE_ROWS',
          payload: {
              skip: Math.min(skip, newTotalCount),
              rows: cache.getRows(skip, count),
              totalCount: newTotalCount < MAX_ROWS ? newTotalCount : MAX_ROWS,
          },
      });
  };

  const getRemoteRows = (requestedSkip, take) => {
      dispatch({ type: 'START_LOADING', payload: { requestedSkip, take } });
  };

  const buildQueryString = () => {
      const {
          requestedSkip, take, filters, sorting,
      } = state;
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

  const loadData = () => {
      const {
          requestedSkip, take, lastQuery, loading, forceReload, totalCount,
      } = state;
      const query = buildQueryString();
      if ((query !== lastQuery || forceReload) && !loading) {
          if (forceReload) {
              cache.invalidate();
          }
          const cached = cache.getRows(requestedSkip, take);
          if (cached.length === take) {
              updateRows(requestedSkip, take, totalCount);
          } else {
              dispatch({ type: 'FETCH_INIT' });
              fetch(query)//query`${URL}`
                  .then(response => {
                      // console.log("Response:");

                      // console.log(response);
                      return response.json()
                  })
                  .then((data) => { //data
                      console.log(data);
                      cache.setRows(requestedSkip, data.logs);
                      updateRows(requestedSkip, take, totalCount);
                  })
                  .catch(() => dispatch({ type: 'REQUEST_ERROR' }));
          }
          dispatch({ type: 'UPDATE_QUERY', payload: query });
      }
  };

  const changeFilters = (value) => {
      dispatch({ type: 'CHANGE_FILTERS', payload: value });
  };

  const changeSorting = (value) => {
      dispatch({ type: 'CHANGE_SORTING', payload: value });
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
              <VirtualTableState
                  loading={loading}
                  totalRowCount={totalCount}
                  pageSize={VIRTUAL_PAGE_SIZE}
                  skip={skip}
                  getRows={getRemoteRows}
              />
              <SortingState
                  sorting={sorting}
                  onSortingChange={changeSorting}
              />
              <FilteringState
                  filters={filters}
                  onFiltersChange={changeFilters}
              />
              <VirtualTable columnExtensions={tableColumnExtensions} />
              <TableHeaderRow showSortingControls />
              <TableFilterRow />
          </Grid>
          {loading && <Loading />}

      </Paper>

  );
};