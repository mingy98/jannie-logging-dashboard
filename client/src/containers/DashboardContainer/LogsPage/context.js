import React from 'react';
import {VIRTUAL_PAGE_SIZE} from '../../../constants.js'

const LogsContext = React.createContext({
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
    selected_data: [{ title: "Latency", data: [] },
        { title: "Average Decode Time", data: [] },
        { title: "Average Encode Time", data: [] },
        { title: "Average Encode Size", data: [] },
    ],
});

export default LogsContext;