# @digitalwing.co/redux-query-immutable

[![npm](https://img.shields.io/npm/v/redux-query-immutable.svg?style=flat-square)](https://www.npmjs.com/package/redux-query-immutable)

`redux-query-immutable` is a fork of the [redux-query](https://github.com/amplitude/redux-query) library, with the only difference that it supports a redux store based on [ImmutableJS](https://facebook.github.io/immutable-js/).

This package is a fork of redux-query-immutable, modified by [Digital Wing](https://github.com/amplitude/redux-query) team.

Please refer to the documentation of [redux-query](https://github.com/amplitude/redux-query) for details of the API.

## Getting Started

Install `redux-query-immutable` via npm:

```
$ npm install --save @digitalwing.co/redux-query-immutable
```

Add the `entitiesReducer` and `queriesReducer` to your combined reducer.

Include the `queryMiddleware` in your store's `applyMiddleware` call. `queryMiddleware` requires two arguments: a selector (or function) that returns entities state, and a function for the queries state.

For example:

```javascript
import { applyMiddleware, createStore } from 'redux';
import { combineReducers } from 'redux-immutable'
import { entitiesReducer, queriesReducer, queryMiddleware } from 'redux-query-immutable';
import createLogger from 'redux-logger';

export const getQueries = (state) => state.get('queries');
export const getEntities = (state) => state.get('entities');

const reducer = combineReducers({
  entities: entitiesReducer,
  queries: queriesReducer,
});

const logger = createLogger();
const store = createStore(
  reducer,
  applyMiddleware(queryMiddleware(getQueries, getEntities), logger)
);
```

### `connectRequest`

This is an updated version of the `connectRequest` higher-order component example from the original `redux-query` library.
The biggest change to the original example is that you now have immutable data in the update functions.

```javascript
import { connectRequest } from 'redux-query-immutable';
import { connect } from 'react-redux-immutable';

class Dashboard extends Component {
  ...
}

const mapStateToProps = (state, props) => ({
  dashboard: getDashboard(state, props),
});

const mapPropsToConfigs = props => [
  {
    url: `/api/dashboard/${props.dashboardId}`,
    update: {
        chartsById: (prevCharts, dashboardCharts) => (
            prevCharts.mergeDeep(dashboardCharts)
        ),
        dashboardsById: (prevDashboards, dashboards) => (
            prevDashboards.mergeDeep(dashboards)
        ),
    },
  }
];

export default compose(
  connect(mapStateToProps),
  connectRequest(mapPropsToConfigs)
)(Dashboard);
```
