"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedRecipe {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  category: string;
  averageRating: number;
  description?: string;
}

export default function HomePage() {
  const [categories, setCategories] = useState<
    { id: number; name: string; imageUrl?: string }[]
  >([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<FeaturedRecipe[]>([]);
  const [loading, setLoading] = useState({
    categories: true,
    featuredRecipes: true
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);

    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    const fetchFeaturedRecipes = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/featured_recipe`
        );
        if (!res.ok) throw new Error("Failed to fetch featured recipes");
        
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFeaturedRecipes(data.map((recipe: any) => ({
          ...recipe,
          description: recipe.description || "A delicious recipe from our community"
        })));
      } catch (error) {
        console.error("Error fetching featured recipes:", error);
        setFeaturedRecipes([]);
      } finally {
        setLoading(prev => ({ ...prev, featuredRecipes: false }));
      }
    };

    fetchCategories();
    fetchFeaturedRecipes();
  }, []);

  const handleAddRecipeClick = () => {
    if (!isLoggedIn) {
      toast.error("Please login to add recipes");
      router.push("/auth/login");
      return;
    }
    router.push("/add-recipe");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-orange-800/60 z-10" />
        <Image
          src="/ethio.jpg?height=800&width=1200"
          alt="Ethiopian food spread"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Balemuya</h1>
          <p className="text-xl md:text-2xl mb-8 text-orange-100">
            Your next favorite meal starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 text-lg shadow-lg hover:scale-105">
              <Link href="/recipes" className="flex items-center">
                Browse Recipes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-red-600 rounded-full px-8 py-3 text-lg shadow-lg hover:scale-105 bg-transparent"
              onClick={handleAddRecipeClick}>
              Add Your Own
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4" id="categories">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-gray-600">
              Discover Ethiopian classics, global dishes, breakfasts & desserts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading.categories
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="border-0 overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <Skeleton className="h-full w-full rounded-none" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                    </CardContent>
                  </Card>
                ))
              : categories.map((category) => (
                  <Link
                    key={category.id}
                    href={{
                      pathname: "/recipes",
                      query: { category: category.name },
                    }}
                    passHref>
                    <Card className="group cursor-pointer hover:shadow-lg border-0 shadow-lg overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={
                            category.imageUrl ||
                            `/category-images/${category.name.toLowerCase()}.jpg`
                          }
                          alt={category.name}
                          width={400}
                          height={300}
                          className="object-cover"
                          priority
                          unoptimized={process.env.NODE_ENV !== "production"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-xl font-bold">{category.name}</h3>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Featured Recipes
            </h2>
            <p className="text-lg text-gray-600">
              {loading.featuredRecipes
                ? "Loading featured recipes..."
                : featuredRecipes.length > 0
                ? "Hand-picked favorites from our community"
                : "No featured recipes available"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading.featuredRecipes ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="border-0 shadow-lg overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Skeleton className="h-full w-full rounded-none" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : featuredRecipes.length > 0 ? (
              featuredRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <Card className="group cursor-pointer hover:shadow-lg border-0 shadow-lg overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={recipe.imageUrl || "/placeholder.svg"}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-3 right-3 bg-red-600 hover:bg-red-700">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {recipe.averageRating.toFixed(1)}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-800">
                        {recipe.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {recipe.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{recipe.category}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-gray-500">No featured recipes available at this time</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="about" className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              About Balemuya
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Balemuya is a passionate Ethiopian recipe platform made to bring
              traditional and modern dishes to every kitchen, from Addis to the
              world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recipes">
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 text-lg">
                  Explore Recipes
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  className="border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-full px-8 py-3 text-lg bg-transparent">
                  Join Our Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Balemuya started with a simple dream — to keep Ethiopian food
                  culture alive and share it with the world. In 2020, Almaz
                  Tadesse, a homegrown chef from Addis Ababa, wanted to save her
                  grandmother&apos;s special recipes before they were forgotten.
                </p>
                <p>
                  What began as her personal collection turned into something
                  bigger. Families from different corners of Ethiopia and even
                  from abroad started joining in — sharing their own recipes,
                  cooking tips, and stories from their kitchens.
                </p>
                <p>
                  Now, Balemuya is a growing family. It connects old traditions
                  with modern kitchens. Whether you&apos;re in Addis or abroad,
                  you can cook real Ethiopian food, just like we do at home —
                  with love, spice, and culture.
                </p>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/story.jpg"
                alt="Ethiopian cooking tradition"
                width={600}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-orange-100 mb-8 leading-relaxed">
              To preserve, celebrate, and share the authentic flavors of
              Ethiopian cuisine while building a global community of food lovers
              who appreciate the rich cultural heritage behind every dish.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button
                  className="bg-white text-red-600 hover:bg-gray-100 rounded-full px-8 py-3 text-lg font-semibold"
                  onClick={handleAddRecipeClick}>
                  Share Your Recipe
                </Button>
              </Link>
              <Link href="/recipes">
                <Button
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-red-600 rounded-full px-8 py-3 text-lg bg-transparent">
                  Discover Recipes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}