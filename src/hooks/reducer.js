/**
 * @ignore
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_STARTED':
      return {...state, isLoading: true};

    case 'LOGIN_COMPLETE':
      return {...state, error: null, isLoading: false, user: action.user};

    case 'LOGOUT_COMPLETE':
      return {...state, error: null, user: null};

    case 'ERROR':
      return {...state, error: action.error, isLoading: false};

    case 'INITIALIZED':
      return {...state, isLoading: false, user: action.user};
  }
};

export default reducer;
