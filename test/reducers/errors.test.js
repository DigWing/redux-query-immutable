import chai from 'chai';
import { fromJS } from 'immutable';
import chaiImmutable from 'chai-immutable';

chai.use(chaiImmutable);

import * as actionTypes from '../../src/constants/action-types';
import errors from '../../src/reducers/errors';

describe('errors reducer', () => {
    it('should record body, text, headers on REQUEST_FAILURE', () => {
        const action = {
            type: actionTypes.REQUEST_FAILURE,
            queryKey: '{"url":"/hello"}',
            responseBody: {
                error: 'please stop',
            },
            responseText: '{"error":"please stop"}',
            responseHeaders: {
                hello: 'world',
            },
        };
        const prevState = fromJS({
            '{"url":"/test"}': {
                responseBody: {
                    test: 'a',
                },
                responseText: '{"test":"a"}',
                responseHeaders: {},
            },
        });
        const newState = errors(prevState, action);
        const expectedState = fromJS({
            '{"url":"/hello"}': {
                responseBody: {
                    error: 'please stop',
                },
                responseText: '{"error":"please stop"}',
                responseHeaders: {
                    hello: 'world',
                },
            },
            '{"url":"/test"}': {
                responseBody: {
                    test: 'a',
                },
                responseText: '{"test":"a"}',
                responseHeaders: {},
            },
        });
        chai.expect(newState).to.be.equal(expectedState);
    });

    it('should record body, text, headers on MUTATE_FAILURE', () => {
        const action = {
            type: actionTypes.MUTATE_FAILURE,
            queryKey: '{"url":"/change-name","body":{"name":"Ryan"}}',
            responseBody: {
                error: 'invalid name',
            },
            responseText: '{"error":"invalid name"}',
            responseHeaders: {},
        };
        const prevState = fromJS({
            '{"url":"/test"}': {
                responseBody: {
                    test: 'a',
                },
                responseText: '{"test":"a"}',
                responseHeaders: {},
            },
        });
        const newState = errors(prevState, action);
        const expectedState = fromJS({
            '{"url":"/test"}': {
                responseBody: {
                    test: 'a',
                },
                responseText: '{"test":"a"}',
                responseHeaders: {},
            },
            '{"url":"/change-name","body":{"name":"Ryan"}}': {
                responseBody: {
                    error: 'invalid name',
                },
                responseText: '{"error":"invalid name"}',
                responseHeaders: {},
            },
        });
        chai.expect(newState).to.be.equal(expectedState);
    });

    it('should remove state for query on REQUEST_START', () => {
        const action = {
            type: actionTypes.REQUEST_START,
            queryKey: '{"url":"/hello"}',
        };
        const prevState = fromJS({
            '{"url":"/test"}': {
                responseBody: {
                    test: 'a',
                },
                responseText: '{"test":"a"}',
                responseHeaders: {},
            },
            '{"url":"/hello"}': {
                responseBody: {
                    hello: 'world!',
                },
                responseText: '{"hello":"world"}',
                responseHeaders: {
                    hello: 'world',
                },
            },
        });
        const newState = errors(prevState, action);
        const expectedState = fromJS({
            '{"url":"/test"}': {
                responseBody: {
                    test: 'a',
                },
                responseText: '{"test":"a"}',
                responseHeaders: {},
            },
        });
        chai.expect(newState).to.be.equal(expectedState);
    });

    it('should remove state for query on MUTATE_START', () => {
        const action = {
            type: actionTypes.MUTATE_START,
            queryKey: '{"url":"/change-name","body":{"name":"Ryan"}}',
        };
        const prevState = fromJS({
            '{"url":"/test"}': {
                responseBody: {
                    test: 'a',
                },
                responseText: '{"test":"a"}',
                responseHeaders: {},
            },
            '{"url":"/change-name","body":{"name":"Ryan"}}': {
                responseBody: {
                    error: 'invalid name',
                },
                responseText: '{"error":"invalid name"}',
                responseHeaders: {},
            },
        });
        const newState = errors(prevState, action);
        const expectedState = fromJS({
            '{"url":"/test"}': {
                responseBody: {
                    test: 'a',
                },
                responseText: '{"test":"a"}',
                responseHeaders: {},
            },
        });
        chai.expect(newState).to.be.equal(expectedState);
    });

    it('should handle RESET', () => {
        const action = {
            type: actionTypes.RESET,
        };
        const prevState = fromJS({
            '{"url":"/hello"}': {
                responseBody: {
                    hello: 'world!',
                },
                responseText: '{"hello":"world"}',
                responseHeaders: {
                    hello: 'world',
                },
            },
        });
        const newState = errors(prevState, action);
        const expectedState = fromJS({});
        chai.expect(newState).to.be.equal(expectedState);
    });
});
