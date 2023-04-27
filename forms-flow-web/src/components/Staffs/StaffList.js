import React from 'react';
import '../../epicflow-web/epicflow-web.0.1.0';
import { WEB_BASE_CUSTOM_URL } from '../../constants/constants';

export default function StaffList() {
    return (
        <>
        <div className="container mb-4" id="main">
            <div className="insights mb-2">
                <div className="row ">
                    <div className="col-12" data-testid="Report">
                        <div className='container'>
                            <staff-list-wc
                                apiurl={WEB_BASE_CUSTOM_URL}>
                            </staff-list-wc>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}