import './style.scss';

import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom';
import React, { useEffect } from 'react';

import reportWebVitals from './reportWebVitals';
import Store from './hooks/store';
import App from './App';

function MemphisApp() {
    return (
        <Store>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Store>
    );
}
ReactDOM.render(<MemphisApp />, document.getElementById('root'));

reportWebVitals();
