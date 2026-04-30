"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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

// 1. Định nghĩa lại Schema cho form Đăng ký
const formSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
      .max(32, "Tên đăng nhập tối đa 32 ký tự."),
    email: z
      .string()
      .min(1, "Vui lòng nhập email.")
      .email("Email không đúng định dạng."),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa.")
      .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường.")
      .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"], // Hiển thị lỗi ở field confirmPassword
  });

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // 2. Khởi tạo form với các giá trị mặc định mới
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("Bạn đã đăng ký với thông tin:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-slate-950 p-4 text-white">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
    });

    // Tại đây sau này bạn sẽ gọi API sang backend NestJS:
    // ví dụ: await authService.register(data)
  }

  // 3. Render giao diện bạn yêu cầu, đã được bọc Controller
  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      <Card className="flex flex-col w-full max-h-full  shadow-lg max-w-lg justify-center mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Chào mừng bạn đến với <b>Giang Kha shop</b>!<br />
            Hãy tạo tài khoản để tiếp tục nhé!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* 2. Field: Email */}
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
                      type="email"
                      placeholder="m@example.com"
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
                    <Input {...field} id="password" type="password" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* 4. Field: Confirm Password (Đã tách riêng) */}
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirm-password">
                      Xác nhận mật khẩu
                    </FieldLabel>
                    <Input {...field} id="confirm-password" type="password" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Phần mô tả mật khẩu và Nút Submit */}
              <div>
                <Button type="submit" className="w-full">
                  Tạo tài khoản
                </Button>
              </div>
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
