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

import React, { useContext, useEffect } from 'react';
import { CODE_PRODUCE_GO, CODE_PRODUCE_JAVASCRIPT, CODE_PRODUCE_PYTHON } from '../../../../const/SDKExample';
import WaitingProduceData from '../../../../assets/images/waitingProduceData.svg';
import ProduceConsumeData from '../produceConsumeData';
import { GetStartedStoreContext } from '..';

const ProduceData = (props) => {
    const { createStationFormRef } = props;
    const [getStartedState, getStartedDispatch] = useContext(GetStartedStoreContext);
    const host = process.env.REACT_APP_SANDBOX_ENV ? 'broker.sandbox.memphis.dev' : 'localhost';

    const languagesOptions = {
        Go: {
            name: 'Go',
            language: 'go',
            value: CODE_PRODUCE_GO.replace('<username>', getStartedState?.username)
                .replace('<memphis_host>', host)
                .replace('<connection_token>', getStartedState?.connectionCreds)
                .replace('<station_name>', getStartedState?.stationName)
        },
        // Python: {
        //     name: 'Python',
        //     language: 'python',
        //     value: CODE_PRODUCE_PYTHON.replace('<username>', getStartedState?.username)
        //         .replace('<memphis_host>', host)
        //         .replace('<connection_token>', getStartedState?.connectionCreds)
        //         .replace('<station_name>', getStartedState?.stationName)
        // },
        'Node.js': {
            name: 'Node.js',
            language: 'javascript',
            value: CODE_PRODUCE_JAVASCRIPT.replace('<username>', getStartedState?.username)
                .replace('<memphis_host>', host)
                .replace('<connection_token>', getStartedState?.connectionCreds)
                .replace('<station_name>', getStartedState?.stationName)
        }
    };

    const onNext = () => {
        getStartedDispatch({ type: 'SET_CURRENT_STEP', payload: getStartedState?.currentStep + 1 });
    };

    useEffect(() => {
        createStationFormRef.current = onNext;
    }, []);

    return (
        <ProduceConsumeData
            waitingImage={WaitingProduceData}
            waitingTitle={'We are waiting for produced data'}
            successfullTitle={'Successfully received'}
            languagesOptions={languagesOptions}
            activeData={'connected_producers'}
            dataName={'producer_app'}
        ></ProduceConsumeData>
    );
};

export default ProduceData;
