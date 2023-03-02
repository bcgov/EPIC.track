import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import bootstrap from '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import ReportSelector from '../components/reportSelector';
import store from '../store';
import bootstrapScss from '../App.styles.scss';

export class ReportSelectorWC extends HTMLElement {
    connectedCallback() {
        const mountPoint = document.createElement('div');
        const shadowRoot = this.attachShadow(
            {
                mode: 'open'
            }
        );
        const style = document.createElement('style');
        style.textContent = bootstrapScss;
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(mountPoint);
        const apiUrl = this.getAttribute('apiUrl');
        ReactDOM.render(
            <Provider store={store}>
                <ReportSelector apiUrl={apiUrl} />
            </Provider>, mountPoint);
    }
}
customElements.define('report-selector-wc', ReportSelectorWC);