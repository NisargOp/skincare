'use client'
import React, { useState, useEffect } from 'react';
import { Sparkles, Camera, MessageCircle, Zap, ChevronRight, Star, CheckCircle } from 'lucide-react';

export default function SkincareLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <a href="#how" className="text-gray-600 hover:text-pink-600 transition-colors">How it Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-pink-600 transition-colors">Reviews</a>
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

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
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