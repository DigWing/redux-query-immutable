import { assert } from 'chai';

import * as actionTypes from '../../src/constants/action-types';
import entities from '../../src/reducers/entities';

import { fromJS } from 'immutable';

const assertEqual = (newEntities, expectedEntities) => {
  assert.equal(newEntities.get('message'), expectedEntities.get('message'));
  assert.equal(newEntities.get('user'), expectedEntities.get('user'));
};

describe('entities reducer', () => {
  it('should handle REQUEST_SUCCESS', () => {
    const action = {
      type: actionTypes.REQUEST_SUCCESS,
      entities: fromJS({
        message: 'hello, world!',
      }),
    };
    const prevState = fromJS({
      user: 'ryanashcraft',
    });
    const newEntities = entities(prevState, action);
    const expectedEntities = fromJS({
      message: 'hello, world!',
      user: 'ryanashcraft',
    });

    assertEqual(newEntities, expectedEntities);
  });

  it('should handle MUTATE_SUCCESS', () => {
    const action = {
      type: actionTypes.MUTATE_SUCCESS,
      entities: fromJS({
        message: 'hello, world!',
      }),
    };
    const prevState = fromJS({
      user: 'ryanashcraft',
    });
    const newEntities = entities(prevState, action);
    const expectedEntities = fromJS({
      message: 'hello, world!',
      user: 'ryanashcraft',
    });
    assertEqual(newEntities, expectedEntities);
  });

  it('should handle MUTATE_START and optimistic entities', () => {
    const action = {
      type: actionTypes.MUTATE_START,
      optimisticEntities: fromJS({
        message: 'hello, optimistic world!',
      }),
    };
    const prevState = fromJS({
      message: 'hello, world!',
      user: 'ryanashcraft',
    });
    const newEntities = entities(prevState, action);
    const expectedEntities = fromJS({
      message: 'hello, optimistic world!',
      user: 'ryanashcraft',
    });
    assertEqual(newEntities, expectedEntities);
  });

  it('should handle MUTATE_FAILURE and original entities', () => {
    const action = {
      type: actionTypes.MUTATE_FAILURE,
      rolledBackEntities: fromJS({
        message: 'hello, world!',
      }),
    };
    const prevState = fromJS({
      message: 'hello, optimistic world!',
      user: 'ryanashcraft',
    });
    const newEntities = entities(prevState, action);
    const expectedEntities = fromJS({
      message: 'hello, world!',
      user: 'ryanashcraft',
    });
    assertEqual(newEntities, expectedEntities);
  });

  it('should handle RESET', () => {
    const action = {
      type: actionTypes.RESET,
    };
    const prevState = fromJS({
      message: 'hello, world!',
      user: 'ryanashcraft',
    });
    const newEntities = entities(prevState, action);
    assert.isTrue(newEntities.isEmpty());
  });

  it('should handle UPDATE_ENTITIES', () => {
    const action = {
      type: actionTypes.UPDATE_ENTITIES,
      update: {
        some: value => value.merge(fromJS({ thing: {} })),
      },
    };
    const prevState = fromJS({
      some: {
        thing: {
          gone: {},
        },
      },
    });
    const newEntities = entities(prevState, action);
    assert.isTrue(newEntities.getIn(['some', 'thing']).isEmpty());
  });

  it('should handle UPDATE_ENTITIES with multiple entities', () => {
    const action = {
      type: actionTypes.UPDATE_ENTITIES,
      update: {
        some: value => value.merge(fromJS({ thing: {} })),
        something: value => value.merge(fromJS({ else: {} })),
      },
    };
    const prevState = fromJS({
      some: {
        thing: {
          gone: {},
        },
      },
      something: {
        else: {
          gone: {},
        },
      },
      dont: {
        touch: {
          this: {},
        },
      },
    });
    const newEntities = entities(prevState, action);
    assert.isNotTrue(prevState.getIn(['some', 'thing']).isEmpty());
    assert.isNotTrue(prevState.getIn(['something', 'else']).isEmpty());
    assert.isTrue(newEntities.getIn(['some', 'thing']).isEmpty());
    assert.isTrue(newEntities.getIn(['something', 'else']).isEmpty());
  });
});
