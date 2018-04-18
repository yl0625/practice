import React, { PureComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
import GlobalNav from '../components/GlobalNav';
// router
import routerData from '../common/router';

const RouteWithSubRoutes = route => (
  <Route
    path={route.path}
    render={props => (
      <route.component {...props} routes={route.routes} />
    )}
  />
);

export default class BasicLayout extends PureComponent {
  render() {
    return (
      <div className="container">
        <Switch>
          {routerData.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)}
        </Switch>
        <GlobalNav />
      </div>
    );
  }
}