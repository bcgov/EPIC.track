import { SnackbarMessage, enqueueSnackbar } from "notistack";
import { CustomAction, NotificationOptions } from "./type";
import React from "react";

export const showNotification = (
  title: SnackbarMessage,
  options: NotificationOptions
) => {
  /**
   * Shows a notification
   * Args:
   * - The title message for the notification
   * - options
   *   - type - success | warning | info | error  - Required
   *   - duration - time in milliseconds the notification must be shown. Default 2000. Set to null to prevent from auto hiding.
   *   - message - Optional-  Additional info to be shown in the notification. String.
   *   - actions - Optional - Action buttons to be shown at notification bottom.
   *     - label - Label string for the button
   *     - color - A valid Mui Button color option
   *     - action - A callback function to be called on click.
   * Example Usage:
   *  1.showNotification("Example notification", {
   *        type: "success",
   *    });
   *  2. showNotification("Example notification with notes", {
   *        type: "info",
   *        duration: 3000,  // Show for 3 seconds
   *        message: "Some helpful notes!",
   *    });
   *  3. showNotification("A notification with action", {
   *        type: "success",
   *        message: "Some error have happened",
   *        duration: null, // Force user interaction.
   *        actions: [
   *            {
   *            label: "Rectify",
   *             color: "primary",
   *             callback: () =>
   *                 showNotification("Error Rectified", {
   *                    type: "success",
   *                 }),
   *             }],
   *         });
   */

  return enqueueSnackbar(title, {
    variant: "etNotification",
    type: options.type,
    autoHideDuration: options.duration !== undefined ? options.duration : 2000,
    helpText: options.message,
    actions: options.actions,
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "right",
    },
    persist: Boolean(options.actions),
    key: options.key,
  });
};

// To add typescript support for the custom notification component and additional props
declare module "notistack" {
  interface VariantOverrides {
    etNotification: {
      type: string;
      helpText?: string | React.ReactElement;
      actions?: CustomAction[];
    };
  }
}
