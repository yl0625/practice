import {
  signinApi,
  signupApi,
  getUserInfoApi
} from '@/service/api';

const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';
const INIT = {
  error: '',
  info: null
};

// reducer
export function user(state = INIT, action) {
  const { type, payload } = action;
  switch(type) {
    case SUCCESS:
      return { ...state, info: payload };
    case ERROR:
      return { ...state, error: payload };
    default:
      return state;
  }
}

export function getUserInfo() {
  return dispatch => {
    getUserInfoApi().then(res => {
      if (res.status === 1) {
        dispatch(success(res.data));
      } else {
        dispatch(error(res.message));
      }
    });
  };
}

export function signupFunc(obj) {
  return dispatch => {
    signupApi(obj).then(res => {
      if (res.status === 1) {
        dispatch(success(res.data));
      } else {
        dispatch(error(res.message));
      }
    });
  };
}

export function signinFunc(obj) {
  return dispatch => {
    signinApi(obj).then(res => {
      if (res.status === 1) {
        dispatch(success(res.data));
      } else {
        dispatch(error(res.message));
      }
    });
  }
}

function success(data) {
  return { type: SUCCESS, payload: data };
}

function error(msg) {
  return { type: ERROR, payload: msg };
}