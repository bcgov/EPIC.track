import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import '@webcomponents/webcomponentsjs/webcomponents-bundle';
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';
import AnticipatedEAOSchedule from '../components/anticipatedEAOSchedule';
import bootstrap from '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import store from '../store';
export class AnticipatedEAOScheduleWC extends HTMLElement {
    connectedCallback() {
        const mountPoint = document.createElement('div');
        const shadowRoot = this.attachShadow(
            {
                mode: 'closed'
            }
        );
        const style = document.createElement('style');
        style.textContent = bootstrap;
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(mountPoint);
        const apiUrl = this.getAttribute('apiUrl');
        ReactDOM.render(
        <Provider store={store}>
        <AnticipatedEAOSchedule apiUrl={apiUrl}/>
        </Provider>, mountPoint);
    }
}
customElements.define('anticipated-eao-schedule-wc', AnticipatedEAOScheduleWC);