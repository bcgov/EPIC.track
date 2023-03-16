import { createTheme } from '@mui/material';
import baseTheme from '../../styles/theme';

export default function createWcTheme(shadowRoot: HTMLElement) {
  const wcTheme = createTheme(baseTheme, {
    components: {
      MuiPopover: {
        defaultProps: {
          container: shadowRoot,
        },
      },
      MuiPopper: {
        defaultProps: {
          container: shadowRoot,
        },
      },
      MuiModal: {
        defaultProps: {
          container: shadowRoot,
        },
      }
    }
  });
  return wcTheme;
}
