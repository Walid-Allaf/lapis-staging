import * as Yup from "yup";

export const loginSchema = Yup.object().shape({
  email: Yup.string().required("please_fill_field"),
  password: Yup.string().required("please_fill_field"),
});
