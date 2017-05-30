export const createConstants = (...constants) =>
    constants.reduce((acc, constant) => {
        acc[constant] = constant;
        return acc;
    }, {});

export const createReducer = (initialState, reducerMap) =>
    (state = initialState, action) => {
        const reducer = reducerMap[action.type];

        return reducer
            ? reducer(state, action.payload)
            : state;
    };

export const checkHttpStatus = response => {
    if (response.status >= 200 && response.status < 300)
        return response;
    const error = new Error(response.statusText);

    error.response = response;
    throw error;
};

export const parseJSON = response => response.json();

export function prepareFetchOptions (method = 'POST') {
    const headers = new Headers();

    headers.append('Content-Type', 'application/json');
    return {
        method,
        headers,
        mode: 'cors',
        cache: 'default'
    };
}

export function getMaxIndex (arr) {
    if (arr.length !== 0)
        return Math.max.apply(null, arr.map(item => item.id));

    return 0;
}
