/**
 * @flow
 */

import _ from 'lodash';

export const actions = {
  // logLevel = 'warning', 'error', or 'info'
  add: (projectRoot: string, id: string, message: string, tag: string, logLevel: string) => {
    return {
      type: 'ADD_NOTIFICATION',
      projectRoot,
      id,
      message,
      tag,
      logLevel,
    };
  },

  clear: (projectRoot: string, id: string) => {
    return {
      type: 'CLEAR_NOTIFICATION',
      projectRoot,
      id,
    };
  },
};

const INITIAL_PROJECT_STATE = {
  count: 0,
  color: '#595C68',
  info: [],
  warn: [],
  error: [],
};

export const reducer = (state: any = {}, action: any) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return _addNotification(state, action);
    case 'CLEAR_NOTIFICATION':
      return _clearNotification(state, action);
    default:
      return state;
  }
};

function _addNotification(state: any, action: any) {
  let { projectRoot, id, message, tag, logLevel } = action;

  let projectObject = state[projectRoot] || INITIAL_PROJECT_STATE;
  let arrayOfIssues = projectObject[logLevel];
  let index = _.findIndex(arrayOfIssues, { id });
  if (index === -1) {
    arrayOfIssues.push({
      id,
      message,
      tag,
      count: 0,
    });
  } else {
    arrayOfIssues[index] = {
      id,
      message,
      tag,
      count: arrayOfIssues[index].count + 1,
    };
  }

  // TODO: switch to immutable.js
  let newState = JSON.parse(JSON.stringify(state));
  projectObject[logLevel] = arrayOfIssues;
  _setCount(projectObject);
  newState[projectRoot] = projectObject;
  return newState;
}

function _clearNotification(state: any, action: any) {
  let { projectRoot, id } = action;

  if (!state[projectRoot]) {
    return state;
  }

  let projectObject = state[projectRoot];
  let newProjectObject = {};
  _.forEach(projectObject, function(array, key) {
    _.remove(array, (notification) => {
      return notification.id === id;
    });

    newProjectObject[key] = array;
  });

  _setCount(newProjectObject);
  // TODO: switch to immutable.js
  let newState = JSON.parse(JSON.stringify(state));
  newState[projectRoot] = newProjectObject;
  return newState;
}

function _setCount(projectObject: any) {
  projectObject.count = projectObject.warn.length + projectObject.error.length;
  if (projectObject.count === 0) {
    projectObject.color = '#595C68';
  } else {
    projectObject.color = projectObject.error.length > 0 ? '#F6345D' : '#FF8C00';
  }

  return projectObject;
}
