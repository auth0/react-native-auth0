const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_COMPLETE':
      return {...state, user: action.user};
  }

  return state;
};

export default reducer;
