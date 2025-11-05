import '@/locales';
import 'antd/dist/reset.css';

import React from 'react';
import {createRoot} from 'react-dom/client';

import {worker} from './__test__/mocks';
import App from './entries/App';

const container = document.getElementById('root');
const root = createRoot(container!);

const enableMocking = async () => {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }

    return worker.start();
};
enableMocking().then(() => {
    root.render(<App />);
});
