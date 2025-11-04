"use client";

import { useState } from "react";
import { LoginForm } from "widgets/login-form";
import { RegisterForm } from "widgets/register-form";
import { ForgotPasswordForm } from "widgets/forgot-password-form";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Добро пожаловать</h1>
          <p className="text-muted-foreground">
            {showForgotPassword ? "Сбросьте свой пароль" : isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          {showForgotPassword ? (
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          ) : isLogin ? (
            <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
          ) : (
            <RegisterForm />
          )}

          {!showForgotPassword && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? (
                  <>
                    Нет аккаунта? <span className="text-primary font-medium">Зарегистрируйтесь</span>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт? <span className="text-primary font-medium">Войдите</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
