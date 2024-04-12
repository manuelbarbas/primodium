import * as React from "react";
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}
export const Slot = React.forwardRef<HTMLElement, SlotProps>((props, ref) => {
  const Comp = props.children;
  return <Comp ref={ref} {...props} />;
});
