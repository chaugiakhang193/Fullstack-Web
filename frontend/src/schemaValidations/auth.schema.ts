import z from "zod";
import { UserRole, AccountStatus } from "@/lib/enum";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(AccountStatus),
  full_name: z.string().nullable(),
  phone: z.string().nullable(),
  password_changed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const RegisterBody = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
      .max(32, "Tên đăng nhập tối đa 32 ký tự.")
      .regex(
        /.*[a-zA-Z].*/,
        "Tên đăng nhập không hợp lệ. Phải chứa ít nhất một chữ cái, không được để toàn số.",
      ),
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
    path: ["confirmPassword"],
  });

export const LoginBody = z
  .object({
    username: z.string().min(1, "Tên đăng nhập phải có ít nhất 3 ký tự."),
    password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  })
  .strict();

export const AuthRes = z.object({
  //statusCode: z.number().optional(),
  data: z.object({
    access_token: z.string(),
    user: UserSchema,
  }),
  message: z.string(),
});

export type AccountType = z.infer<typeof UserSchema>;

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;
export type RegisterResType = z.TypeOf<typeof AuthRes>;

export type LoginBodyType = z.TypeOf<typeof LoginBody>;
export type LoginResType = z.TypeOf<typeof AuthRes>;
