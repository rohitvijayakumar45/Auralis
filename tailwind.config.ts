import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui"],
        serif: ["Cormorant Garamond", "Georgia", "serif"]
      },
      colors: {
        ivory: "#f7f0e6",
        bone: "#fbf7ef",
        linen: "#efe4d2",
        sand: "#d9c7ad",
        clay: "#b96d4d",
        sage: "#7f8c72",
        olive: "#596044",
        copper: "#b97847",
        charcoal: "#211d18",
        ink: "#15130f"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(33,29,24,0.12)",
        lift: "0 18px 50px rgba(33,29,24,0.16)"
      },
      backgroundImage: {
        "grain-wash":
          "radial-gradient(circle at 20% 10%, rgba(185,109,77,0.18), transparent 32%), radial-gradient(circle at 90% 15%, rgba(127,140,114,0.16), transparent 30%), linear-gradient(135deg, #fbf7ef 0%, #efe4d2 100%)"
      }
    }
  },
  plugins: []
} satisfies Config;
