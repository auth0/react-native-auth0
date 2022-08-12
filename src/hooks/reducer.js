const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_COMPLETE':
      return {...state, user: action.user};

    case 'LOGOUT_COMPLETE':
      return {...state, user: null};
  }
};

export default reducer;
