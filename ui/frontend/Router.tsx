import React from 'react';

import { createBrowserHistory as createHistory } from 'history';
import { createRouter } from './uss-router';
import UssRouter from './uss-router/Router';

import qs from 'qs';
import Route from 'route-parser';

import * as actions from './actions';

const homeRoute = new Route('/');
const helpRoute = new Route('/help');

const stateSelector = ({ page, configuration }) => ({
  page,
  configuration
});

const stateToLocation = ({ page, configuration }) => {
  switch (page) {
    case 'help':
      return { pathname: '/help' };

    default:
      return { pathname: '/' };
  }
};

const locationToAction = location => {
  const matchedHelp = helpRoute.match(location.pathname);

  if (matchedHelp) {
    return actions.helpPageLoad();
  }

  const matched = homeRoute.match(location.pathname);

  if (matched) {
    return actions.indexPageLoad(qs.parse(location.search.slice(1)));
  }

  return null;
};

export default class Router extends React.Component<RouterProps> {
  private router: any;

  public constructor(props) {
    super(props);

    const history = createHistory();

    const { store, reducer } = props;

    this.router = createRouter({
      store, reducer,
      history, stateSelector, locationToAction, stateToLocation,
    });
  }

  public render() {
    return <UssRouter router={this.router}>{this.props.children}</UssRouter>;
  }
}

interface RouterProps {
  store: any;
  reducer: any;
}
