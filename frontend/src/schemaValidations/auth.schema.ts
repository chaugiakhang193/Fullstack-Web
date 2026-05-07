import z from "zod";

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
    email: z.string().email(),
    password: z.string().min(6).max(100),
  })
  .strict();

export const AuthRes = z.object({
  data: z.object({
    token: z.string(),
    expiresAt: z.string(),
    account: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
    }),
  }),
  message: z.string(),
});

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;
export type RegisterResType = z.TypeOf<typeof AuthRes>;

export type LoginBodyType = z.TypeOf<typeof LoginBody>;
export type LoginResType = z.TypeOf<typeof AuthRes>;
