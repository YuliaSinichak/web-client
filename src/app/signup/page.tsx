"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // your auth hook

const SignUp = () => {
  const router = useRouter();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm: "",
    role: "builder", // default role
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm) {
      setError("Паролі не співпадають!");
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.role);
      router.push("/");
    } catch (err: any) {
      setError("Не вдалося зареєструватися. Спробуйте іншу пошту або пароль.");
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 text-black"
      >
        <h2 className="text-2xl font-semibold text-center text-green-700">
          Реєстрація
        </h2>

        {error && (
          <div className="text-red-600 bg-red-100 p-3 rounded text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Електронна пошта"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirm"
          placeholder="Підтвердіть пароль"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          onChange={handleChange}
          required
        />

        {/* Role Selector */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
        >
          <option value="builder">Builder</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Зареєструватися
        </button>
        <p className="text-center text-sm text-gray-600">
          Вже маєте акаунт?{" "}
          <a href="/signin" className="text-green-700 font-medium">
            Увійти
          </a>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
