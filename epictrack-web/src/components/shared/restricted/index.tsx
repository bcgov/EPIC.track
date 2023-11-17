import React, { cloneElement } from "react";
import { useAppSelector } from "../../../hooks";

interface HasPermissionProps {
  groups: string[];
  allowed: string[];
}
const hasPermission = ({ groups, allowed }: HasPermissionProps) => {
  const allowedMap: { [scope: string]: boolean } = {};

  allowed.forEach((allowedGroup) => {
    allowedMap[allowedGroup] = true;
  });

  return groups.some((group) => allowedMap[group]);
};

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RestrictedProps {
  children: React.ReactElement<any, any>;
  RenderError?: () => React.ReactElement<any, any>;
  errorProps?: any;
  allowed: string[];
}
export function Restricted({
  children,
  RenderError,
  errorProps,
  allowed = [],
}: RestrictedProps): React.ReactElement<any, any> {
  const { groups } = useAppSelector((state) => state.user.userDetail);

  const permissionGranted = hasPermission({ groups, allowed });

  if (!permissionGranted && !errorProps && RenderError) return <RenderError />;

  if (!permissionGranted && errorProps)
    return cloneElement(children, { ...errorProps });

  if (!permissionGranted) return <></>;

  return <>{children}</>;
}
/* eslint-enable */
