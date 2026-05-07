import {
  LoginBodyType,
  RegisterBodyType,
  LoginResType,
  RegisterResType,
} from "@/schemaValidations/auth.schema";
import http from "@/lib/http";
const authApiRequest = {
  login: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body),
  register: (body: Omit<RegisterBodyType, "confirmPassword">) =>
    http.post<RegisterResType>("/auth/register", body),
};
export default authApiRequest;
