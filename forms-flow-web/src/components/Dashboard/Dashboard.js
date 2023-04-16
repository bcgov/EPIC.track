/* eslint-disable no-unused-vars */
import React, { Fragment } from "react";
import { Route, Redirect } from "react-router";
import Head from "../../containers/Head";
import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { METRICS_URL } from '../../constants/additionalConstants';
import { MULTITENANCY_ENABLED } from "../../constants/constants";

const Dashboard = React.memo(() => {
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const headerList = () => {
    return [
      {
        name: "Metrics",
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
    <Fragment>
      <div className="container dashboard_container mb-4" id="main" role="complementary" >
        <div className="dashboard mb-2" >
          <div className="row ">
            <div className="col-12" >
              <Head items={headerList()} page="Metrics" />
              <iframe style={{
                width: "100%",
                height: "auto",
                overflow: "visible",
                border: "none",
                minHeight: "100vh",
              }} src={METRICS_URL} />
            </div>
          </div>
        </div>
      </div>

      <Route path={"/metrics/:notAvailable"}>
        {" "}
        <Redirect exact to="/404" />
      </Route>
    </Fragment >
  );
});

export default Dashboard;