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
      return {...state, isLoading: false, error: action.error};

    case 'INITIALIZED':
      return {...state, isLoading: false, user: action.user};
  }
};

export default reducer;
