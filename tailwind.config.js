/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./features/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16A34A", // verde - confiança, progresso
          light: "#22C55E",
          dark: "#15803D",
        },
        accent: {
          DEFAULT: "#F97316", // laranja - energia, ação
          light: "#FB923C",
          dark: "#EA580C",
        },
        background: "#F7F5EF",
        surface: "#FFFFFF",
        surfaceDark: "#0F1712",
        danger: "#DC2626",
        muted: "#8A8578",
        ink: "#1F2937",
        // status / chips (visto no design system)
        status: {
          success: "#16A34A", // pago / dívida ativa positiva
          successBg: "#DCFCE7",
          warning: "#D97706", // pendente / prioridade média
          warningBg: "#FEF3C7",
          danger: "#DC2626", // atrasado / prioridade alta
          dangerBg: "#FEE2E2",
          info: "#2563EB", // renegociação
          infoBg: "#DBEAFE",
        },
      },
      borderRadius: {
        card: "20px",
        button: "16px",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
