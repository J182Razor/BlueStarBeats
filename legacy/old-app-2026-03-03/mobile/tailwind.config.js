/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                'bg-deep-space': '#050511',
                'bg-nebula-purple': '#2D1B69',
                'bg-nebula-blue': '#1A237E',
                'accent-gold': '#FFD700',
                'accent-purple': '#B388FF',
                'accent-blue': '#448AFF',
                'accent-cyan': '#00E5FF',
            },
        },
    },
    plugins: [],
}
