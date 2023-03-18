import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import Head from "../../containers/Head";
import '../../epicflow-web/epicflow-web.0.1.0';
import { WEB_BASE_CUSTOM_URL } from '../../constants/constants';

export default function Reports() {
    const dispatch = useDispatch();
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const totalItems = useSelector((state) => state.metrics.totalItems);
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
    const headerList = () => {
        return [
            {
                name: "Metrics",
                count: totalItems,
                onClick: () => dispatch(push(`${redirectUrl}metrics`)),
                icon: "pie-chart",
            },
            {
                name: "Insights",
                onClick: () => dispatch(push(`${redirectUrl}insights`)),
                icon: "lightbulb-o",
            },
            {
                name: "Reports",
                onClick: () => dispatch(push(`${redirectUrl}reports`)),
                icon: "lightbulb-o",
            }
        ];
    };
    return (
        <>
            <div className="container mb-4" id="main">
                <div className="insights mb-2">
                    <div className="row ">
                        <div className="col-12" data-testid="Report">
                            <Head items={headerList()} page="Reports" />
                            <div className='container'>
                                <report-selector-wc
                                    apiurl={WEB_BASE_CUSTOM_URL}>
                                </report-selector-wc>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}