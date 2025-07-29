"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Star, Clock, Heart, Share2, ChevronRight } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/shared/Navbar";
import type { RecipeDetail } from "@/types/recipe";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    imageUrl: string | null;
  };
}

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [servings, setServings] = useState(4);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [expandedInstructions, setExpandedInstructions] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("ingredients");

  useEffect(() => {
    if (!params?.id) return;

    const fetchData = async () => {
      try {
        // Fetch recipe details
        const recipeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipe/${params.id}`);
        if (!recipeRes.ok) throw new Error("Recipe not found");
        const recipeData = await recipeRes.json();
        setRecipe(recipeData);

        // Fetch reviews
        const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/review/${params.id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    checkFavoriteStatus();
  }, [params?.id]);

  const checkFavoriteStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favourite`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        const favorites = await response.json();
        setIsFavorite(favorites.some((fav: any) => fav.recipeId === params.id));
      }
    } catch (error) {
      console.error('Failed to check favorites', error);
    }
  };
  
  const handleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to save favorites');
      router.push('/auth/login');
      return;
    }
  
    setIsFavoriteLoading(true);
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favourite`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId: params.id })
      });
  
      if (response.status === 409) {
        setIsFavorite(true);
        toast.error('This recipe is already in your favorites');
        return;
      }
  
      if (!response.ok) throw new Error(await response.text());
  
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites!');
      await checkFavoriteStatus();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update favorite');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to submit a review');
      router.push('/auth/login');
      return;
    }
  
    if (!newComment || newRating === 0) {
      toast.error('Please provide both a rating and review text');
      return;
    }
  
    setReviewLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/review/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          comment: newComment,
          rating: newRating
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
  
      const newReview = await response.json();
      setReviews([newReview, ...reviews]);
      setNewComment("");
      setNewRating(0);
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const toggleInstruction = (index: number) => {
    setExpandedInstructions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const shareRecipe = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title,
        text: `Check out this delicious recipe: ${recipe?.title}`,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const adjustIngredientAmount = (
    quantity: number,
    original = 4,
    newServ = servings
  ) => {
    const adjusted = (quantity * newServ) / original;
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!recipe) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden group">
        <Image 
          src={recipe.imageUrl || "/placeholder.svg"} 
          alt={recipe.title} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2 bg-red-600 hover:bg-red-700 transition-colors">
                {recipe.category.name}
              </Badge>
              <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{recipe.title}</h1>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center bg-black/30 px-2 py-1 rounded-full">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      onClick={handleFavorite}
                      disabled={isFavoriteLoading}
                    >
                      {isFavoriteLoading ? (
                        <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" />
                      ) : (
                        <Heart 
                          className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} 
                        />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFavorite ? "Remove from favorites" : "Add to favorites"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      onClick={shareRecipe}
                    >
                      <Share2 className="h-5 w-5 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share recipe</TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-amber-100">
            <TabsTrigger 
              value="ingredients" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-colors"
            >
              Ingredients
            </TabsTrigger>
            <TabsTrigger 
              value="instructions" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-colors"
            >
              Instructions
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-colors"
            >
              Reviews ({recipe.reviews?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Ingredients</h2>
                  <div className="flex items-center bg-amber-100 rounded-full px-3 py-1">
                    <span className="mr-2 text-sm font-medium">Servings:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="hover:bg-amber-200"
                    >
                      -
                    </Button>
                    <span className="mx-2 font-medium">{servings}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setServings(servings + 1)}
                      className="hover:bg-amber-200"
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {recipe.ingredients?.[0]?.list?.ingredients?.map((item, i) => (
                    <li 
                      key={i} 
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <span className="font-medium">{item.ingredient}</span>
                      <span className="bg-amber-100 px-2 py-1 rounded-full text-sm">
                        {adjustIngredientAmount(item.quantity)} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructions Tab */}
          <TabsContent value="instructions">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Instructions</h2>
                
                <ol className="space-y-4">
                  {recipe.instructions?.[0]?.step?.instructions?.map((step, index) => (
                    <li key={index}>
                      <button
                        onClick={() => toggleInstruction(index)}
                        className="w-full flex items-start text-left"
                      >
                        <div className="flex items-center mr-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold">
                            {step.step}
                          </div>
                          <ChevronRight 
                            className={`h-5 w-5 ml-2 text-amber-500 transition-transform ${
                              expandedInstructions.includes(index) ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            expandedInstructions.includes(index) ? "text-amber-700" : "text-gray-800"
                          }`}>
                            {step.action.split('\n')[0]}
                          </p>
                          {expandedInstructions.includes(index) && (
                            <p className="mt-2 text-gray-600">
                              {step.action.split('\n').slice(1).join('\n')}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Reviews ({reviews.length})
                  </h2>
                </div>
                
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div 
                        key={review.id} 
                        className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-10">
                            <Image 
                              src={review.user?.imageUrl || "/placeholder.svg"} 
                              alt={review.user?.name || "User"} 
                              fill 
                              className="rounded-full object-cover" 
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{review.user?.name}</p>
                            <div className="flex items-center">
                              <div className="flex">
                                {[...Array(5)].map((_, idx) => (
                                  <Star 
                                    key={idx} 
                                    className={`h-4 w-4 ${
                                      idx < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 pl-13 text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                )}
                
                <div className="mt-8">
                  <h3 className="font-medium mb-3">Add your review</h3>
                  <div className="flex items-center mb-3">
                    <span className="mr-2">Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="Share your thoughts about this recipe..." 
                    className="min-h-[120px]"
                  />
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700 mt-3"
                    onClick={handleSubmitReview}
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}