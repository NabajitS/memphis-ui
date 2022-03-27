import './App.scss';

import { Switch, Route, withRouter } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import React, { useEffect } from 'react';

import StationOverview from './domain/stationOverview';
import FactoriesList from './domain/factoriesList';
import AppWrapper from './components/appWrapper';
import StationsList from './domain/stationsList';
import PrivateRoute from './PrivateRoute';
import Overview from './domain/overview';
import Settings from './domain/settings';
import pathControllers from './router';
import Users from './domain/users';
import Login from './domain/login';
import { Redirect } from 'react-router-dom';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 850 });
    return isDesktop ? children : null;
};

const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 849 });
    return isMobile ? children : null;
};

const App = withRouter(() => {
    useEffect(() => {});
    return (
        <div className="app-container">
            <div>
                <Desktop>
                    <Switch>
                        <Route exact path={pathControllers.login} component={Login} />
                        <PrivateRoute exact path="/">
                            <Redirect to={pathControllers.overview} />
                        </PrivateRoute>
                        <PrivateRoute exact path={pathControllers.overview}>
                            <AppWrapper
                                content={
                                    <div>
                                        <Overview />
                                    </div>
                                }
                            ></AppWrapper>
                        </PrivateRoute>
                        <PrivateRoute exact path={pathControllers.users}>
                            <AppWrapper
                                content={
                                    <div>
                                        <Users />
                                    </div>
                                }
                            ></AppWrapper>
                        </PrivateRoute>
                        <PrivateRoute exact path={pathControllers.settings}>
                            <AppWrapper
                                content={
                                    <div>
                                        <Settings />
                                    </div>
                                }
                            ></AppWrapper>
                        </PrivateRoute>
                        <PrivateRoute exact path={pathControllers.factoriesList}>
                            <AppWrapper
                                content={
                                    <div>
                                        <FactoriesList />
                                    </div>
                                }
                            ></AppWrapper>
                        </PrivateRoute>
                        <PrivateRoute exact path={`${pathControllers.factoriesList}/:id`}>
                            <AppWrapper
                                content={
                                    <div>
                                        <StationsList />
                                    </div>
                                }
                            ></AppWrapper>
                        </PrivateRoute>
                        <PrivateRoute exact path={`${pathControllers.factoriesList}/:id/:id`}>
                            <AppWrapper
                                content={
                                    <div>
                                        <StationOverview />
                                    </div>
                                }
                            ></AppWrapper>
                        </PrivateRoute>
                        <Route>
                            <Redirect to={pathControllers.overview} />
                        </Route>

                        {/* <PrivateRoute exact path="/" component={Overview} />
            <PrivateRoute exact path={pathControllers.overview} component={Overview} />
            <PrivateRoute exact path={`${pathControllers.usecases}/:id`} component={UseCaseEditor} />
            <PrivateRoute exact path={pathControllers.users} component={Users} />
            <PrivateRoute exact path={pathControllers.account} component={Account} /> */}
                        {/* <Route component={NotFoundPage} /> */}
                    </Switch>
                </Desktop>
                {/* <Mobile>
          <Switch>
            <Route exact path={pathControllers.login} component={Login} />
            <PrivateRoute exact path="/" component={Overview} />
            <PrivateRoute exact path={pathControllers.overview} component={Overview} />
            <PrivateRoute exact path={pathControllers.usecases} component={Overview} />
            <PrivateRoute exact path={`${pathControllers.usecases}/:id`} component={Overview} />
            <PrivateRoute exact path={pathControllers.users} component={Overview} />
            <PrivateRoute exact path={pathControllers.account} component={Overview} />
            <Route component={NotFoundPage} />
          </Switch>
        </Mobile> */}
            </div>
        </div>
    );
});

export default App;
