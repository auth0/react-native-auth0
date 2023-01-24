/**
 * @ignore
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_COMPLETE':
      return {...state, error: null, user: action.user};

    case 'LOGOUT_COMPLETE':
      return {...state, error: null, user: null};

    case 'ERROR':
      return {...state, isInitialized: true, error: action.error};

    case 'INITIALIZED':
      return {...state, isInitialized: true, user: action.user};
  }
};

export default reducer;
