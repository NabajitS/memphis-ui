// Copyright 2021-2022 The Memphis Authors
// Licensed under the GNU General Public License v3.0 (the “License”);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.gnu.org/licenses/gpl-3.0.en.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an “AS IS” BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import './style.scss';

import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Form } from 'antd';

import { LOCAL_STORAGE_TOKEN } from '../../const/localStorageConsts';
import betaFullLogo from '../../assets/images/betaFullLogo.svg';
import { ApiEndpoints } from '../../const/apiEndpoints';
import sharps from '../../assets/images/sharps.svg';
import { httpRequest } from '../../services/http';
import AuthService from '../../services/auth';
import Button from '../../components/button';
import Loader from '../../components/loader';
import GitHubLogo from '../../assets/images/GitHubLogo.png';
import { Context } from '../../hooks/store';
import Input from '../../components/Input';
import { SOCKET_URL } from '../../config';
import io from 'socket.io-client';
import { gapi } from 'gapi-script';
import { GoogleLogin } from 'react-google-login';
import { sandboxConst } from '../../const/sandboxConst';

const SandboxLogin = (props) => {
    const [state, dispatch] = useContext(Context);
    const history = useHistory();
    const [loginForm] = Form.useForm(); // form controller
    const [formFields, setFormFields] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const referer = props?.location?.state?.referer || '/overview';
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const signinWithGithub = async (code) => {
        try {
            const data = await httpRequest(
                'POST',
                ApiEndpoints.SANDBOX_LOGIN,
                {
                    LoginType: 'github',
                    token: code
                },
                {},
                {},
                false
            );
            AuthService.saveToLocalStorage(data);
            history.push(referer);
        } catch (err) {
            setError(err);
        }
    };

    const handleGithubButtonClick = () => {
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${sandboxConst.GITHUB_CLIENT_ID}&scope=user&redirect_uri=${sandboxConst.GITHUB_REDIRECT_URI}`;
    };

    useEffect(() => {
        if (localStorage.getItem(LOCAL_STORAGE_TOKEN) && AuthService.isValidToken()) {
            history.push(referer);
        }
        const url = window.location.href;
        const shouldSigninWithGithub = url.includes('?code=');
        const splittedUrl = url.split('?code=');
        window.history.pushState({}, null, splittedUrl[0]);
        if (shouldSigninWithGithub) {
            if (splittedUrl.length > 1) {
                signinWithGithub(`${splittedUrl[1]}`);
            } else {
                setError('Authentication with GitHub failed');
            }
        }
        function start() {
            gapi.client.init({
                clientId: sandboxConst.GOOGLE_CLIENT_ID,
                scope: 'email'
            });
        }
        gapi.load('client:auth2', start);
    }, []);

    const handleUserNameChange = (e) => {
        setFormFields({ ...formFields, username: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setFormFields({ ...formFields, password: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const values = await loginForm.validateFields();
        if (values?.errorFields) {
            return;
        } else {
            try {
                setLoadingSubmit(true);
                const { username, password } = formFields;
                const data = await httpRequest('POST', ApiEndpoints.LOGIN, { username, password }, {}, {}, false);
                if (data) {
                    AuthService.saveToLocalStorage(data);
                    const socket = await io.connect(SOCKET_URL, {
                        path: '/api/socket.io',
                        query: {
                            authorization: data.jwt
                        },
                        reconnection: false
                    });
                    dispatch({ type: 'SET_USER_DATA', payload: data });
                    dispatch({ type: 'SET_SOCKET_DETAILS', payload: socket });
                    history.push(referer);
                }
            } catch (err) {
                setError(err);
            }
            setLoadingSubmit(false);
        }
    };

    const handleGoogleSignin = async (googleData) => {
        try {
            const data = await httpRequest(
                'POST',
                ApiEndpoints.SANDBOX_LOGIN,
                {
                    loginType: 'google',
                    token: googleData.tokenId
                },
                {},
                {},
                false
            );
            AuthService.saveToLocalStorage(data);
            history.push(referer);
        } catch (err) {
            setError(err);
        }
    };

    const layout = {
        labelCol: {
            span: 8
        },
        wrapperCol: {
            span: 16
        }
    };

    const tailLayout = {
        wrapperCol: {
            offset: 8,
            span: 16
        }
    };

    return (
        <section className="sandbox-containers">
            {state.loading ? <Loader></Loader> : ''}

            <div className="desktop-container">
                <div className="desktop-content">
                    <div className="logoImg">
                        <img alt="logo" src={betaFullLogo}></img>
                    </div>
                    <content is="x3d">
                        <div className="title">
                            <p>Hey Memphiser,</p>
                            <p>Let's try us</p>
                        </div>
                        <div className="login-container">
                            <div>
                                <div className="google-pad">
                                    <GoogleLogin
                                        clientId={sandboxConst.GOOGLE_CLIENT_ID}
                                        className="google-login-button"
                                        buttonText="Sign in with Google"
                                        onSuccess={handleGoogleSignin}
                                        onFailure={handleGoogleSignin}
                                        cookiePolicy={'single_host_origin'}
                                    />
                                    <button type="button" className="github-login-button" onClick={handleGithubButtonClick}>
                                        <img src={GitHubLogo} alt="git" className="git-image"></img>
                                        Sign in with GitHub
                                    </button>
                                </div>
                            </div>
                            <or is="x3d">
                                <span>or</span>
                            </or>
                            <div className="login-form">
                                <Form
                                    {...layout}
                                    name="basic"
                                    initialValues={{
                                        remember: true
                                    }}
                                    form={loginForm}
                                >
                                    <Form.Item
                                        name="username"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Username can not be empty'
                                            }
                                        ]}
                                    >
                                        <div className="field name">
                                            <p>Username</p>
                                            <Input
                                                placeholder="Type username"
                                                type="text"
                                                radiusType="semi-round"
                                                colorType="gray"
                                                backgroundColorType="none"
                                                borderColorType="gray"
                                                width="19vw"
                                                height="43px"
                                                minWidth="200px"
                                                onBlur={handleUserNameChange}
                                                onChange={handleUserNameChange}
                                                value={formFields.username}
                                            />
                                        </div>
                                    </Form.Item>
                                    <Form.Item
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Password can not be empty'
                                            }
                                        ]}
                                    >
                                        <div className="field password">
                                            <p>Password</p>
                                            <div id="e2e-tests-password">
                                                <Input
                                                    placeholder="Password"
                                                    type="password"
                                                    radiusType="semi-round"
                                                    colorType="gray"
                                                    backgroundColorType="none"
                                                    borderColorType="gray"
                                                    width="19vw"
                                                    height="43px"
                                                    minWidth="200px"
                                                    onChange={handlePasswordChange}
                                                    onBlur={handlePasswordChange}
                                                    value={formFields.password}
                                                />
                                            </div>
                                        </div>
                                    </Form.Item>
                                    <Form.Item {...tailLayout} className="button-container">
                                        <Button
                                            width="19vw"
                                            height="43px"
                                            minWidth="200px"
                                            placeholder="Sign in"
                                            colorType="white"
                                            radiusType="circle"
                                            backgroundColorType="purple"
                                            fontSize="12px"
                                            fontWeight="600"
                                            isLoading={loadingSubmit}
                                            onClick={handleSubmit}
                                        />
                                    </Form.Item>

                                    {error && (
                                        <div className="error-message">
                                            <p>The username and password you entered did not match our records. Please double-check and try again.</p>
                                        </div>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </content>
                </div>
                <div className="brand-shapes">
                    <img alt="sharps" src={sharps}></img>
                </div>
            </div>
        </section>
    );
};

export default SandboxLogin;
