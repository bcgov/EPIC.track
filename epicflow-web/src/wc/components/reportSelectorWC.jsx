import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import ReportSelector from '../../components/reportSelector';
import { store } from '../../store';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import createCache from '@emotion/cache';
import createWcTheme from '../styles/wcTheme';
import WCBaseELement from './wcBase';

export class ReportSelectorWC extends WCBaseELement {
    constructor() {
        super(ReportSelector);
    }
}
customElements.define('report-selector-wc', ReportSelectorWC);