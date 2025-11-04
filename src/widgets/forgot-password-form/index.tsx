"use client";

import React, { useState } from "react";

import { Button } from "components/ui/button";
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";

interface Props {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Password reset requested for:", email);
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Button
          onClick={onBack}
          variant="outline"
          className="w-full bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold text-foreground">Сбросьте свой пароль</h3>
        <p className="text-sm text-muted-foreground">
					Введите свою электронную почту и&nbsp;мы&nbsp;отправим вам&nbsp;ссылку для&nbsp;сброса вашего пароля
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-foreground">
          Email
        </Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? "Отправка..." : "Отправить ссылку"}
      </Button>

      <Button
        type="button"
        onClick={onBack}
        variant="ghost"
        className="w-full text-muted-foreground hover:text-foreground"
      >
        Вернутся к авторизации
      </Button>
    </form>
  );
}
