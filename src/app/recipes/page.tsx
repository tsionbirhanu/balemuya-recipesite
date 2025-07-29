"use client";

import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {  Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import type { Recipe } from "../../../types/recipe";

export default function BrowseRecipesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from backend
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            mode: "cors",
          }
        );

        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  // Set selectedCategory from URL if present
  // Combine into one effect
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "all";
    setSelectedCategory(urlCategory);

    async function fetchRecipes() {
      setLoading(true);
      setError(null);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/recipe`;
      if (urlCategory !== "all") {
        url += `?category=${encodeURIComponent(urlCategory)}`;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch recipes");
        const data: Recipe[] = await res.json();
        setRecipes(data);
      } catch (err: any) {
        setError(
          err.message || "Something went wrong. Please try again later."
        );
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [searchParams]);

  useEffect(() => {
    // Debug: see what recipes are fetched
    console.log("Fetched recipes:", recipes);
  }, [recipes]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const params = new URLSearchParams(window.location.search);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.replace(`/recipes?${params.toString()}`);
  };

  // Local search filter (frontend only)
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Browse Recipes
          </h1>
          <p className="text-lg text-gray-600">
            Explore global flavors made by Ethiopians
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-gray-300 placeholder:text-gray-500 text-gray-800 bg-white"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-full">
                  <SelectValue placeholder="Select Category">
                    {selectedCategory === "all"
                      ? "All Categories"
                      : categories.find((c) => c.name === selectedCategory)
                          ?.name || selectedCategory}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">
                    All Categories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-600">
            {loading
              ? "Loading recipes..."
              : `Showing ${filteredRecipes.length} recipe${
                  filteredRecipes.length !== 1 ? "s" : ""
                }`}
          </p>
        </div>
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <span className="text-lg text-gray-500">Loading recipes...</span>
          </div>
        )}
        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center py-16">
            <span className="text-4xl mb-4">😢</span>
            <span className="text-lg text-red-600">{error}</span>
          </div>
        )}
        {/* Empty State */}
        {!loading && !error && filteredRecipes.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <span className="text-4xl mb-4">🍽️</span>
            <span className="text-lg text-gray-600">
              No recipes found. Try a different search or category!
            </span>
          </div>
        )}
        {/* Recipes Grid */}
        {!loading && !error && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredRecipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                <Card className="group cursor-pointer hover:shadow-lg border-0 shadow-lg overflow-hidden h-full">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={recipe.imageUrl || "/placeholder.svg"}
                      alt={recipe.title}
                      width={400} // Add explicit width
                      height={300} // Add explicit height
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority
                      unoptimized={process.env.NODE_ENV !== "production"} // Disable optimization in development
                    />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-gray-800">
                        {recipe.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                      <Badge variant="outline" className="w-fit">
                        {recipe.category?.name || "Uncategorized"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
