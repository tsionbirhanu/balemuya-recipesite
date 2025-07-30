"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Save, X, Heart, Shield } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"
import Image from "next/image"
import Link from "next/link"

interface Recipe {
  id: string
  title: string
  imageUrl?: string
}

interface Favorite {
  id: number
  recipe: Recipe
}

interface UserProfile {
  id: number
  name: string | null
  email: string
  isAdmin?: boolean
  role?: string
  favorites?: Favorite[]
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        // Fetch profile data
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!profileResponse.ok) throw new Error('Failed to fetch profile')
        
        const profileData = await profileResponse.json()
        setUser(profileData)
        setEditName(profileData.name || "")

        // Fetch current user data for comparison
        const userData = localStorage.getItem("user")
        if (userData) {
          setCurrentUser(JSON.parse(userData))
        }
          } catch {
      toast.error("Failed to load profile")
    } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${params.id}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName })
      })

      if (!response.ok) throw new Error('Failed to update profile')
      
      const updatedData = await response.json()
      setUser(prev => prev ? { ...prev, name: updatedData.name } : null)
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    }
  }

  const isAdminUser = user?.isAdmin || user?.role === 'admin'
  const isCurrentUserAdmin = currentUser?.isAdmin || currentUser?.role === 'admin'
  const isOwnProfile = currentUser?.id === user?.id

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative">
                <div className="text-4xl text-gray-400">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                {isAdminUser && (
                  <div className="absolute -bottom-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Admin</span>
                  </div>
                )}
              </div>
              
              <div className="w-full max-w-md">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {user.name || "Anonymous User"}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>

                    {/* {isOwnProfile && (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                        className="mt-4"
                      >
                        <Edit3 className="h-4 w-4 mr-2" /> Edit Name
                      </Button>
                    )} */}

                    {/* Admin Quick Actions */}
                    {isCurrentUserAdmin && !isOwnProfile && (
                      <div className="mt-4 space-x-2">
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Manage User
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorites Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-bold">Favorite Recipes</h2>
            <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {user.favorites?.length || 0}
            </span>
          </div>

          {user.favorites?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.favorites.map((fav) => (
                <Card key={fav.id} className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-0">
                    <Link href={`/recipes/${fav.recipe.id}`} className="block">
                      <div className="relative aspect-square">
                        <Image
                          src={fav.recipe.imageUrl || "/placeholder-recipe.jpg"}
                          alt={fav.recipe.title}
                          fill
                          className="object-cover rounded-t-lg"
                          unoptimized={fav.recipe.imageUrl?.includes('example.com')}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-lg line-clamp-2">{fav.recipe.title}</h3>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No favorites yet</h3>
              <p className="mt-1 text-gray-500">
                Recipes you favorite will appear here
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/recipes')}
              >
                Browse Recipes
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}