import { assert } from 'chai';

import { getQueryKey } from '../../src/lib/query-key';
import * as querySelectors from '../../src/selectors/query';

import { fromJS } from 'immutable';

describe('query selectors', () => {
    describe('isFinished', () => {
        it('should work with just url', () => {
            const isFinished = querySelectors.isFinished('/api/dashboards')(
                fromJS({
                    '{"url":"/api/dashboards"}': {
                        isFinished: true,
                    },
                })
            );
            assert.isTrue(isFinished);
        });

        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig.url, queryConfig.body);
            const isFinished = querySelectors.isFinished(queryConfig)(
                fromJS({
                    [queryKey]: {
                        isFinished: true,
                    },
                })
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
            const isFinished = querySelectors.isFinished(queryConfig)(
                fromJS({
                    myQueryKey: {
                        isFinished: true,
                    },
                })
            );
            assert.isTrue(isFinished);
        });
    });

    describe('isPending', () => {
        it('should work with just url', () => {
            const isPending = querySelectors.isPending('/api/dashboards')(
                fromJS({
                    '{"url":"/api/dashboards"}': {
                        isPending: true,
                    },
                })
            );
            assert.isTrue(isPending);
        });

        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig.url, queryConfig.body);
            const isPending = querySelectors.isPending(queryConfig)(
                fromJS({
                    [queryKey]: {
                        isPending: true,
                    },
                })
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
            const isPending = querySelectors.isPending(queryConfig)(
                fromJS({
                    myQueryKey: {
                        isPending: true,
                    },
                })
            );
            assert.isTrue(isPending);
        });
    });

    describe('status', () => {
        it('should work with just url', () => {
            const status = querySelectors.status('/api/dashboards')(
                fromJS({
                    '{"url":"/api/dashboards"}': {
                        status: 200,
                    },
                })
            );
            assert.equal(status, 200);
        });

        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig.url, queryConfig.body);
            const status = querySelectors.status(queryConfig)(
                fromJS({
                    [queryKey]: {
                        status: 200,
                    },
                })
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
            const status = querySelectors.status(queryConfig)(
                fromJS({
                    myQueryKey: {
                        status: 200,
                    },
                })
            );
            assert.equal(status, 200);
        });
    });

    describe('lastUpdated', () => {
        it('should work with just url', () => {
            const lastUpdated = querySelectors.lastUpdated('/api/dashboards')(
                fromJS({
                    '{"url":"/api/dashboards"}': {
                        lastUpdated: 1488471746117,
                    },
                })
            );
            assert.equal(lastUpdated, 1488471746117);
        });

        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig.url, queryConfig.body);
            const lastUpdated = querySelectors.lastUpdated(queryConfig)(
                fromJS({
                    [queryKey]: {
                        lastUpdated: 1488471746117,
                    },
                })
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
            const lastUpdated = querySelectors.lastUpdated(queryConfig)(
                fromJS({
                    myQueryKey: {
                        lastUpdated: 1488471746117,
                    },
                })
            );
            assert.equal(lastUpdated, 1488471746117);
        });
    });

    describe('queryCount', () => {
        it('should work with just url', () => {
            const queryCount = querySelectors.queryCount('/api/dashboards')(
                fromJS({
                    '{"url":"/api/dashboards"}': {
                        queryCount: 2,
                    },
                })
            );
            assert.equal(queryCount, 2);
        });

        it('should work with a config', () => {
            const queryConfig = {
                url: '/api/dashboard/1/rename',
                body: {
                    name: 'My KPIs',
                },
            };
            const queryKey = getQueryKey(queryConfig.url, queryConfig.body);
            const queryCount = querySelectors.queryCount(queryConfig)(
                fromJS({
                    [queryKey]: {
                        queryCount: 2,
                    },
                })
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
            const queryCount = querySelectors.queryCount(queryConfig)(
                fromJS({
                    myQueryKey: {
                        queryCount: 2,
                    },
                })
            );
            assert.equal(queryCount, 2);
        });
    });
});
