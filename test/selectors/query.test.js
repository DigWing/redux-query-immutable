import { assert } from 'chai';

import { getQueryKey } from '../../src/lib/query-key';
import * as querySelectors from '../../src/selectors/query';

import { fromJS } from 'immutable';

describe('query selectors', () => {
    describe('isFinished', () => {
        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig);
            const isFinished = querySelectors.isFinished(
                fromJS({
                    [queryKey]: {
                        isFinished: true,
                    },
                }),
                queryConfig
            );
            assert.isTrue(isFinished);
        });

        it('should work with a config with a queryKey field', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
                queryKey: 'myQueryKey',
            };
            const isFinished = querySelectors.isFinished(
                fromJS({
                    myQueryKey: {
                        isFinished: true,
                    },
                }),
                queryConfig
            );
            assert.isTrue(isFinished);
        });
    });

    describe('isPending', () => {
        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig);
            const isPending = querySelectors.isPending(
                fromJS({
                    [queryKey]: {
                        isPending: true,
                    },
                }),
                queryConfig
            );
            assert.isTrue(isPending);
        });

        it('should work with a config with a queryKey field', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
                queryKey: 'myQueryKey',
            };
            const isPending = querySelectors.isPending(
                fromJS({
                    myQueryKey: {
                        isPending: true,
                    },
                }),
                queryConfig
            );
            assert.isTrue(isPending);
        });
    });

    describe('status', () => {
        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig);
            const status = querySelectors.status(
                fromJS({
                    [queryKey]: {
                        status: 200,
                    },
                }),
                queryConfig
            );
            assert.equal(status, 200);
        });

        it('should work with a config with a queryKey field', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
                queryKey: 'myQueryKey',
            };
            const status = querySelectors.status(
                fromJS({
                    myQueryKey: {
                        status: 200,
                    },
                }),
                queryConfig
            );
            assert.equal(status, 200);
        });
    });

    describe('lastUpdated', () => {
        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig);
            const lastUpdated = querySelectors.lastUpdated(
                fromJS({
                    [queryKey]: {
                        lastUpdated: 1488471746117,
                    },
                }),
                queryConfig
            );
            assert.equal(lastUpdated, 1488471746117);
        });

        it('should work with a config with a queryKey field', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
                queryKey: 'myQueryKey',
            };
            const lastUpdated = querySelectors.lastUpdated(
                fromJS({
                    myQueryKey: {
                        lastUpdated: 1488471746117,
                    },
                }),
                queryConfig
            );
            assert.equal(lastUpdated, 1488471746117);
        });
    });

    describe('queryCount', () => {
        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig);
            const queryCount = querySelectors.queryCount(
                fromJS({
                    [queryKey]: {
                        queryCount: 2,
                    },
                }),
                queryConfig
            );
            assert.equal(queryCount, 2);
        });

        it('should work with a config with a queryKey field', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
                queryKey: 'myQueryKey',
            };
            const queryCount = querySelectors.queryCount(
                fromJS({
                    myQueryKey: {
                        queryCount: 2,
                    },
                }),
                queryConfig
            );
            assert.equal(queryCount, 2);
        });
    });
});
