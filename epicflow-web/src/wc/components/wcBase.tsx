import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import createWcTheme from '../styles/wcTheme';
import { createTheme } from '@mui/material';
import { store } from '../../store';

class WCBaseELement extends HTMLElement {
    ComponentToMount: React.ComponentType;
    constructor(componentToMount: React.ComponentType) {
        super();
        this.ComponentToMount = componentToMount;
    }
    connectedCallback() {
        const ComponentToMount: React.ComponentType = this.ComponentToMount;
        const shadowContainer = this.attachShadow({ mode: 'open' });
        const emotionRoot = document.createElement('style');
        const shadowRootElement = document.createElement('div');
        shadowContainer.appendChild(emotionRoot);
        shadowContainer.appendChild(shadowRootElement);

        const cache = createCache({
            key: 'css',
            prepend: true,
            container: emotionRoot,
        });
        const shadowTheme = createWcTheme(shadowRootElement);
        console.log(shadowTheme);
        const props = {
            ...this.getProps(this.attributes),
            ...this.getEvents()
        };
        ReactDOM.createRoot(shadowRootElement).render(
            <React.StrictMode>
                <Provider store={store}>
                    <CacheProvider value={cache}>
                        <ThemeProvider theme={shadowTheme}>
                            <ComponentToMount {...props} />
                        </ThemeProvider>
                    </CacheProvider>
                </Provider>
            </React.StrictMode>
        );
    }

    getProps(attributes: any) {
        return [...attributes]
            .filter(attr => attr.name !== 'style')
            .map(attr => this.convert(attr.name, attr.value))
            .reduce((props, prop) =>
                ({ ...props, [prop.name]: prop.value }), {});
    }
    getEvents() {
        return Object.values(this.attributes)
            .filter(key => /on([a-z].*)/.exec(key.name))
            .reduce((events, ev) => ({
                ...events,
                [ev.name]: (args: any) =>
                    this.dispatchEvent(new CustomEvent(ev.name, { ...args }))
            }), {});
    }
    convert(attrName: any, attrValue: any) {
        let value = attrValue;
        if (attrValue === 'true' || attrValue === 'false')
            value = attrValue === 'true';
        else if (!isNaN(attrValue) && attrValue !== '')
            value = +attrValue;
        else if (/^{.*}/.exec(attrValue))
            value = JSON.parse(attrValue);
        return {
            name: attrName,
            value: value
        };
    }
}

export default WCBaseELement;