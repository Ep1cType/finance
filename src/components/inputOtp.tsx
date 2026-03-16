import type * as React from "react";
import { type FormEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";

type InputOtp = {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
};

export const InputOtp = ({ length, value, onChange, onComplete }: InputOtp) => {
  const otpValue = useMemo(() => Array.from({ length }, (_, i) => value[i] ?? ""), [value, length]);

  const [displayValue, setDisplayValue] = useState(otpValue);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otpValue.every((digit) => digit !== "")) {
      onComplete?.();
    }
  }, [otpValue, onComplete]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = event.target.value;

    // TODO: Удалить. Это нужно для проверки что ввелось одно значение
    if (val.length > 1) {
      return;
    }

    const newOtp = [...otpValue];
    const newDisplay = [...displayValue];
    newOtp[index] = val;
    newDisplay[index] = val;

    const otpString = newOtp.join("");
    onChange(otpString);
    setDisplayValue(newDisplay);

    // if (index < length - 1) {
    //   if (newOtp.indexOf("") !== -1) {
    //     inputRefs.current[index]?.blur();
    //   }
    // }

    if (index < length - 1 && newOtp.indexOf("") !== -1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.indexOf("") === -1) {
      inputRefs.current[index]?.blur();
    }

    if (index + 1 >= length) {
      inputRefs.current[index]?.blur();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="border border-amber-300 w-fit">
      <p>Label</p>
      <div className="flex gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={`input_${index}`}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            className="w-12 h-12 border border-gray-500"
            maxLength={1}
            value={displayValue[index]}
            onInput={(event) => handleChange(event, index)}
            onFocus={handleFocus}
          />
        ))}
      </div>
      <p>Caption</p>
    </div>
  );
};
