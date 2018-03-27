import { Map } from 'immutable';

export const updateEntities = (update, entities = new Map(), transformed = new Map()) => {
  // If update, not supplied, then no change to entities should be made
  return Object.keys(update || {}).reduce((accum, key) => {
    return accum.set(key, update[key](entities.get(key), transformed.get(key)));
  }, new Map());
};

export const updateResults = (updateResult, results = new Map(), transformedResult = new Map()) => {
  // If update, not supplied, then no change to entities should be made
  return Object.keys(updateResult || {}).reduce((accum, key) => {
    return accum.set(key, updateResult[key](results.get(key), transformedResult.get(key)));
  }, new Map());
};

export const optimisticUpdateEntities = (optimisticUpdate, entities = new Map()) => {
  return Object.keys(optimisticUpdate).reduce((accum, key) => {
    if (optimisticUpdate[key]) {
      return accum.set(key, optimisticUpdate[key](entities.get(key)));
    }
    return accum.set(key, entities.get(key));
  }, new Map());
};

export const optimisticUpdateResults = (optimisticUpdateResult, results = new Map()) => {
  return Object.keys(optimisticUpdateResult).reduce((accum, key) => {
    if (optimisticUpdateResult[key]) {
      return accum.set(key, optimisticUpdateResult[key](results.get(key)));
    }
    return accum.set(key, results.get(key));
  }, new Map());
};

export const rollbackEntities = (rollback = {}, initialEntities, entities) => {
  return Object.keys(initialEntities.toObject()).reduce((accum, key) => {
    if (rollback[key]) {
      return accum.set(key, rollback[key](initialEntities.getIn([key]), entities.getIn([key])));
    } else {
      // Default to just reverting to the initial state for that
      // entity (before the optimistic update)
      return accum.set(key, initialEntities.getIn([key]));
    }
  }, new Map());
};

export const rollbackResults = (rollback = {}, initialResults, results) => {
  return Object.keys(initialResults.toObject()).reduce((accum, key) => {
    if (rollback[key]) {
      return accum.set(key, rollback[key](initialResults.getIn([key]), results.getIn([key])));
    } else {
      // Default to just reverting to the initial state for that
      // entity (before the optimistic update)
      return accum.set(key, initialResults.getIn([key]));
    }
  }, new Map());
};
