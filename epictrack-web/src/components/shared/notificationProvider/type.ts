import { CustomContentProps } from "notistack";
import React from "react";

export interface CustomAction {
  label: string;
  color: any;
  callback: () => any;
}

export interface NotificationOptions {
  type: "success" | "warning" | "error" | "info";
  duration?: number | null;
  message?: string | React.ReactElement;
  actions?: CustomAction[];
  key?: string | number;
}

export interface ETNotificationProps extends CustomContentProps {
  helpText?: string;
  actions?: CustomAction[];
  type: "success" | "warning" | "error" | "info";
}
