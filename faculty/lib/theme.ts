import { Theme } from '@mui/material';

export interface ReactJsonViewProps {
  theme: string;
  collapsed?: number | boolean;
  displayDataTypes?: boolean;
  name?: string | null;
  style?: React.CSSProperties;
  iconStyle?: 'circle' | 'triangle' | 'square';
  enableClipboard?: boolean;
  displayObjectSize?: boolean;
}

/**
 * Creates React JSON View props based on the current MUI theme
 */
export const createReactJsonViewPropsFromTheme = (
  theme: Theme,
): ReactJsonViewProps => {
  const isDark = theme.palette.mode === 'dark';

  // Base props
  const props: ReactJsonViewProps = {
    theme: isDark ? 'monokai' : 'rjv-default',
    collapsed: 1,
    displayDataTypes: false,
    name: null,
    enableClipboard: true,
    displayObjectSize: true,
    style: {
      fontSize: '0.875rem',
      fontFamily: theme.typography.fontFamily,
      backgroundColor: 'transparent',
    },
  };

  return props;
};
