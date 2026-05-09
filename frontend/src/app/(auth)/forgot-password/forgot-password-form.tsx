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
  ForgotPasswordBody,
  ForgotPasswordBodyType,
} from "@/schemaValidations/auth.schema";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [hasSent, setHasSent] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const form = useForm<ForgotPasswordBodyType>({
    resolver: zodResolver(ForgotPasswordBody),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordBodyType) {
    try {
      setIsLoading(true);
      const res = await authApiRequest.forgotPassword(data);
      toast.success("Thành công", {
        description:
          res.message ||
          "Vui lòng kiểm tra email của bạn để lấy liên kết khôi phục mật khẩu.",
      });
      setHasSent(true);
      setCooldown(60);
    } catch (error) {
      const httpError = error as { payload?: { message?: string } };
      toast.error("Thất bại", {
        description:
          httpError.payload?.message ||
          "Có lỗi xảy ra khi gửi email khôi phục.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      <Card className="flex flex-col w-full max-h-full shadow-lg max-w-lg justify-center mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email của bạn để nhận liên kết khôi phục mật khẩu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="forgot-password-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email" className="text-sm">
                      Email
                    </FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      placeholder="Nhập địa chỉ email của bạn"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || cooldown > 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : cooldown > 0 ? (
                    `Gửi lại liên kết khôi phục (${cooldown}s)`
                  ) : hasSent ? (
                    "Gửi lại liên kết khôi phục"
                  ) : (
                    "Gửi liên kết khôi phục"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => router.push("/login")}
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
