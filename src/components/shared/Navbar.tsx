
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChefHat, Menu, X, User, LogOut, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UserData {
  id: number
  name: string
  email: string
  isAdmin: boolean
  role?: string
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("user")
        const token = localStorage.getItem("token")
        
        if (!userData || !token) {
          setUser(null)
          return
        }

        const parsedUser = JSON.parse(userData)
        const isAdmin = parsedUser.isAdmin || parsedUser.role === 'admin'
        setUser({
          ...parsedUser,
          id: Number(parsedUser.id),
          isAdmin
        })
      } catch (error) {
        console.error("Error loading user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setUser(null)
    setMenuOpen(false)
    toast.success("Logged out successfully")
    router.push("/")
  }

  const closeMenu = () => setMenuOpen(false)

  if (loading) {
    return (
      <nav className="bg-white/90 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-800">Balemuya</span>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-800">Balemuya</span>
          </Link>
        </div>
    
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/recipes" className="text-gray-700 hover:text-red-600 transition-colors">
            Recipes
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              {(user.isAdmin || user.role === 'admin') && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="rounded-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent flex items-center gap-1"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
              

              <Link href={`/profile/${user.id}`}>
                <Button
                  variant="outline"
                  className="rounded-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent flex items-center gap-1"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="rounded-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              asChild
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-200"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-7 w-7 text-red-600" /> : <Menu className="h-7 w-7 text-red-600" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white/95 border-b border-orange-100 px-4 py-4 space-y-3 shadow-lg animate-fade-in-down">
          <Link
            href="/recipes"
            className="block text-gray-700 hover:text-red-600 transition-colors py-2"
            onClick={closeMenu}
          >
            Recipes
          </Link>

          {user ? (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2 py-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">{user.name}</span>
                {(user.isAdmin || user.role === 'admin') && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Shield className="h-4 w-4 text-red-600" />
                    </TooltipTrigger>
                    <TooltipContent>Admin User</TooltipContent>
                  </Tooltip>
                )}
              </div>

              {(user.isAdmin || user.role === 'admin') && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors py-2"
                  onClick={closeMenu}
                >
                  <Shield className="h-5 w-5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <Link
                href={`/profile/${user.id}`}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors py-2"
                onClick={closeMenu}
              >
                <User className="h-5 w-5" />
                <span>My Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors py-2 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent mt-2"
              asChild
              onClick={closeMenu}
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  )
}