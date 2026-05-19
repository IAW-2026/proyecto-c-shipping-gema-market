"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { loginSchema, LoginFormData } from "../../../lib/validations/auth";
import { AuthStep, SecondFactorMethod, TwoFactorStep } from "./login/types";
import { CredentialsStep } from "./login/CredentialsStep";
import { EmailCodeStep } from "./login/EmailCodeStep";
import { TwoFactorSelectMethod } from "./login/TwoFactorSelectMethod";
import { TwoFactorTOTP } from "./login/TwoFactorTOTP";
import { TwoFactorPhoneCode } from "./login/TwoFactorPhoneCode";
import { TwoFactorBackupCode } from "./login/TwoFactorBackupCode";
import { TwoFactorEmailCode } from "./login/TwoFactorEmailCode";

interface EmailCodeFactor {
  strategy: "email_code";
  emailAddressId: string;
  safeIdentifier: string;
}

export function LoginForm({
  onToggleMode,
  onToggleResetPassword,
}: {
  onToggleMode?: () => void;
  onToggleResetPassword?: () => void;
}) {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [authStep, setAuthStep] = useState<AuthStep>("credentials");
  const [formData, setFormData] = useState<LoginFormData>({ identifier: "", password: "" });
  const [verificationCode, setVerificationCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [twoFactorStep, setTwoFactorStep] = useState<TwoFactorStep>("select_method");
  const [selectedMethod, setSelectedMethod] = useState<SecondFactorMethod | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [capturedSecondFactors, setCapturedSecondFactors] = useState<SecondFactorMethod[]>([]);
  const [phoneCodeSafeIdentifier, setPhoneCodeSafeIdentifier] = useState<string | null>(null);

  const isLoading = fetchStatus === "fetching";

  const resetTwoFactorState = useCallback(() => {
    setTwoFactorStep("select_method");
    setSelectedMethod(null);
    setTwoFactorCode("");
    setPhoneCodeSent(false);
    setEmailCodeSent(false);
    setCapturedSecondFactors([]);
    setPhoneCodeSafeIdentifier(null);
  }, []);

  const handleCredentialsSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!signIn || isLoading) return;

      setError(null);
      const validation = loginSchema.safeParse(formData);

      if (!validation.success) {
        setError(validation.error.issues[0].message);
        return;
      }

      const { error: passwordError } = await signIn.password({
        identifier: validation.data.identifier,
        password: validation.data.password,
      });

      if (passwordError) {
        setError(passwordError.longMessage ?? passwordError.message ?? "Credenciales inválidas.");
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setError(finalizeError.longMessage ?? "Error al finalizar inicio de sesión.");
          return;
        }
        router.push("/dashboard");
      } else if (signIn.status === "needs_second_factor") {
        resetTwoFactorState();
        captureSecondFactors(signIn);
        setAuthStep("needs_2fa");
      } else {
        setError("Estado de inicio de sesión inesperado.");
      }
    },
    [signIn, isLoading, formData, router, resetTwoFactorState]
  );

  const handleEmailCodeVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!signIn || isLoading) return;

      setError(null);

      if (verificationCode.length !== 6) {
        setError("El código debe tener 6 dígitos.");
        return;
      }

      try {
        const result = await signIn.emailCode.verifyCode({
          code: verificationCode,
        });

        if (result.error) {
          setError(result.error.longMessage ?? result.error.message ?? "Código inválido o expirado.");
          return;
        }

        if (signIn.status === "complete") {
          await signIn.finalize();
          router.push("/dashboard");
        } else if (signIn.status === "needs_second_factor") {
          resetTwoFactorState();
          captureSecondFactors(signIn);
          setAuthStep("needs_2fa");
        } else {
          setError("Verificación incompleta. Intentá nuevamente.");
        }
      } catch (err: any) {
        const clerkError = err?.errors?.[0];
        setError(clerkError?.longMessage ?? clerkError?.message ?? "Error al verificar código.");
      }
    },
    [signIn, isLoading, verificationCode, router, resetTwoFactorState]
  );

  const handlePrepareEmailCode = useCallback(async () => {
    if (!signIn) return;
    setError(null);

    try {
      const result = await signIn.mfa.sendEmailCode();

      if (result.error) {
        setError(result.error.longMessage ?? "Error al enviar código de verificación.");
        return;
      }

      setEmailCodeSent(true);
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setError(clerkError?.longMessage ?? clerkError?.message ?? "Error al enviar código de verificación.");
    }
  }, [signIn]);

  const handlePreparePhoneCode = useCallback(async () => {
    if (!signIn) return;
    setError(null);

    try {
      const result = await signIn.mfa.sendPhoneCode();

      if (result.error) {
        setError(result.error.longMessage ?? "Error al enviar código SMS.");
        return;
      }

      setPhoneCodeSent(true);
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setError(clerkError?.longMessage ?? clerkError?.message ?? "Error al enviar código SMS.");
    }
  }, [signIn]);

  const handleSecondFactorVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!signIn || !selectedMethod) return;

      setError(null);

      if (twoFactorCode.trim().length === 0) {
        setError("Ingresá el código de verificación.");
        return;
      }

      try {
        let result: { error: any };

        switch (selectedMethod) {
          case "totp":
            result = await signIn.mfa.verifyTOTP({ code: twoFactorCode.trim() });
            break;
          case "phone_code":
            result = await signIn.mfa.verifyPhoneCode({ code: twoFactorCode.trim() });
            break;
          case "backup_code":
            result = await signIn.mfa.verifyBackupCode({ code: twoFactorCode.trim() });
            break;
          case "email_code":
            result = await signIn.mfa.verifyEmailCode({ code: twoFactorCode.trim() });
            break;
        }

        if (result.error) {
          setError(result.error.longMessage ?? result.error.message ?? "Código inválido o expirado.");
          return;
        }

        if (signIn.status === "complete") {
          await signIn.finalize();
          router.push("/dashboard");
        } else {
          resetTwoFactorState();
          captureSecondFactors(signIn);
          setError("Verificación incompleta. Intentá nuevamente.");
        }
      } catch (err: any) {
        const clerkError = err?.errors?.[0];
        setError(clerkError?.longMessage ?? clerkError?.message ?? "Error al verificar código.");
      }
    },
    [signIn, selectedMethod, twoFactorCode, router, resetTwoFactorState]
  );

  const handleSelectMethod = useCallback(
    (method: SecondFactorMethod) => {
      setSelectedMethod(method);
      setTwoFactorStep("verify_code");
      setError(null);
      setTwoFactorCode("");
      setPhoneCodeSent(false);
      setEmailCodeSent(false);
    },
    []
  );

  const handleBackToMethods = useCallback(() => {
    setTwoFactorStep("select_method");
    setSelectedMethod(null);
    setTwoFactorCode("");
    setPhoneCodeSent(false);
    setEmailCodeSent(false);
    setError(null);
  }, []);

  const handleBackToCredentials = useCallback(() => {
    setAuthStep("credentials");
    setError(null);
    setVerificationCode("");
    resetTwoFactorState();
  }, [resetTwoFactorState]);

  function captureSecondFactors(s: typeof signIn) {
    if (!s) return;
    const factors: SecondFactorMethod[] = [];
    let phoneIdentifier: string | null = null;

    if (s.supportedSecondFactors) {
      for (const f of s.supportedSecondFactors) {
        if (f.strategy === "totp") factors.push("totp");
        else if (f.strategy === "phone_code") {
          factors.push("phone_code");
          if ("safeIdentifier" in f && typeof (f as any).safeIdentifier === "string") {
            phoneIdentifier = (f as any).safeIdentifier;
          }
        } else if (f.strategy === "backup_code") factors.push("backup_code");
        else if (f.strategy === "email_code") factors.push("email_code");
      }
    }

    if (factors.length === 0) {
      factors.push("email_code");
    }

    setCapturedSecondFactors(factors);
    setPhoneCodeSafeIdentifier(phoneIdentifier);

    if (factors.length === 1) {
      setSelectedMethod(factors[0]);
      setTwoFactorStep("verify_code");
    }
  }

  const availableMethods = useMemo(
    () => capturedSecondFactors,
    [capturedSecondFactors]
  );



  if (authStep === "needs_email_code") {
    return (
      <EmailCodeStep
        verificationCode={verificationCode}
        error={error}
        isLoading={isLoading}
        onCodeChange={setVerificationCode}
        onSubmit={handleEmailCodeVerify}
        onBack={handleBackToCredentials}
      />
    );
  }

  if (authStep === "needs_2fa") {
    if (twoFactorStep === "select_method" || selectedMethod === null) {
      return (
        <TwoFactorSelectMethod
          availableMethods={availableMethods}
          phoneCodeSafeIdentifier={phoneCodeSafeIdentifier}
          error={error}
          onSelectMethod={handleSelectMethod}
          onBack={handleBackToCredentials}
        />
      );
    }

    switch (selectedMethod) {
      case "totp":
        return (
          <TwoFactorTOTP
            code={twoFactorCode}
            error={error}
            isLoading={isLoading}
            onCodeChange={setTwoFactorCode}
            onSubmit={handleSecondFactorVerify}
            onBack={handleBackToMethods}
          />
        );
      case "phone_code":
        return (
          <TwoFactorPhoneCode
            code={twoFactorCode}
            error={error}
            isLoading={isLoading}
            phoneCodeSent={phoneCodeSent}
            phoneCodeSafeIdentifier={phoneCodeSafeIdentifier}
            onCodeChange={setTwoFactorCode}
            onSendCode={handlePreparePhoneCode}
            onSubmit={handleSecondFactorVerify}
            onBack={handleBackToMethods}
          />
        );
      case "email_code":
        return (
          <TwoFactorEmailCode
            code={twoFactorCode}
            error={error}
            isLoading={isLoading}
            emailCodeSent={emailCodeSent}
            onCodeChange={setTwoFactorCode}
            onSendCode={handlePrepareEmailCode}
            onSubmit={handleSecondFactorVerify}
            onBack={handleBackToMethods}
          />
        );
      case "backup_code":
        return (
          <TwoFactorBackupCode
            code={twoFactorCode}
            error={error}
            isLoading={isLoading}
            onCodeChange={setTwoFactorCode}
            onSubmit={handleSecondFactorVerify}
            onBack={handleBackToMethods}
          />
        );
    }
  }

  return (
    <CredentialsStep
      formData={formData}
      error={error}
      isLoading={isLoading}
      showPassword={showPassword}
      onFormDataChange={setFormData}
      onSubmit={handleCredentialsSubmit}
      onTogglePassword={() => setShowPassword((prev) => !prev)}
      onToggleResetPassword={onToggleResetPassword}
      onToggleMode={onToggleMode}
    />
  );
}


