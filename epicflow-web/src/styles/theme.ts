import { createTheme } from '@mui/material/styles';

const baseTheme = createTheme({
  components: {
    MuiSelect: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small'
      }
    }
  }
})
export default baseTheme;