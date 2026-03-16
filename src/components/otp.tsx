import * as React from "react";
import { cn } from "shared/lib/utils";

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  hideDelay?: number;
}

export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      length = 6,
      value = "",
      onChange,
      onComplete,
      autoFocus = true,
      disabled = false,
      className,
      inputClassName,
      hideDelay = 800,
    },
    ref,
  ) => {
    const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""));
    const [displayValues, setDisplayValues] = React.useState<string[]>(Array(length).fill(""));
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const timeoutsRef = React.useRef<(NodeJS.Timeout | null)[]>(Array(length).fill(null));

    // Sync external value with internal state (otp only, not display)
    React.useEffect(() => {
      if (value !== undefined) {
        const valueArray = value.split("").slice(0, length);
        const newOtp = [...Array(length).fill("")];
        valueArray.forEach((char, index) => {
          newOtp[index] = char;
        });
        setOtp(newOtp);
        // setDisplayValues(newOtp);

        // Special case: if value is empty/cleared, reset displayValues and clear all timers
        if (value === "") {
          setDisplayValues(Array(length).fill(""));
          timeoutsRef.current.forEach((timeout) => {
            if (timeout) clearTimeout(timeout);
          });
          timeoutsRef.current = Array(length).fill(null);
        }
        // Otherwise, preserve displayValues to maintain hide state
      }
    }, [value, length]);

    // Auto-focus first input on mount
    React.useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus]);

    // Cleanup timeouts on unmount
    React.useEffect(() => {
      return () => {
        timeoutsRef.current.forEach((timeout) => {
          if (timeout) clearTimeout(timeout);
        });
      };
    }, []);

    const hideValueWithDelay = (index: number) => {
      // Clear existing timeout for this index
      if (timeoutsRef.current[index]) {
        clearTimeout(timeoutsRef.current[index]!);
      }

      // Set new timeout to hide THIS specific value
      timeoutsRef.current[index] = setTimeout(() => {
        setDisplayValues((prev) => {
          const newDisplay = [...prev];
          if (newDisplay[index]) {
            newDisplay[index] = "*";
          }
          return newDisplay;
        });
      }, hideDelay);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const val = e.target.value;

      // Only allow single digit/character
      if (val.length > 1) {
        return;
      }

      const newOtp = [...otp];
      const newDisplay = [...displayValues];

      newOtp[index] = val;
      newDisplay[index] = val;

      setOtp(newOtp);
      setDisplayValues(newDisplay);

      // Call onChange callback
      const otpString = newOtp.join("");
      onChange?.(otpString);

      // If value entered, hide THIS value after delay
      if (val) {
        hideValueWithDelay(index);

        // Move to next input
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }

        // Check if OTP is complete
        if (newOtp.every((digit) => digit !== "")) {
          onComplete?.(otpString);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace") {
        e.preventDefault();

        const newOtp = [...otp];
        const newDisplay = [...displayValues];

        // Clear current input
        if (newOtp[index]) {
          newOtp[index] = "";
          newDisplay[index] = "";

          // Clear timeout for this index
          if (timeoutsRef.current[index]) {
            clearTimeout(timeoutsRef.current[index]);
            timeoutsRef.current[index] = null;
          }
        } else if (index > 0) {
          // Move to previous input if current is empty
          inputRefs.current[index - 1]?.focus();
          newOtp[index - 1] = "";
          newDisplay[index - 1] = "";

          // Clear timeout for previous index
          if (timeoutsRef.current[index - 1]) {
            clearTimeout(timeoutsRef.current[index - 1]);
            timeoutsRef.current[index - 1] = null;
          }
        }

        setOtp(newOtp);
        setDisplayValues(newDisplay);
        onChange?.(newOtp.join(""));
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text/plain").slice(0, length);

      const newOtp = [...otp];
      const newDisplay = [...displayValues];

      pastedData.split("").forEach((char, index) => {
        if (index < length) {
          newOtp[index] = char;
          newDisplay[index] = char;
          // Each pasted character gets its own hide timer
          hideValueWithDelay(index);
        }
      });

      setOtp(newOtp);
      setDisplayValues(newDisplay);

      const otpString = newOtp.join("");
      onChange?.(otpString);

      // Focus on the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((val) => val === "");
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      inputRefs.current[focusIndex]?.focus();

      // Check if OTP is complete
      if (newOtp.every((digit) => digit !== "")) {
        onComplete?.(otpString);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        role="group"
        aria-label="One-time password input"
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={displayValues[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={handleFocus}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              "h-12 w-12 text-center text-lg font-semibold",
              "rounded-md border border-input bg-background",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:border-primary/50",
              displayValues[index] === "*" && "text-2xl leading-none",
              inputClassName,
            )}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
    );
  },
);

OTPInput.displayName = "OTPInput";
