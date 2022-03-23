import './style.scss';

import React, { useState, useContext, useEffect } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { Link, Redirect } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import { InboxOutlined } from '@ant-design/icons';
import Popover from '@material-ui/core/Popover';
import EditIcon from '@material-ui/icons/Edit';
import { Divider } from '@material-ui/core';

import OverflowTip from '../../../components/tooltip/overflowtip';
import Tooltip from '../../../components/tooltip/tooltip';
import loading from '../../../assets/images/strech.gif';
import Button from '../../../components/button';
import { httpRequest } from '../../../services/http';
import { ApiEndpoints } from '../../../const/apiEndpoints';
import Modal from '../../../components/modal';
import { Context } from '../../../hooks/store';
import pathControllers from '../../../router';

const Application = (props) => {
    const [state, dispatch] = useContext(Context);
    const [modalIsOpen, modalFlip] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClickMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const removeApplication = async () => {
        try {
            await httpRequest('DELETE', ApiEndpoints.REMOVE_APPLICATION, {
                application_name: props.content.name
            });
            props.removeApplication();
        } catch (err) {}
    };

    return (
        <div className="application">
            <div className="application-card-container" key={props.content.id}>
                <Link to={`${pathControllers.applicationsList}/${props.content.name}`}>
                    <div className="application-card-title">
                        <h2>
                            <OverflowTip text={props.content.name} width={'220px'} color="white" cursor="pointer">
                                {props.content.name}
                            </OverflowTip>
                        </h2>
                        <div>
                            <MoreVertIcon
                                aria-controls="long-button"
                                aria-haspopup="true"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleClickMenu(e);
                                }}
                                className="threedots-menu"
                            />
                        </div>
                    </div>
                </Link>

                <div className="application-card-description">
                    <p>{props.content.description || 'Empty description'}</p>
                </div>
                <Popover id="long-menu" classes={{ paper: 'Menu' }} anchorEl={anchorEl} onClose={handleCloseMenu} open={open}>
                    <Link to={`${pathControllers.applicationList}/${props.content._id}`}>
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                            }}
                        >
                            <EditIcon style={{ fontSize: 14 }} className="menu-item-icon" />
                            <label className="menu-item-label">Edit</label>
                        </MenuItem>
                    </Link>
                    <Divider />
                    <MenuItem
                        onClick={() => {
                            modalFlip(true);
                            handleCloseMenu();
                        }}
                    >
                        <DeleteIcon style={{ fontSize: 14 }} className="menu-item-icon" />
                        <label className="menu-item-label">Remove</label>
                    </MenuItem>
                </Popover>
            </div>
            <Modal
                header="Remove Application"
                height="300px"
                width="650px"
                rBtnText="Confirm"
                lBtnText="Cancel"
                closeAction={() => modalFlip(false)}
                lBtnClick={() => {
                    modalFlip(false);
                }}
                clickOutside={() => modalFlip(false)}
                rBtnClick={() => {
                    modalFlip(false);
                    removeApplication();
                }}
                open={modalIsOpen}
            >
                Are you sure you want to remove this application? This will remove all factories in this application.
            </Modal>
        </div>
    );
};

export default Application;
