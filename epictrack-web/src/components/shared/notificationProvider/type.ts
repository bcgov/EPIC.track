import { CustomContentProps } from "notistack";

export interface CustomAction {
  label: string;
  color: any;
  callback: () => any;
}

export interface NotificationOptions {
  type: "success" | "warning" | "error" | "info";
  duration?: number | null;
  message?: string;
  actions?: CustomAction[];
}

export interface StyleProps {
  drawerWidth: number;
}

export interface ETNotificationProps extends CustomContentProps {
  helpText?: string;
  actions?: CustomAction[];
  type: "success" | "warning" | "error" | "info";
}
