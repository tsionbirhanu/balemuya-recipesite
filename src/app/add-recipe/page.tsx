"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Upload, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import error from "next/error"

export default function AddRecipePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [ingredients, setIngredients] = useState([{ name: "", amount: "", unit: "" }])
  const [instructions, setInstructions] = useState([""])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get user data and token from localStorage
  const getAuthData = () => {
    if (typeof window === 'undefined') return { token: null, user: null }
    
    try {
      const token = localStorage.getItem('token')
      const userString = localStorage.getItem('user')
      const user = userString ? JSON.parse(userString) : null
      return { token, user }
    } catch (error) {
      console.error("Error reading auth data:", error)
      return { token: null, user: null }
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = ingredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    )
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = instructions.map((instruction, i) => 
      i === index ? value : instruction
    )
    setInstructions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { token, user } = getAuthData()
    
    if (!token || !user) {
      toast.error("Please login to submit recipes")
      router.push("/auth/login")
      return
    }

    // Filter out empty ingredients and instructions
    const validIngredients = ingredients.filter(ing => ing.name.trim() !== "")
    const validInstructions = instructions.filter(inst => inst.trim() !== "")

    if (!title || validIngredients.length === 0) {
      toast.error("Please fill in required fields (title and at least one ingredient)")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipe_request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          imageUrl: imageUrl || null, // Send null if empty
          instructions: validInstructions,
          ingredients: validIngredients,
          userId: user.id // From the decoded token
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit recipe")
      }

      const data = await response.json()
      toast.success("Recipe submitted successfully!")
      router.push("/recipes")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <nav className="bg-white/90 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-800">Balemuya</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Add New Recipe</h1>
          <p className="text-lg text-gray-600">Share your favorite Ethiopian recipe with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ... (rest of your JSX remains exactly the same) ... */}
          {/* Keep all the Card, Input, and Button components exactly as you had them */}
          {/* Only the form submission logic has changed */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="recipe-name">Recipe Name *</Label>
                <Input 
                  id="recipe-name" 
                  placeholder="Enter recipe name..." 
                  className="mt-2" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input 
                  id="image-url" 
                  placeholder="https://example.com/recipe.jpg" 
                  className="mt-2" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Ingredients *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`ingredient-name-${index}`}>Ingredient</Label>
                      <Input
                        id={`ingredient-name-${index}`}
                        placeholder="e.g., Chicken breast"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        className="mt-2"
                        required={index === 0}
                      />
                    </div>
                    <div className="w-24">
                      <Label htmlFor={`ingredient-amount-${index}`}>Amount</Label>
                      <Input
                        id={`ingredient-amount-${index}`}
                        placeholder="2"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="w-24">
                      <Label htmlFor={`ingredient-unit-${index}`}>Unit</Label>
                      <Input
                        id={`ingredient-unit-${index}`}
                        placeholder="cups"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="mb-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addIngredient} className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold text-sm mt-2">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Step ${index + 1}: Describe what to do...`}
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        rows={3}
                      />
                    </div>
                    {instructions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                        className="mt-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addInstruction} className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-red-600 text-center">{error}</div>
          )}

          <div className="flex justify-center">
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Recipe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}