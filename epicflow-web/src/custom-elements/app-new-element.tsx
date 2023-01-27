
import * as React from "react";
import * as ReactDom from "react-dom";
import '@webcomponents/webcomponentsjs/webcomponents-bundle';
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';
import App from "../App";


class AppNewElement extends HTMLElement {
    connectedCallback() {
        const mountPoint = document.createElement("div");
        this.attachShadow({ mode: "open" }).appendChild(mountPoint);

        ReactDom.render(<App/>, mountPoint);

    }
}
customElements.define('app-new-element',AppNewElement);