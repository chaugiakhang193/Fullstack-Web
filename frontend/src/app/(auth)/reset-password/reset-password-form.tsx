"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  ResetPasswordBody,
  ResetPasswordBodyType,
} from "@/schemaValidations/auth.schema";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Không tìm thấy token hợp lệ.");
      router.push("/forgot-password");
    }
  }, [token, router]);

  const form = useForm<ResetPasswordBodyType>({
    resolver: zodResolver(ResetPasswordBody),
    mode: "onTouched",
    defaultValues: {
      token: token || "",
      new_password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordBodyType) {
    try {
      setIsLoading(true);
      const { confirmPassword, ...dataToSend } = data; // Omit confirmPassword
      const res = await authApiRequest.resetPassword(dataToSend);

      toast.success("Thành công", {
        description:
          res.message ||
          "Đã đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
      });
      router.push("/login");
    } catch (error) {
      const httpError = error as { payload?: { message?: string } };
      toast.error("Thất bại", {
        description:
          httpError.payload?.message || "Có lỗi xảy ra khi đặt lại mật khẩu.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return null; // Don't render form if token is missing, let useEffect redirect
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      <Card className="flex flex-col w-full max-h-full shadow-lg max-w-lg justify-center mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Đặt lại mật khẩu mới</CardTitle>
          <CardDescription>
            Vui lòng nhập mật khẩu mới của bạn bên dưới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="reset-password-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="new_password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="new_password" className="text-sm">
                      Mật khẩu mới
                    </FieldLabel>
                    <Input
                      {...field}
                      id="new_password"
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword" className="text-sm">
                      Xác nhận mật khẩu
                    </FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder="Xác nhận lại mật khẩu mới"
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
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
