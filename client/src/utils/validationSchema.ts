import * as yup from "yup";

// 🔐 Login Schema
export const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Minimum 6 characters").required("Password is required")
});

// 📝 Register Schema
export const registerSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Minimum 8 characters, 1 special character required")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "At least 1 special character required")
    .required("Password is required")
});

// 💸 Transaction Schema (disallowing past dates)
export const transactionSchema = yup.object({
  title: yup.string().required("Title is required"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be positive")
    .required("Amount is required"),
  type: yup.string().oneOf(["income", "expense"]).required("Type is required"),
  categoryId: yup.string().required("Category is required"),
  date: yup
    .date()
    .typeError("Date must be a valid date")
    .required("Date is required")
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "You can't add a transaction for a past date"
    ),
  notes: yup.string().optional()
});

