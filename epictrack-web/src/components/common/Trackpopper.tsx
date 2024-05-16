import * as React from "react";
import Popper, { PopperProps } from "@mui/material/Popper";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import { Box, useEventCallback, useTheme } from "@mui/material";
import { Instance } from "@popperjs/core";

type FollowCursorProps = {
  followCursor: boolean;
  content: React.ReactElement;
  children: React.ReactElement;
};

type TrackPopperCustomProps = FollowCursorProps;
type TrackPopperProps = TrackPopperCustomProps;

function composeEventHandler(handler: any, eventHandler: any) {
  return (event: any) => {
    if (eventHandler) {
      eventHandler(event);
    }
    handler(event);
  };
}

let hystersisOpen = false;
let hystersisTimer: any = null;
export default function TrackPopper(props: TrackPopperProps) {
  const { children, followCursor, content, ...rest } = props;
  const [openState, setOpenState] = React.useState(false);
  const theme = useTheme();

  const open = openState;

  const positionRef = React.useRef({ x: 0, y: 0 });
  const popperRef = React.useRef<any>();

  const closeTimer = React.useRef<any>();
  const enterTimer = React.useRef<any>();
  const leaveTimer = React.useRef<any>();
  const touchTimer = React.useRef<any>();
  const leaveDelay = 0;
  const enterDelay = 100;
  const enterNextDelay = 0;

  const handleOpen = (event: any) => {
    clearTimeout(hystersisTimer);
    hystersisOpen = true;

    // The mouseover event will trigger for every nested element in the tooltip.
    // We can skip rerendering when the tooltip is already open.
    // We are using the mouseover event instead of the mouseenter event to fix a hide/show issue.
    setOpenState(true);
  };

  const handleClose = useEventCallback(
    /**
     * @param {React.SyntheticEvent | Event} event
     */
    (event) => {
      clearTimeout(hystersisTimer);
      hystersisTimer = setTimeout(() => {
        hystersisOpen = false;
      }, 800 + leaveDelay);
      setOpenState(false);

      clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        return;
      }, theme.transitions.duration.shortest);
    }
  );

  const handleMouseOver = (event: any) => {
    // Remove the title ahead of time.
    // We don't want to wait for the next render commit.
    // We would risk displaying two tooltips at the same time (native + this one).
    // if (childNode) {
    //   childNode.removeAttribute("title");
    // }

    clearTimeout(enterTimer.current);
    clearTimeout(leaveTimer.current);
    if (enterDelay || (hystersisOpen && enterNextDelay)) {
      event.persist();
      enterTimer.current = setTimeout(
        () => {
          handleOpen(event);
        },
        hystersisOpen ? enterNextDelay : enterDelay
      );
    } else {
      handleOpen(event);
    }
  };

  const handleMouseLeave = (event: MouseEvent) => {
    console.log("left");
    // handleClose();
    clearTimeout(enterTimer.current);
    clearTimeout(leaveTimer.current);
    // event.persist();
    leaveTimer.current = setTimeout(() => {
      handleClose(event);
    }, leaveDelay);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const childrenProps = children.props;
    if (childrenProps.onMouseMove) {
      childrenProps.onMouseMove(event);
    }

    positionRef.current = { x: event.clientX, y: event.clientY };

    if (popperRef?.current) {
      popperRef.current.update();
    }
  };

  const childrenProps = {
    ...children.props,
    ...(followCursor ? { onMouseMove: handleMouseMove } : {}),
    onMouseOver: composeEventHandler(
      handleMouseOver,
      children.props.onMouseOver
    ),
    onMouseLeave: composeEventHandler(
      handleMouseLeave,
      children.props.onMouseLeave
    ),
  };

  return (
    <React.Fragment>
      {React.cloneElement(children, childrenProps)}
      <Popper
        open={open}
        popperRef={popperRef}
        anchorEl={{
          getBoundingClientRect: () => ({
            top: positionRef.current.y,
            left: positionRef.current.x,
            right: positionRef.current.x,
            bottom: positionRef.current.y,
            width: 0,
            height: 0,
            x: positionRef.current.x,
            y: positionRef.current.y,
            toJSON: () => {
              return;
            },
          }),
        }}
        transition
        placement="bottom-start"
        {...rest}
        // onMouseOver={handleMouseOver}
        // onMouseLeave={handleMouseLeave}
        sx={{
          zIndex: 99999,
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>{content}</Paper>
          </Fade>
        )}
      </Popper>
    </React.Fragment>
  );
}
