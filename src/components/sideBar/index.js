import './style.scss';

import React, { useContext, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

import dashboardIconWhite from '../../assets/images/dashboardIconWhite.svg';
import useCaseIconWhite from '../../assets/images/useCaseIconWhite.svg';
import usersIconWhite from '../../assets/images/usersIconWhite.svg';
import dashboardIcon from '../../assets/images/dashboardIcon.svg';
import useCaseIcon from '../../assets/images/useCaseIcon.svg';
import supportIcon from '../../assets/images/supportIcon.svg';
import accountIcon from '../../assets/images/accountIcon.svg';
import logoutIcon from '../../assets/images/logoutIcon.svg';
import usersIcon from '../../assets/images/usersIcon.svg';
import { httpRequest } from '../../services/http';
import { ApiEndpoints } from '../../apiEndpoints';
import Logo from '../../assets/images/logo.png';
import config from '../../config/config.json';
import { Context } from '../../hooks/store';
import pathControllers from '../../router';

const { SubMenu } = Menu;

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 850 });
    return isDesktop ? children : null;
};

function SideBar() {
    const [state, dispatch] = useContext(Context);
    const history = useHistory();
    const botId = 1;
    const [botUrl, SetBotUrl] = useState(require('../../assets/images/bots/1.svg'));

    useEffect(() => {
        setBotImage(botId);
    }, []);

    const setBotImage = (botId) => {
        SetBotUrl(require(`../../assets/images/bots/${botId}.svg`));
    };

    const handleClick = (e) => {
        switch (e.key) {
            case '1':
                history.push(pathControllers.settings);
                break;
            case '2':
                break;
            case '3':
                break;
            default:
                break;
        }
    };

    return (
        <Desktop>
            <div className="sidebar-container">
                <div className="upper-icons">
                    <Link to={pathControllers.overview}>
                        <img src={Logo} width="35" height="35" className="logoimg" alt="logo" />
                    </Link>
                    <div className="item-wrapper">
                        <Link to={pathControllers.overview}>
                            <div className="icon">
                                <div className={state.route === 'overview' ? 'circle-nav-item checked' : 'circle-nav-item'}>
                                    {state.route === 'overview' ? (
                                        <img src={dashboardIcon} alt="dashboardIconIconWhite" width="20" height="20"></img>
                                    ) : (
                                        <img src={dashboardIconWhite} alt="dashboardIconIcon" width="20" height="20"></img>
                                    )}
                                </div>
                            </div>
                        </Link>
                        <p className={state.route === 'overview' ? 'name-checked' : 'name'}>Dashboard</p>
                    </div>
                    <div className="item-wrapper">
                        <Link to={pathControllers.applicationList}>
                            <div className="icon">
                                <div className={state.route === 'applications' ? 'circle-nav-item checked' : 'circle-nav-item'}>
                                    {state.route === 'applications' ? (
                                        <img src={useCaseIcon} alt="useCaseIconWhite" width="20" height="20"></img>
                                    ) : (
                                        <img src={useCaseIconWhite} alt="useCaseIcon" width="20" height="20"></img>
                                    )}
                                </div>
                            </div>
                        </Link>
                        <p className={state.route === 'applications' ? 'name-checked' : 'name'}>Boxes</p>
                    </div>

                    <div className="item-wrapper">
                        <Link to={pathControllers.users}>
                            <div className="icon">
                                <div className={state.route === 'users' ? 'circle-nav-item checked' : 'circle-nav-item'}>
                                    {state.route === 'users' ? (
                                        <img src={usersIcon} alt="usersIconWhite" width="20" height="20"></img>
                                    ) : (
                                        <img src={usersIconWhite} alt="usersIcon" width="20" height="20"></img>
                                    )}
                                </div>
                            </div>
                        </Link>
                        <p className={state.route === 'users' ? 'name-checked' : 'name'}>Users</p>
                    </div>
                </div>
                <div className="bottom-icons">
                    <Menu onClick={handleClick} className="app-menu" mode="vertical" triggerSubMenuAction="click">
                        <SubMenu
                            key="subMenu"
                            icon={
                                <div className="sub-icon-wrapper">
                                    <img src={botUrl} width={25} height={25} alt="bot"></img>
                                </div>
                            }
                        >
                            <Menu.ItemGroup
                                title={
                                    <div className="header-menu">
                                        <div className="company-logo">
                                            <img src={Logo} width="20" height="20" className="logoimg" alt="companyLogo" />
                                        </div>
                                        <p>Tali Pink</p>
                                    </div>
                                }
                            >
                                <Menu.Item key={1} className="customclass">
                                    <div className="item-wrapp">
                                        <img src={accountIcon} width="15" height="15" alt="accountIcon" />
                                        <p>My account</p>
                                    </div>
                                </Menu.Item>
                                <Menu.Item key={2}>
                                    <div className="item-wrapp">
                                        <img src={supportIcon} width="15" height="15" alt="supportIcon" />
                                        <p>Support</p>
                                    </div>
                                </Menu.Item>
                                <Menu.Item key={3}>
                                    <div className="item-wrapp">
                                        <img src={logoutIcon} width="15" height="15" alt="logoutIcon" />
                                        <p>Log out</p>
                                    </div>
                                </Menu.Item>
                            </Menu.ItemGroup>
                        </SubMenu>
                    </Menu>
                </div>
            </div>
        </Desktop>
    );
}

export default SideBar;
