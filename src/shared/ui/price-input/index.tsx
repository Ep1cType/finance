"use client";

import { Input } from "components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "components/ui/input-group";
import { Label } from "components/ui/label";
import React, { type ChangeEvent, forwardRef, type InputHTMLAttributes, useEffect, useId, useState } from "react";
import { cn } from "shared/lib/utils";

interface PriceInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label?: string;
  currency?: string;
  value?: number | string;
  onChange?: (value: number) => void;
  error?: string;
  enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  onEnterPress?: () => void;
}

export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  (
    {
      label,
      currency = "₽",
      value = "",
      onChange,
      error,
      className,
      id,
      enterKeyHint = "next",
      onEnterPress,
      ...props
    },
    ref,
  ) => {
    const inputId = useId();
    const [displayValue, setDisplayValue] = useState(value.toString());
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused && value) {
        setDisplayValue(formatWithSpaces(value.toString()));
      } else {
        setDisplayValue(value.toString());
      }
    }, [value, isFocused]);

    const formatWithSpaces = (val: string): string => {
      if (!val || val === "") return "";

      const num = Number.parseFloat(val.replace(/\s/g, ""));
      if (Number.isNaN(num)) return val;

      const parts = num.toString().split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

      return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    };

    const removeSpaces = (val: string): string => {
      return val.replace(/\s/g, "");
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = removeSpaces(e.target.value);

      // Allow empty string
      if (inputValue === "") {
        setDisplayValue("");
        onChange?.(0);
        return;
      }

      // Allow only numbers and one decimal point
      const regex = /^\d*\.?\d*$/;
      if (!regex.test(inputValue)) {
        return;
      }

      // Prevent negative values
      const numValue = Number.parseFloat(inputValue);
      if (numValue < 0) {
        return;
      }

      setDisplayValue(inputValue);

      // Only call onChange with valid number
      if (!Number.isNaN(numValue)) {
        onChange?.(numValue);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (displayValue && !Number.isNaN(Number.parseFloat(removeSpaces(displayValue)))) {
        const numValue = Number.parseFloat(removeSpaces(displayValue));
        setDisplayValue(formatWithSpaces(numValue.toString()));
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      setDisplayValue(removeSpaces(displayValue));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnterPress?.();
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}

        <InputGroup>
          {currency && (
            <InputGroupAddon>
              <InputGroupText>{currency}</InputGroupText>
            </InputGroupAddon>
          )}
          <InputGroupInput
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            enterKeyHint={enterKeyHint}
            className={cn("pl-10", error && "border-destructive focus-visible:ring-destructive", className)}
            {...props}
          />
        </InputGroup>

        {/*<div className="relative">*/}
        {/*  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">*/}
        {/*    <span className="text-muted-foreground text-sm font-medium">{currency}</span>*/}
        {/*  </div>*/}
        {/*  <Input*/}
        {/*    ref={ref}*/}
        {/*    id={inputId}*/}
        {/*    type="text"*/}
        {/*    inputMode="decimal"*/}
        {/*    value={displayValue}*/}
        {/*    onChange={handleChange}*/}
        {/*    onBlur={handleBlur}*/}
        {/*    onFocus={handleFocus}*/}
        {/*    onKeyDown={handleKeyDown}*/}
        {/*    enterKeyHint={enterKeyHint}*/}
        {/*    className={cn("pl-10", error && "border-destructive focus-visible:ring-destructive", className)}*/}
        {/*    {...props}*/}
        {/*  />*/}
        {/*</div>*/}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  },
);

PriceInput.displayName = "PriceInput";
