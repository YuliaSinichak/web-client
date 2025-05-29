"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header
      className="text-white text-center p-12 shadow-lg relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(107, 142, 35, 0.5), rgba(107, 142, 35, 0.5)), url('/banner.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        flex: "row",
      }}
    >
      <h1 className="text-3xl font-semibold">City Builder Simulator v.1000</h1>

      {!user ? (
        <div className="absolute top-4 right-4 flex gap-4">
          <Link
            href="/login"
            className="bg-white text-green-700 font-semibold px-4 py-2 rounded hover:bg-green-100 transition"
          >
            Увійти
          </Link>
          <Link
            href="/signup"
            className="bg-green-700 text-white font-semibold px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Зареєструватись
          </Link>
        </div>
      ) : (
        <div className="absolute top-4 right-4 flex gap-4 items-center">
          <span className="font-semibold">Привіт, {user.email}</span>
          <button
            onClick={logout}
            className="bg-red-600 text-white font-semibold px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Вийти
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
