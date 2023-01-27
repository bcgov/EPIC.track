

import React from 'react';
import ReactDOM from "react-dom/client";
import '@webcomponents/webcomponentsjs/webcomponents-bundle';
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import {
    StyledEngineProvider,
    createTheme,
    ThemeProvider
} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { create } from 'jss'
import { StylesProvider, jssPreset } from '@mui/styles';
import App from "../App";

const styles = require('../App.scss');

export default class AppElement extends HTMLElement {
    connectedCallback() {
        // const theme = {
        //     background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        //   };
        // const mountPoint = document.createElement("div");
        // const style = document.createElement('style');
        // const emotionRoot = document.createElement('style');
        // style.textContent = styles.default;
        // const shadowRoot = this.attachShadow({ mode: "open" });
        // shadowRoot.appendChild(style);
        // const reactRoot = shadowRoot.appendChild(mountPoint);
        // const jss = create({
        //     ...jssPreset(),
        //     insertionPoint: reactRoot
        //   });
        //   const cache = createCache({
        //     key: 'css',
        //     prepend: true,
        //     container: emotionRoot,
        //  });
        //   const portalContainer = reactRoot.appendChild(
        //     document.createElement("div")
        //   );
        // // ReactDom.render(
        // //     <React.StrictMode>
        // //         <StylesProvider jss={jss}>
        // //     <CacheProvider  value={cache}>
        // //         <ThemeProvider theme={theme}>
        // //             <App />
        // //         </ThemeProvider>
        // //         </CacheProvider>
        // //         </StylesProvider>
        // //     </React.StrictMode>
        // //     , mountPoint);
        // ReactDOM.createRoot(mountPoint).render(
        //     <StylesProvider jss={jss}>
        //     <CacheProvider value={cache}>
        //         <App />
        //     </CacheProvider></StylesProvider>
        // );
        const shadowContainer = this.attachShadow({ mode: "open" });
        const emotionRoot = document.createElement("style");
        const shadowRootElement = document.createElement("div");
        shadowContainer.appendChild(emotionRoot);
        shadowContainer.appendChild(shadowRootElement);

        const cache = createCache({
            key: "css",
            prepend: true,
            container: emotionRoot
        });

        // const shadowTheme = createTheme({
        //     components: {
        //         MuiPopover: {
        //             defaultProps: {
        //                 container: shadowRootElement
        //             }
        //         },
        //         MuiPopper: {
        //             defaultProps: {
        //                 container: shadowRootElement
        //             }
        //         },
        //         MuiModal: {
        //             defaultProps: {
        //                 container: shadowRootElement
        //             }
        //         }
        //     }
        // });
        const shadowTheme = createTheme({})

        ReactDOM.createRoot(shadowRootElement).render(
            <React.StrictMode>
                <CacheProvider value={cache}>
                    <ThemeProvider theme={shadowTheme}>
                        <Typography>Shadow DOM</Typography>
                        <App />
                    </ThemeProvider>
                </CacheProvider>
            </React.StrictMode>
        );

    }
}
customElements.define('app-element', AppElement);