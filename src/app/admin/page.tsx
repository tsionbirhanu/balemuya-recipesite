
"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, Shield, Loader2, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface RecipeRequest {
  id: number
  title: string
  imageUrl?: string | null
  instructions: string[] | string
  ingredients: Array<{
    name?: string
    ingredient?: string
    unit?: string
    amount?: string | number
    quantity?: string | number
    note?: string
  }>
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  user?: {
    name?: string
    email?: string
  }
  userId: number
  createdAt: string
  featured: boolean
}

export default function AdminPage() {
  const [requests, setRequests] = useState<RecipeRequest[]>([])
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthorized'>('checking')
  const router = useRouter()



  const fetchRequests = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/recipe_request`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch requests')
      }

      const data = await res.json()
      
      const pendingRequests = data
        .filter((r: RecipeRequest) => r.status === 'PENDING')
        .map((request: RecipeRequest) => ({
          ...request,
          user: request.user || { name: 'Unknown', email: '' },
          instructions: Array.isArray(request.instructions) 
            ? request.instructions 
            : [request.instructions || 'No instructions provided'],
          ingredients: request.ingredients.map((ing) => ({
            name: ing.name || ing.ingredient || 'Unknown ingredient',
            unit: ing.unit || '',
            amount: ing.amount || ing.quantity || '',
            note: ing.note || ''
          }))
        }))

      setRequests(pendingRequests)
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Failed to load requests")
    }
  }, [])

  const verifyAdmin = useCallback(async () => {
    try {
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (!userData || !token) {
        throw new Error('Authentication required')
      }

      const user = JSON.parse(userData)
      if (user?.role !== 'admin') {
        throw new Error('Admin privileges required')
      }

      setAuthState('authenticated')
      await fetchRequests(token)
    } catch (error) {
      console.error("Verification failed:", error)
      setAuthState('unauthorized')
      toast.error(error instanceof Error ? error.message : 'Access denied')
      router.push('/')
    }
  }, [router, fetchRequests])

  useEffect(() => {
    verifyAdmin()
  }, [verifyAdmin])



  const handleDecision = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      const body: { status: string; categoryId?: number } = { status }

      if (status === 'APPROVED') {
        const categoryId = prompt("Enter category ID:")
        if (!categoryId || isNaN(Number(categoryId))) {
          toast.error("Please enter a valid category ID")
          return
        }
        body.categoryId = Number(categoryId)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/recipe_request/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to ${status.toLowerCase()} recipe`)
      }

      toast.success(`Recipe ${status.toLowerCase()} successfully`)
      fetchRequests(token)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed')
    }
  }

  const renderImage = (imageUrl?: string | null) => {
    if (!imageUrl) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          No Image
        </div>
      )
    }

    try {
      const url = new URL(imageUrl)
      if (url.hostname === 'example.com') {
        return (
          <Image
            src={imageUrl}
            alt="Recipe"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={process.env.NODE_ENV !== 'production'} // Only optimize in production
          />
        )
      }
      return (
        <Image
          src={imageUrl}
          alt="Recipe"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      )
    } catch {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Invalid Image URL
        </div>
      )
    }
  }

  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (authState === 'unauthorized') {
    return null
  }

  return (
    <div className="container mx-auto p-4">
       <div className="mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors group"
        >
          <Home className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="underline-offset-4 hover:underline">Back to home</span>
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-red-600" />
        <h1 className="text-2xl font-bold">Recipe Moderation</h1>
        <Badge variant="outline" className="ml-auto">
          {requests.length} Pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-8 h-8 mx-auto mb-4" />
          <p>No pending recipes to moderate</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardContent className="p-4 grid md:grid-cols-3 gap-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {renderImage(request.imageUrl)}
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">{request.title}</h3>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <p>Submitted by: {request.user?.name || 'Unknown'} ({request.user?.email || 'No email'})</p>
                      <p>Date: {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Ingredients:</h4>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {request.ingredients.map((ing, i) => (
                        <li key={i} className="leading-tight">
                          {ing.amount && `${ing.amount} `}
                          {ing.unit && `${ing.unit} `}
                          {ing.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => handleDecision(request.id, 'APPROVED')}
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                      onClick={() => handleDecision(request.id, 'REJECTED')}
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}