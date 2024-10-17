import React, { cloneElement } from "react";
import { useAppSelector } from "../../../hooks";

interface HasPermissionProps {
  roles: string[];
  allowed: string[];
}
export const hasPermission = ({ roles, allowed }: HasPermissionProps) => {
  const allowedMap: { [scope: string]: boolean } = {};

  allowed.forEach((allowedGroup) => {
    allowedMap[allowedGroup] = true;
  });

  return roles.some((group) => allowedMap[group]);
};

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RestrictedProps {
  children: React.ReactElement<any, any>;
  RenderError?: () => React.ReactElement<any, any>;
  errorProps?: any;
  exception?: boolean;
  allowed: string[];
}
export function Restricted({
  children,
  RenderError,
  errorProps,
  exception = false,
  allowed = [],
}: RestrictedProps): React.ReactElement<any, any> {
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const permissionGranted = exception || hasPermission({ roles, allowed });

  if (!permissionGranted && !errorProps && RenderError) return <RenderError />;

  if (!permissionGranted && errorProps)
    return cloneElement(children, { ...errorProps });

  if (!permissionGranted) return <></>;

  return <>{children}</>;
}
/* eslint-enable */
