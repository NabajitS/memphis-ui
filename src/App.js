import './App.scss';
import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Overview from './domain/overview/overview';
import ApplicationList from './domain/applicationList/applicationList';
import ChannelList from './domain/channelList';
import Settings from './domain/settings/settings';
import Users from './domain/users/users';
import Login from './domain/login';
import ChannelDashboard from './domain/channelDashboard/channelDashboard';
import pathControllers from './router';
import PrivateRoute from './PrivateRoute';
import { useMediaQuery } from 'react-responsive';
import AppWrapper from './components/appWrapper/appWrapper';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 850 });
    return isDesktop ? children : null;
};

const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 849 });
    return isMobile ? children : null;
};

const App = withRouter(() => {
    return (
        <div className="app-container">
            <div>
                <Desktop>
                    <Switch>
                        <Route exact path={pathControllers.login} component={Login} />
                        <Route exact path={pathControllers.users}>
                            <AppWrapper
                                content={
                                    <div>
                                        <Users />
                                    </div>
                                }
                            ></AppWrapper>
                        </Route>
                        <Route exact path={pathControllers.overview}>
                            <AppWrapper
                                content={
                                    <div>
                                        <Overview />
                                    </div>
                                }
                            ></AppWrapper>
                        </Route>
                        <Route exact path={pathControllers.settings}>
                            <AppWrapper
                                content={
                                    <div>
                                        <Settings />
                                    </div>
                                }
                            ></AppWrapper>
                        </Route>
                        <Route exact path={pathControllers.applicationList}>
                            <AppWrapper
                                content={
                                    <div>
                                        <ApplicationList />
                                    </div>
                                }
                            ></AppWrapper>
                        </Route>
                        <Route exact path={`${pathControllers.applicationList}/:id`}>
                            <AppWrapper
                                content={
                                    <div>
                                        <ChannelList />
                                    </div>
                                }
                            ></AppWrapper>
                        </Route>
                        <Route exact path={`${pathControllers.applicationList}/:id/:id`}>
                            <AppWrapper
                                content={
                                    <div>
                                        <ChannelDashboard />
                                    </div>
                                }
                            ></AppWrapper>
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
