import { useState, useEffect } from 'react';
import { Play, Clock, List, Zap, ArrowRight, Youtube, Timer, BarChart3, Monitor, ExternalLink, ChevronDown} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
export const WorkoutTrainerLanding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  useEffect(() => {
    setIsVisible(true);
  }, []);
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }
  const steps = [
    {
      title: "Paste Video URLs",
      description: "Add your favorite workout videos from YouTube or other platforms",
      icon: <Youtube className="w-8 h-8 text-red-500" />,
      detail: "Simply copy and paste URLs from your favorite fitness channels"
    },
    {
      title: "Set Custom Durations",
      description: "Configure play time and rest intervals for each video",
      icon: <Timer className="w-8 h-8 text-cyan-500" />,
      detail: "Perfect for HIIT, strength training, or any timed workout routine"
    },
    {
      title: "Start Your Workout",
      description: "Let the app handle video transitions while you focus on exercising",
      icon: <Play className="w-8 h-8 text-emerald-500" />,
      detail: "Automatic switching with countdown timers and audio cues"
    },
    {
      title: "Track Your Progress",
      description: "View workout summaries and save your favorite playlists",
      icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
      detail: "See total sets, duration, and save playlists for future workouts"
    }
  ];

  const features = [
    {
      icon: <List className="w-6 h-6 text-cyan-500" />,
      title: "Smart Playlist Management",
      description: "Create and save custom workout playlists with multiple videos"
    },
    {
      icon: <Clock className="w-6 h-6 text-emerald-500" />,
      title: "Flexible Timing Control",
      description: "Set custom play durations and rest intervals for each exercise"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Seamless Transitions",
      description: "Automatic video switching with smooth countdown animations"
    },
    {
      icon: <Monitor className="w-6 h-6 text-orange-500" />,
      title: "Responsive Design",
      description: "Works perfectly on desktop, tablet, and mobile devices"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className={`container mx-auto px-6 py-6 relative z-10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <nav className="flex items-center justify-between">
          {/* 左侧 Logo 区域 */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Workout Trainer
            </h1>
          </div>

          {/* 中间导航区域 */}
          <div className="flex items-center space-x-4">
            {/* 语言切换 */}
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl px-3 py-2 text-white text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 hover:border-cyan-500/50"
            >
              <option value="zh" className="bg-gray-800 text-white">中文</option>
              <option value="en" className="bg-gray-800 text-white">English</option>
            </select>

            {/* 拉伸倒计时按钮 */}
            <button
              onClick={() => navigate({ to: '/stretchCountdown' })}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-300 to-red-300 hover:from-orange-400 hover:to-red-400 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
            >
              <Timer className="w-4 h-4" />
              <span>{t('stretchCountdown')}</span>
            </button>
            {/* 右侧启动应用按钮 */}
            <a
              href="./playlist"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 text-white"
            >
              <span>Start</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </nav>
      </header>
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center relative z-10">
        <div className={`max-w-4xl mx-auto transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent leading-tight">
            Automate Your Workout Videos
          </h2>
          <p className={`text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Focus on moving, not managing. Create seamless workout playlists with automatic video switching and custom timing.
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <a
              href="./playlist"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
            >
              <Play className="w-5 h-5" />
              <span>Start Your Workout</span>
            </a>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-emerald-400 hover:bg-emerald-400 hover:bg-opacity-10 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <span>Learn How</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            How It Works
          </h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get started in minutes with our simple 4-step process
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Step Navigation */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 hover:scale-105 ${currentStep === index
                    ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 shadow-lg shadow-cyan-500/25'
                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                    }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="transform transition-all duration-300 hover:scale-110">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                      <p className="text-gray-300">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step Details */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="transform transition-all duration-300 hover:scale-110">
                  {steps[currentStep].icon}
                </div>
                <div>
                  <h4 className="text-2xl font-bold">{steps[currentStep].title}</h4>
                  <span className="text-cyan-400 font-medium">Step {currentStep + 1} of {steps.length}</span>
                </div>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                {steps[currentStep].detail}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Powerful Features
          </h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need for an uninterrupted workout experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div className="mb-4 transform transition-all duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                {feature.title}
              </h4>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center relative z-10">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-3xl p-12 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-500 hover:scale-105">
          <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Workouts?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of fitness enthusiasts who have streamlined their workout routine
          </p>
          <a
            href="./playlist"
            rel="noopener noreferrer"
            className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center space-x-2 hover:scale-105 shadow-lg"
          >
            <Play className="w-5 h-5" />
            <span>Launch Workout Trainer</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-800 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-400">Workout Video Trainer</span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://workout-play.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:scale-110 transform"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <span className="text-gray-400 text-sm">© 2024 Workout Trainer. Built with ❤️ for fitness enthusiasts.</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};