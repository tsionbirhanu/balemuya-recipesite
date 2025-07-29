"use client"

import { ChefHat } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ChefHat className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">Balemuya</span>
            </div>
            <p className="text-gray-400">Bringing authentic Ethiopian flavors to kitchens worldwide.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Recipes</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/recipes?sort=popular" className="hover:text-white transition-colors">
                  Popular
                </Link>
              </li>
              <li>
                <Link href="/recipes?sort=latest" className="hover:text-white transition-colors">
                  Latest
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Submit Recipe
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-white transition-colors">
                  Forum
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Balemuya. Made with ❤️ Tsion and Dagmawit.</p>
        </div>
      </div>
    </footer>
  )
}