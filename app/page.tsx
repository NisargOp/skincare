'use client'
import React, { useState, useEffect } from 'react';
import { Sparkles, Camera, MessageCircle, Zap, ChevronRight, Star, CheckCircle, Filter, Search, ExternalLink, TrendingUp } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  brand: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  url: string;
  category: string;
  skinType: string[];
  concern: string[];
  featured?: boolean;
};

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Foaming Facial Cleanser",
    brand: "CeraVe",
    price: "$14.99",
    rating: 4.6,
    reviews: 12450,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    url: "https://www.cerave.com/skincare/cleansers/foaming-facial-cleanser",
    category: "Cleanser",
    skinType: ["oily", "combination", "normal"],
    concern: ["acne", "pores"],
    featured: true
  },
  {
    id: "2",
    name: "Hyaluronic Acid 2% + B5",
    brand: "The Ordinary",
    price: "$7.99",
    rating: 4.4,
    reviews: 8920,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    url: "https://theordinary.com/en-us/hyaluronic-acid-2-b5-hydration-support-serum-100419.html",
    category: "Serum",
    skinType: ["all"],
    concern: ["dryness", "fine-lines"],
    featured: true
  },
  {
    id: "3",
    name: "Anthelios UV Melt-in Milk SPF 60",
    brand: "La Roche-Posay",
    price: "$35.99",
    rating: 4.7,
    reviews: 15630,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",
    url: "https://www.laroche-posay.us/our-products/sun/face-sunscreen/anthelios-melt-in-milk-sunscreen-spf-60-3606000437449.html",
    category: "Sunscreen",
    skinType: ["all"],
    concern: ["sun-protection"],
    featured: true
  },
  {
    id: "4",
    name: "Daily Moisturizing Lotion",
    brand: "CeraVe",
    price: "$16.99",
    rating: 4.6,
    reviews: 18920,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    url: "https://www.cerave.com/skincare/moisturizers/daily-moisturizing-lotion",
    category: "Moisturizer",
    skinType: ["dry", "normal", "sensitive"],
    concern: ["dryness", "sensitivity"]
  },
  {
    id: "5",
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    price: "$5.99",
    rating: 4.3,
    reviews: 11240,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    url: "https://theordinary.com/en-us/niacinamide-10-zinc-1-oil-control-serum-100436.html",
    category: "Serum",
    skinType: ["oily", "combination"],
    concern: ["pores", "acne", "texture"]
  },
  {
    id: "6",
    name: "C E Ferulic",
    brand: "SkinCeuticals",
    price: "$169.00",
    rating: 4.8,
    reviews: 5680,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",
    url: "https://www.skinceuticals.com/c-e-ferulic-635494263008.html",
    category: "Serum",
    skinType: ["all"],
    concern: ["aging", "fine-lines", "brightness"],
    featured: true
  },
  {
    id: "7",
    name: "Skin Perfecting 2% BHA Liquid",
    brand: "Paula's Choice",
    price: "$32.00",
    rating: 4.5,
    reviews: 9870,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    url: "https://www.paulaschoice.com/skin-perfecting-2pct-bha-liquid-exfoliant/201.html",
    category: "Treatment",
    skinType: ["oily", "combination", "acne-prone"],
    concern: ["acne", "pores", "texture"]
  },
  {
    id: "8",
    name: "Retinol 0.5% in Squalane",
    brand: "The Ordinary",
    price: "$9.99",
    rating: 4.2,
    reviews: 7450,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    url: "https://theordinary.com/en-us/retinol-0-5-in-squalane-age-support-serum-100383.html",
    category: "Treatment",
    skinType: ["normal", "dry"],
    concern: ["aging", "fine-lines", "texture"]
  }
];

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-pink-300 hover:shadow-xl transition-all duration-300">
      {product.featured && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          TRENDING
        </div>
      )}
      <div className="aspect-square bg-gray-50 overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="text-xs text-gray-500 mb-1 font-medium">{product.brand}</div>
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{product.rating}</span>
          </div>
          <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-pink-600">{product.price}</div>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all flex items-center gap-1"
          >
            View
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SkincareLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSkinType, setSelectedSkinType] = useState<string>("all");
  const [selectedConcern, setSelectedConcern] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = ["All", "Cleanser", "Serum", "Moisturizer", "Sunscreen", "Treatment"];
  const skinTypes = [
    { value: "all", label: "All Skin Types" },
    { value: "oily", label: "Oily" },
    { value: "dry", label: "Dry" },
    { value: "combination", label: "Combination" },
    { value: "sensitive", label: "Sensitive" },
    { value: "normal", label: "Normal" }
  ];
  const concerns = [
    { value: "all", label: "All Concerns" },
    { value: "acne", label: "Acne" },
    { value: "aging", label: "Anti-Aging" },
    { value: "dryness", label: "Dryness" },
    { value: "pores", label: "Large Pores" },
    { value: "brightness", label: "Brightness" },
    { value: "sensitivity", label: "Sensitivity" }
  ];

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSkinType = selectedSkinType === "all" || 
      product.skinType.includes(selectedSkinType) || 
      product.skinType.includes("all");
    const matchesConcern = selectedConcern === "all" || 
      product.concern.includes(selectedConcern);
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSkinType && matchesConcern && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              GlowAI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-pink-600 transition-colors">Features</a>
            <a href="#products" className="text-gray-600 hover:text-pink-600 transition-colors">Products</a>
            <a href="#how" className="text-gray-600 hover:text-pink-600 transition-colors">How it Works</a>
            <button className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all">
              <a href="/signup">Get Started</a>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full text-pink-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Skincare Revolution
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Your Personal
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Skincare Expert
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Get personalized skincare advice, product recommendations, and routine optimization powered by advanced AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group">
                Start Your Journey
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg hover:shadow-lg transition-all border-2 border-gray-200">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl p-8 hover:scale-105 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Skin Analysis</h3>
              <p className="text-gray-600 mb-4">Upload a photo and get instant AI-powered skin analysis with personalized insights.</p>
              <div className="flex items-center gap-2 text-pink-600 font-medium">
                Try it now
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl p-8 hover:scale-105 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">AI Chat Assistant</h3>
              <p className="text-gray-600 mb-4">Ask anything about skincare and get expert advice tailored to your unique needs.</p>
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                Start chatting
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-8 hover:scale-105 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Smart Routines</h3>
              <p className="text-gray-600 mb-4">Build optimized skincare routines based on your skin type, concerns, and goals.</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                Create routine
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Product Selection Section */}
      <section id="products" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-600 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Curated Selection
            </div>
            <h2 className="text-5xl font-bold mb-4">
              Discover Your Perfect <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes your preferences to recommend the best skincare products for you
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none text-lg"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-6">
            {/* Category Pills */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-600">CATEGORY</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Smart Filters */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">SKIN TYPE</label>
                <select
                  value={selectedSkinType}
                  onChange={(e) => setSelectedSkinType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none font-medium"
                >
                  {skinTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">SKIN CONCERN</label>
                <select
                  value={selectedConcern}
                  onChange={(e) => setSelectedConcern(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none font-medium"
                >
                  {concerns.map((concern) => (
                    <option key={concern.value} value={concern.value}>
                      {concern.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-gray-600 font-medium">
            Showing <span className="text-pink-600 font-bold">{filteredProducts.length}</span> products
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">GlowAI?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of skincare with cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Sparkles, title: "Personalized Analysis", desc: "Advanced AI analyzes your unique skin characteristics" },
              { icon: Zap, title: "Instant Results", desc: "Get recommendations in seconds, not weeks" },
              { icon: CheckCircle, title: "Expert Validated", desc: "All advice verified by dermatology professionals" },
              { icon: Star, title: "Track Progress", desc: "Monitor your skin's improvement over time" }
            ].map((feature, i) => (
              <div key={i} className="flex gap-6 p-8 rounded-2xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-lg">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Skin?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands who've discovered their perfect skincare routine
            </p>
            <button className="px-10 py-5 bg-white text-pink-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p className="mb-2">© 2025 GlowAI. All rights reserved.</p>
          <p className="text-sm">Transforming skincare with artificial intelligence</p>
        </div>
      </footer>
    </div>
  );
}