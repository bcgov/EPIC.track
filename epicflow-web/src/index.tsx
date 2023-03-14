import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './components/App';
import { ThemeProvider } from '@mui/material/styles';
import baseTheme from './styles/theme';
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <Provider store={store}>
        <ThemeProvider theme={baseTheme}>
            <App />
        </ThemeProvider>
    </Provider>
);
