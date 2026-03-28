'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Check, Shield, Zap, Globe, Menu, X, Command } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrollY > 20 ? 'bg-black/80 backdrop-blur-md border-brand-border py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Calendar className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tighter uppercase">Cal.com</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold uppercase tracking-widest text-brand-muted hover:text-white transition-colors">Features</a>
            <a href="#enterprise" className="text-sm font-bold uppercase tracking-widest text-brand-muted hover:text-white transition-colors">Enterprise</a>
            <a href="#pricing" className="text-sm font-bold uppercase tracking-widest text-brand-muted hover:text-white transition-colors">Pricing</a>
            <div className="h-4 w-px bg-brand-border mx-2" />
            <Link href="/dashboard/events" className="text-sm font-bold uppercase tracking-widest text-white hover:opacity-80 transition-opacity">Login</Link>
            <Link href="/dashboard/events" className="btn-primary py-2 px-6 text-xs uppercase tracking-[0.2em] font-bold">
              Sign Up
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-brand-muted hover:text-white">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black border-t border-brand-border p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
            <a href="#features" className="block text-sm font-bold uppercase tracking-widest text-brand-muted" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#enterprise" className="block text-sm font-bold uppercase tracking-widest text-brand-muted" onClick={() => setIsMenuOpen(false)}>Enterprise</a>
            <Link href="/dashboard/events" className="block text-sm font-bold uppercase tracking-widest text-white">Login</Link>
            <Link href="/dashboard/events" className="btn-primary w-full py-4 text-xs uppercase tracking-[0.2em] font-bold">Sign Up</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-[160px]" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/50 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary border border-brand-border rounded-full mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Open Source Scheduling</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Scheduling <br />
            <span className="text-brand-muted">For Everyone.</span>
          </h1>

          <p className="text-lg md:text-xl text-brand-muted max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Cal.com is the open-source Calendly alternative. 
            Connect all your calendars and let people book meetings with you easily.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/dashboard/events" className="btn-primary px-10 py-5 text-sm uppercase tracking-[0.2em] font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all">
              Claim your username
            </Link>
            <button className="btn-secondary px-10 py-5 text-sm uppercase tracking-[0.2em] font-bold">
              Learn More
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-24 pt-10 border-t border-brand-border/50 animate-in fade-in duration-1000 delay-500">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-muted mb-8">Trusted by innovators worldwide</p>
            <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              {['Vercel', 'Linear', 'GitHub', 'OpenAI', 'Cal.com'].map(logo => (
                <span key={logo} className="font-bold text-2xl tracking-tighter uppercase italic">{logo}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-32 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-10 bg-black border border-brand-border rounded-3xl hover:border-white transition-colors duration-500 group">
              <div className="w-12 h-12 bg-brand-secondary rounded-xl flex items-center justify-center mb-8 border border-brand-border group-hover:rotate-12 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 text-white">Fast as light</h3>
              <p className="text-brand-muted font-medium leading-relaxed">Book a meeting in under 10 seconds. Our interface is optimized for speed and simplicity.</p>
            </div>

            <div className="p-10 bg-black border border-brand-border rounded-3xl hover:border-white transition-colors duration-500 group">
              <div className="w-12 h-12 bg-brand-secondary rounded-xl flex items-center justify-center mb-8 border border-brand-border group-hover:rotate-12 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 text-white">Global Scale</h3>
              <p className="text-brand-muted font-medium leading-relaxed">Automatic timezone detection ensures neither you nor your guest ever miss a call.</p>
            </div>

            <div className="p-10 bg-black border border-brand-border rounded-3xl hover:border-white transition-colors duration-500 group">
              <div className="w-12 h-12 bg-brand-secondary rounded-xl flex items-center justify-center mb-8 border border-brand-border group-hover:rotate-12 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 text-white">Secure by default</h3>
              <p className="text-brand-muted font-medium leading-relaxed">Your data belongs to you. We're open source and privacy-focused from the core.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative p-2 bg-brand-border rounded-[40px] shadow-[0_0_100px_rgba(255,255,255,0.05)]">
            <div className="bg-black rounded-[32px] overflow-hidden border border-brand-border relative aspect-video">
              <div className="absolute inset-0 flex items-center justify-center bg-brand-secondary">
                 <div className="text-center space-y-6 animate-pulse">
                    <Command size={64} className="mx-auto text-brand-muted" />
                    <p className="text-xs font-bold uppercase tracking-[0.5em] text-brand-muted">Loading Dashboard Preview</p>
                 </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-brand-border bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-sm">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-2xl tracking-tighter uppercase">Cal.com</span>
            </Link>
            <p className="text-brand-muted font-medium text-sm leading-relaxed">
              The open-source scheduling infrastructure for the internet. 
              Scheduling for everyone.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-20">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Product</h4>
              <ul className="space-y-2 text-sm font-bold text-brand-muted">
                <li><a href="#" className="hover:text-white transition-colors uppercase tracking-tight">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors uppercase tracking-tight">Teams</a></li>
                <li><a href="#" className="hover:text-white transition-colors uppercase tracking-tight">App Store</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Company</h4>
              <ul className="space-y-2 text-sm font-bold text-brand-muted">
                <li><a href="#" className="hover:text-white transition-colors uppercase tracking-tight">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors uppercase tracking-tight">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors uppercase tracking-tight">Privacy</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Legal</h4>
              <ul className="space-y-2 text-sm font-bold text-brand-muted">
                <li><a href="#" className="hover:text-white transition-colors uppercase tracking-tight">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors uppercase tracking-tight">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-brand-border flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-muted">© 2026 Cal.com Clone</p>
          <div className="flex gap-4">
            <div className="w-4 h-4 bg-brand-muted rounded-full opacity-20" />
            <div className="w-4 h-4 bg-brand-muted rounded-full opacity-20" />
            <div className="w-4 h-4 bg-brand-muted rounded-full opacity-20" />
          </div>
        </div>
      </footer>
    </div>
  );
}
