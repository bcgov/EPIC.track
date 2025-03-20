import React, { cloneElement } from "react";
import { useAppSelector } from "../../../hooks";
import { ElevatedRoleEnum } from "models/elevated_role";

interface HasPermissionProps {
  allowed: string[];
  elevatedAllowed?: ElevatedRoleEnum[];
  elevatedRoles?: ElevatedRoleEnum[];
  roles: string[];
}

export const hasPermission = ({
  allowed,
  elevatedAllowed = [],
  elevatedRoles = [],
  roles,
}: HasPermissionProps) => {
  const allowedMap: { [scope: string]: boolean } = {};

  allowed.forEach((allowedGroup) => {
    allowedMap[allowedGroup] = true;
  });

  const elevatedAllowedMap: { [scope: string]: boolean } = {};
  elevatedAllowed.forEach((group) => (elevatedAllowedMap[group] = true));

  return (
    roles.some((group) => allowedMap[group]) ||
    elevatedRoles.some((group) => elevatedAllowedMap[group])
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RestrictedProps {
  allowed: string[];
  children: React.ReactElement<any, any>;
  elevatedAllowed?: ElevatedRoleEnum[];
  elevatedRoles?: ElevatedRoleEnum[];
  errorProps?: any;
  exception?: boolean;
  RenderError?: () => React.ReactElement<any, any>;
}

export function Restricted({
  allowed = [],
  children,
  elevatedAllowed = [],
  elevatedRoles = [],
  errorProps,
  exception = false,
  RenderError,
}: RestrictedProps): React.ReactElement<any, any> {
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const permissionGranted =
    exception ||
    hasPermission({ roles, allowed, elevatedAllowed, elevatedRoles });

  if (!permissionGranted && !errorProps && RenderError) return <RenderError />;

  if (!permissionGranted && errorProps)
    return cloneElement(children, { ...errorProps });

  if (!permissionGranted) return <></>;

  return <>{children}</>;
}
/* eslint-enable */
