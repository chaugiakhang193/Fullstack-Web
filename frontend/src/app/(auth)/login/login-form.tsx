"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils"; // Đừng quên import cn
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import envConfig from "@/app/config";
import { Loader2 } from "lucide-react";

// 1. Định nghĩa lại Schema cho form Đăng nhập
const formSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const dataToSend = data;
      setIsLoading(true);
      const res = await fetch(`${envConfig.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(dataToSend),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error("Đăng nhập thất bại", {
          description: result.message || "Thông tin không hợp lệ",
        });
        return;
      }
      router.push("/");
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  // 3. Render giao diện bạn yêu cầu, đã được bọc Controller
  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      <Card className="flex flex-col w-full max-h-full  shadow-lg max-w-lg justify-center mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            {/* CẤP ĐỘ 1: Dùng space-y-4 để cả 4 hàng cách đều nhau 1 khoảng 16px */}
            <FieldGroup>
              {/* 1. Field: Username */}
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username" className="text-sm">
                      Tên đăng nhập
                    </FieldLabel>
                    <Input
                      {...field}
                      id="username"
                      placeholder="Nhập tên đăng nhập"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* 3. Field: Password (Đã tách riêng) */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password" className="text-sm">
                      Mật khẩu
                    </FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
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
                      Đang đănh nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => router.push("/register")}
                >
                  Tạo tài khoản
                </Button>
              </div>
              {/* Phần mô tả mật khẩu và Nút Submit */}
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Footer Text */}
      <FieldDescription className="px-6 text-center">
        <a href="#" className="underline">
          Điều khoản dịch vụ
        </a>{" "}
        và{" "}
        <a href="#" className="underline">
          Chính sách bảo mật
        </a>
        .
      </FieldDescription>
    </div>
  );
}
