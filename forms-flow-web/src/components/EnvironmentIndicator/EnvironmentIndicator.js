import { APP_ENV } from '../../constants/additionalConstants';
import './EnvironmentIndicator.scss';
import React from "react";

function EnvironmentIndicator(){
    const backgroundColor = APP_ENV.startsWith('test') ? '#5b9f66' : '#c97575';
    const text = `This is ${APP_ENV} environment. 
        The content you are viewing is not final and subject to change`;
    return(
        (!(/^(prod)/i).test(APP_ENV)  && <div className='indicator' style={{backgroundColor:backgroundColor}}>
            {text}
        </div>)
    );
}

export default EnvironmentIndicator;