"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import authApiRequest from "@/apiRequests/auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  VerifyEmailBody,
  VerifyEmailBodyType,
} from "@/schemaValidations/auth.schema";

export function VerifyEmailForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<VerifyEmailBodyType>({
    resolver: zodResolver(VerifyEmailBody),
    mode: "onTouched",
    defaultValues: {
      verification_token: "",
    },
  });

  async function onSubmit(data: VerifyEmailBodyType) {
    try {
      setIsLoading(true);
      const res = await authApiRequest.verifyEmail(data);
      toast.success("Thành công", {
        description:
          res.message || "Tài khoản của bạn đã được xác thực thành công.",
      });

      // Lưu thông tin đăng nhập vào Store (Zustand)
      if (res.data) {
        setAuth(res.data.user, res.data.access_token);
      }

      // Tự động refresh trang và chuyển hướng về trang chủ
      window.location.href = "/";
    } catch (error) {
      const httpError = error as { payload?: { message?: string } };
      toast.error("Xác thực thất bại", {
        description:
          httpError.payload?.message ||
          "Mã xác thực không hợp lệ hoặc đã hết hạn.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      <Card className="flex flex-col w-full max-h-full shadow-lg max-w-lg justify-center mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Xác thực tài khoản</CardTitle>
          <CardDescription>
            Vui lòng nhập mã xác thực đã được gửi đến email của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="verify-email-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="verification_token"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="verification_token"
                      className="text-sm"
                    >
                      Mã xác thực
                    </FieldLabel>
                    <Input
                      {...field}
                      id="verification_token"
                      placeholder="Nhập mã xác thực (Token)"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    "Xác nhận"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => router.push("/resend-verification")}
                >
                  Gửi lại mã xác thực
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
