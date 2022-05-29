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

import React, { useEffect, useContext, useState, useRef } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import CircularProgress from '@material-ui/core/CircularProgress';
import EditOutlined from '@material-ui/icons/EditOutlined';
import { useHistory } from 'react-router-dom';

import CreateStationDetails from '../../components/createStationDetails';
import { ApiEndpoints } from '../../const/apiEndpoints';
import StationBoxOverview from './stationBoxOverview';
import emptyList from '../../assets/images/emptyList.svg';
import { httpRequest } from '../../services/http';
import Button from '../../components/button';
import { Context } from '../../hooks/store';
import Modal from '../../components/modal';
import pathDomains from '../../router';
import Loader from '../../components/loader';

const StationsList = () => {
    const [state, dispatch] = useContext(Context);
    const [editName, seteditName] = useState(false);
    const [editDescription, seteditDescription] = useState(false);
    const [modalIsOpen, modalFlip] = useState(false);
    const [factoryDetails, setFactoryDetails] = useState();
    const [factoryName, setFactoryName] = useState('');
    const [factoryDescription, setFactoryDescription] = useState('');
    const [isLoading, setisLoading] = useState(false);
    const createStationRef = useRef(null);
    const [parseDate, setParseDate] = useState(new Date().toLocaleDateString());
    const botId = 1;
    const [botUrl, SetBotUrl] = useState('');
    const history = useHistory();

    useEffect(() => {
        dispatch({ type: 'SET_ROUTE', payload: 'factories' });
        getFactoryDetails();
    }, []);

    const setBotImage = (botId) => {
        SetBotUrl(require(`../../assets/images/bots/${botId}.svg`));
    };

    const getFactoryDetails = async () => {
        const url = window.location.href;
        const factoryName = url.split('factories/')[1].split('/')[0];
        setisLoading(true);
        try {
            const data = await httpRequest('GET', `${ApiEndpoints.GEL_FACTORIES}?factory_name=${factoryName}`);
            setBotImage(data.user_avatar_id || botId);
            setParseDate(new Date(data.creation_date).toLocaleDateString());
            setFactoryDetails(data);
            setFactoryName(data.name);
            setFactoryDescription(data.description);
        } catch (err) {}
        setisLoading(false);
    };

    const handleEditName = () => {
        seteditName(true);
    };

    const handleEditDescription = () => {
        seteditDescription(true);
    };

    const handleEditNameBlur = async (e) => {
        if (!e.target.value) {
            seteditName(false);
        } else {
            try {
                await httpRequest('PUT', ApiEndpoints.EDIT_FACTORY, {
                    factory_name: factoryDetails.name,
                    factory_new_name: e.target.value,
                    factory_new_description: factoryDetails.description
                });
                setFactoryDetails({ ...factoryDetails, name: e.target.value });
                seteditName(false);
                history.push(`${pathDomains.factoriesList}/${e.target.value}`);
            } catch (err) {
                setFactoryName(factoryDetails.name);
            }
        }
    };

    const handleEditNameChange = (e) => {
        setFactoryName(e.target.value);
    };

    const handleEditDescriptionBlur = async (e) => {
        if (!e.target.value) {
            seteditDescription(false);
        } else {
            try {
                await httpRequest('PUT', ApiEndpoints.EDIT_FACTORY, {
                    factory_name: factoryDetails.name,
                    factory_new_name: factoryDetails.name,
                    factory_new_description: e.target.value
                });
                setFactoryDetails({ ...factoryDetails, description: e.target.value });
                seteditDescription(false);
            } catch (err) {
                setFactoryDescription(factoryDetails.description);
            }
        }
    };

    const handleEditDescriptionChange = (e) => {
        setFactoryDescription(e.target.value);
    };

    const removeStation = async (stationName) => {
        const updatedStationList = factoryDetails?.stations.filter((item) => item.name !== stationName);
        setFactoryDetails({ ...factoryDetails, stations: updatedStationList });
    };

    return (
        <div className="factory-details-container">
            <div className="factory-details-header">
                <div className="left-side">
                    {!editName && (
                        <h1 className="main-header-h1">
                            {!isLoading ? factoryName || 'Insert Factory name' : <CircularProgress className="circular-progress" size={18} />}
                            <span id="e2e-tests-edit-name" className="edit-icon" onClick={() => handleEditName()}>
                                <EditOutlined />
                            </span>
                        </h1>
                    )}
                    {editName && (
                        <ClickAwayListener onClickAway={handleEditNameBlur}>
                            <div className="edit-input-name">
                                <input onBlur={handleEditNameBlur} onChange={handleEditNameChange} value={factoryName} />
                            </div>
                        </ClickAwayListener>
                    )}
                    {!editDescription && (
                        <div className="description">
                            {!isLoading ? <p>{factoryDescription || 'Insert your description...'}</p> : <CircularProgress className="circular-progress" size={12} />}
                            <span id="e2e-tests-edit-description" className="edit-icon" onClick={() => handleEditDescription()}>
                                <EditOutlined />
                            </span>
                        </div>
                    )}
                    {editDescription && (
                        <ClickAwayListener onClickAway={handleEditDescriptionBlur}>
                            <div id="e2e-tests-insert-description">
                                <textarea onBlur={handleEditDescriptionBlur} onChange={handleEditDescriptionChange} value={factoryDescription} />
                            </div>
                        </ClickAwayListener>
                    )}
                    {!isLoading ? (
                        <div className="factory-owner">
                            <div className="user-avatar">
                                <img src={botUrl} width={25} height={25} alt="bot"></img>
                            </div>
                            <div className="user-details">
                                <p>{factoryDetails?.created_by_user}</p>
                                <span>{parseDate}</span>
                            </div>
                        </div>
                    ) : (
                        <CircularProgress className="circular-progress" size={18} />
                    )}

                    <div className="factories-length">
                        <h1>Stations ({factoryDetails?.stations?.length || 0})</h1>
                    </div>
                </div>
                <div className="right-side">
                    <Button
                        className="modal-btn"
                        width="150px"
                        height="36px"
                        placeholder="Create a station"
                        colorType="white"
                        radiusType="circle"
                        backgroundColorType="purple"
                        fontSize="14px"
                        fontWeight="bold"
                        aria-controls="usecse-menu"
                        aria-haspopup="true"
                        onClick={() => modalFlip(true)}
                    />
                </div>
            </div>
            <div className="stations-content">
                {isLoading && (
                    <div className="loader-uploading">
                        <Loader />
                    </div>
                )}
                {factoryDetails?.stations?.length > 0 &&
                    factoryDetails?.stations?.map((station, key) => (
                        <StationBoxOverview key={station.id} station={station} removeStation={() => removeStation(station.name)} />
                    ))}
                {!isLoading && factoryDetails?.stations.length === 0 && (
                    <div className="no-station-to-display">
                        <img src={emptyList} width="100" height="100" alt="emptyList" />
                        <p>There are no stations yet</p>
                        <p className="sub-title">Get started by creating a station</p>
                        <Button
                            className="modal-btn"
                            width="240px"
                            height="50px"
                            placeholder="Create your first station"
                            colorType="white"
                            radiusType="circle"
                            backgroundColorType="purple"
                            fontSize="12px"
                            fontWeight="600"
                            aria-controls="usecse-menu"
                            aria-haspopup="true"
                            onClick={() => modalFlip(true)}
                        />
                    </div>
                )}
            </div>
            <Modal
                header="Your station details"
                minHeight="590px"
                minWidth="500px"
                rBtnText="Add"
                lBtnText="Cancel"
                closeAction={() => modalFlip(false)}
                lBtnClick={() => {
                    modalFlip(false);
                }}
                clickOutside={() => modalFlip(false)}
                rBtnClick={() => {
                    createStationRef.current();
                }}
                open={modalIsOpen}
            >
                <CreateStationDetails createStationRef={createStationRef} factoryName={factoryName} />
            </Modal>
        </div>
    );
};

export default StationsList;
