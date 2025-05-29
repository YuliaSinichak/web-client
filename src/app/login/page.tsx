"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // Import your custom auth hook

const SignIn = () => {
  const router = useRouter();
  const { login } = useAuth(); // Get login from useAuth
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
      router.push("/"); // Redirect to main page after login
    } catch (err: any) {
      setError("Невірна електронна пошта або пароль.");
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 text-black"
      >
        <h2 className="text-2xl font-semibold text-center text-green-700">
          Вхід до City Builder
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
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Увійти
        </button>
        <p className="text-center text-sm text-gray-600">
          Ще не маєте акаунту?{" "}
          <a href="/signup" className="text-green-700 font-medium">
            Зареєструватися
          </a>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
