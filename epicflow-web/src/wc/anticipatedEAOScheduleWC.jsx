import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AnticipatedEAOSchedule from '../components/anticipatedEAOSchedule';
import bootstrap from '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import store from '../store';
export class AnticipatedEAOScheduleWC extends HTMLElement {
    connectedCallback() {
        const mountPoint = document.createElement('div');
        const shadowRoot = this.attachShadow(
            {
                mode: 'open'
            }
        );
        const style = document.createElement('style');
        style.textContent = bootstrap;
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(mountPoint);
        ReactDOM.render(
        <Provider store={store}>
        <AnticipatedEAOSchedule />
        </Provider>, mountPoint);
    }
}
customElements.define('anticipated-eao-schedule-wc', AnticipatedEAOScheduleWC);