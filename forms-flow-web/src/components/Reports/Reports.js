import React from 'react';
import '../../epicflow-web/epicflow-web.0.1.0';
import { WEB_BASE_CUSTOM_URL } from '../../constants/constants';
export default function Reports() {
    return (
        <div className='container' id='main'>
            <anticipated-eao-schedule-wc apiUrl={WEB_BASE_CUSTOM_URL}></anticipated-eao-schedule-wc>
        </div>
    );
}