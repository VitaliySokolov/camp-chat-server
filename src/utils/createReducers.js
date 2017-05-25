export {
  createReducers
};

function createReducers (reducerObj) {
    return Object.keys(reducerObj).reduce((accum, reducerName) => {
        accum[reducerName] = createReducer(reducerObj[reducerName]);

        return accum;
    }, {});
}

function createReducer (handlers) {
    return (state = null, action) => {
        const actionType = handlers[action.type];

        return actionType ? actionType(state, action) : state;
    };
}
