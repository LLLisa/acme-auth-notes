import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import axios from 'axios';

const notes = (state = [], action) => {
  if (action.type === 'SET_NOTES') {
    return action.notes;
  }
  if (action.type === 'ADD_NOTE') {
    return [...state, action.note];
  }
  return state;
};

const auth = (state = {}, action) => {
  if (action.type === 'SET_AUTH') {
    return action.auth;
  }
  return state;
};

const logout = () => {
  window.localStorage.removeItem('token');
  return {
    type: 'SET_AUTH',
    auth: {},
  };
};

const signIn = (credentials) => {
  return async (dispatch) => {
    let response = await axios.post('/api/auth', credentials);
    const { token } = response.data;
    window.localStorage.setItem('token', token);
    return dispatch(attemptLogin());
  };
};
const attemptLogin = () => {
  return async (dispatch) => {
    const token = window.localStorage.getItem('token');
    if (token) {
      const response = await axios.get('/api/auth', {
        headers: {
          authorization: token,
        },
      });
      dispatch({ type: 'SET_AUTH', auth: response.data });
    }
  };
};

const getNotes = () => {
  return async (dispatch) => {
    const token = window.localStorage.getItem('token');
    if (token) {
      const notes = (
        await axios.get('/api/notes', {
          headers: {
            authorization: token,
          },
        })
      ).data;
      dispatch({ type: 'SET_NOTES', notes });
    }
  };
};

const addNote = (noteText) => {
  return async (dispatch) => {
    const token = window.localStorage.getItem('token'); //test to see if getItem is necesy
    if (token) {
      const note = (
        await axios.post('/api/notes', {
          authorization: token,
          text: noteText,
        })
      ).data;
      console.log(note);
      dispatch({ type: 'ADD_NOTE', note });
    }
  };
};

const store = createStore(
  combineReducers({
    auth,
    notes,
  }),
  applyMiddleware(thunk, logger)
);

export { attemptLogin, signIn, logout, getNotes, addNote };

export default store;
