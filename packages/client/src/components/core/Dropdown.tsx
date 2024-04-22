import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/util/client";
import { Button } from "@/components/core/Button";
import { FaAngleDown } from "react-icons/fa";
import { SecondaryCard } from "@/components/core/Card";
import { VariantProps, cva } from "class-variance-authority";

const dropdownVariants = cva(
  "z-50 absolute mt-1 p-2 bg-neutral border border-secondary/25 w-44 pointer-events-auto data-[state=close]:pointer-events-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=close]:animate-out data-[state=close]:fade-out fill-mode-forwards",
  {
    variants: {
      variant: {
        bottomLeft: "origin-top-right right-0",
        bottomRight: "",
      },
    },
    defaultVariants: {
      variant: "bottomLeft",
    },
  }
);

interface DropdownProps extends VariantProps<typeof dropdownVariants> {
  children?: ReactNode[];
  className?: string;
}
export const Dropdown: FC<DropdownProps> & {
  Item: typeof DropdownItem;
} = ({ children, className, variant }) => {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (!menuRef.current) return;
        menuRef.current.dataset.state = "close";
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);

    if (menuRef.current) menuRef.current.dataset.state = "close";

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  if (!children) return null;

  const toggleMenu = () => {
    if (!menuRef.current) return;

    const currentState = menuRef.current.dataset.state;
    menuRef.current.dataset.state = currentState === "open" ? "close" : "open";
  };

  return (
    <div ref={ref} className={cn("pointer-events-auto relative w-fit", className)}>
      <Button
        variant="neutral"
        size="md"
        className="border border-secondary/25 shadow-inner"
        role="button"
        onClick={toggleMenu}
      >
        <div className="pointer-events-none flex flex-row gap-2 items-center justify-center">
          {children[index]} <FaAngleDown className="opacity-50" />
        </div>
      </Button>
      <SecondaryCard ref={menuRef} className={cn(dropdownVariants({ variant }))}>
        {children.map((child, i) => (
          <Button
            key={i}
            variant="ghost"
            shape="block"
            onClick={() => {
              if (!menuRef.current) return;
              menuRef.current.dataset.state = "close";
              setIndex(i);
            }}
          >
            {child}
          </Button>
        ))}
      </SecondaryCard>
    </div>
  );
};

const DropdownItem: FC<{
  children: ReactNode;
  onSelect?: () => void;
}> = ({ children, onSelect }) => (
  <div className="w-full" onClick={onSelect}>
    {children}
  </div>
);

Dropdown.Item = DropdownItem;
