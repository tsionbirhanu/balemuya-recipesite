🍲 Balemuya – Ethiopian & Global Recipes, by Ethiopians 🇪🇹

 [![Website](https://img.shields.io/badge/Live%20Demo-Balemuya-green?style=flat-square&logo=vercel)](https://balemuya-recipesite.vercel.app/) [![Next.js](https://img.shields.io/badge/Built%20With-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org) [![TypeScript](https://img.shields.io/badge/Code-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/) [![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38b2ac?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
 
Balemuya is a modern, interactive recipe-sharing platform built by Ethiopians to celebrate both authentic Ethiopian cuisine and global dishes. Whether you're a local foodie or an explorer of world flavors, Balemuya is your go-to kitchen companion to cook, share, and enjoy.

👉 Live Demo »

✨ Key Features
🔎 Search & filter delicious Ethiopian and international recipes

🍛 Browse by category, difficulty & cooking time

📤 Share your own recipes with images, descriptions, and ingredients

❤️ Like, review, and save recipes to favorites

🔐 Secure JWT-auth login & registration

🧑‍💼 Admin Dashboard for moderating user submissions

📱 Fully responsive across mobile, tablet, and desktop

🧠 Tech Stack
Tool	Purpose
⚡ Next.js	Full-stack React framework
🟦 TypeScript	Type-safe development
🎨 TailwindCSS	Utility-first CSS styling
🔐 JWT Auth	Secure login & token handling
☁️ Vercel	Deployment & hosting
🌐 REST API	Backend communication (external repo)

📁 Folder Structure
ruby
Copy
Edit
balemuya-recipesite/
├── public/               # Static assets (images, icons)
├── src/
│   ├── app/              # App Router (Next.js 13+ routing)
│   ├── components/       # Reusable components
│   ├── types/            # Global types
│   └── lib/              # API utils, token helpers
├── .env.local.example    # Example environment config
├── tailwind.config.ts    # Tailwind configuration
└── next.config.js        # Next.js configuration
🚀 Getting Started
To run the project locally:

bash
Copy
Edit
# 1. Clone
git clone https://github.com/yourusername/balemuya-recipesite.git
cd balemuya-recipesite

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.local.example .env.local
# Then update NEXT_PUBLIC_API_URL in the .env.local file

# 4. Start development server
npm run dev

# Visit:
http://localhost:3000
🤝 Contributing
We ❤️ contributions! Got an idea or a fix?

bash
Copy
Edit
# Fork and branch
git checkout -b feature/amazing-feature

# Commit
git commit -m 'Add amazing feature'

# Push
git push origin feature/amazing-feature
Then, open a Pull Request 🚀

📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

👩🏽‍💻 Made With Love
Crafted by Tsion Birhanu
Built in Ethiopia 🇪🇹, shared with the world 🌍
