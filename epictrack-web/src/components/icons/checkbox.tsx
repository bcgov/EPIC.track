import React, { ReactNode } from "react";
import { IconProps } from "./type";

const commonProps = {
  className: "sidebar-item",
  width: "20",
  height: "20",
  viewBox: "0 0 20 20",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

export const CheckboxChecked = (props: IconProps) => {
  return (
    <svg {...commonProps} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#1A5A96"
        d="M2 2H18V18H2V2ZM0 2C0 0.895431 0.895431 0 2 0H18C19.1046 0 20 0.895431 20 2V18C20 19.1046 19.1046 20 18 20H2C0.895431 20 0 19.1046 0 18V2ZM15.6129 7.6062C15.9684 7.27808 15.9684 6.70386 15.6129 6.37573C15.2848 6.02026 14.7106 6.02026 14.3824 6.37573L7.98401 12.7468L5.11292 9.87573C4.78479 9.52026 4.21057 9.52026 3.88245 9.87573C3.52698 10.2039 3.52698 10.7781 3.88245 11.1062L7.38245 14.6062C7.71057 14.9617 8.28479 14.9617 8.61292 14.6062L15.6129 7.6062Z"
      />
    </svg>
  );
};

export const CheckboxRegular = (props: IconProps) => {
  return (
    <svg {...commonProps} {...props}>
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="1"
        stroke="#C2C4C5"
        strokeWidth="2"
      />
    </svg>
  );
};
