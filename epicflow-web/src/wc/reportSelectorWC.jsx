import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import bootstrap from '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import ReportSelector from '../components/reportSelector';
import store from '../store';
import bootstrapScss from '../App.styles.scss';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

export class ReportSelectorWC extends HTMLElement {
    createCache() {
        return createCache({
            container: this.shadowRoot,
            key: 'test',
            prepend: false,
        });
    }

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
        const cache = this.createCache();

        ReactDOM.render(
            <Provider store={store}>
                <CacheProvider value={cache}>
                    <ReportSelector apiUrl={apiUrl} />
                </CacheProvider>
            </Provider>, mountPoint);
    }
}
customElements.define('report-selector-wc', ReportSelectorWC);