import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, useMotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Truck, Shield, Clock, MapPin, ChevronRight, Star, Globe, TrendingUp, Package, Users, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'
        }`}
    >
      <div className="absolute bottom-0 left-0 w-full h-8 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 w-full h-[1px] bg-white/10" />
        <motion.div
          initial={{ x: "-10%" }}
          animate={{ x: "110vw" }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[1px] left-0 flex items-center gap-1"
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-orange-500/50" />
          <Truck className="w-5 h-5 text-orange-500/80 pb-1" />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 flex items-center justify-between relative z-10">
        <Link to="/" className="text-2xl font-black text-white flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Truck className="text-white w-6 h-6" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            TruckSuvidha
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Home</Link>
          <Link to="/load-board" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Find Loads</Link>
          <Link to="/truck-board" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Find Trucks</Link>
          <Link to="/contact" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Contact</Link>
          <Link to="/login" className="text-sm font-medium text-white hover:text-orange-500 transition-colors">Login</Link>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-white text-slate-900 rounded-full text-sm font-bold hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-lg shadow-white/10 hover:shadow-orange-500/20"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          style={{ y: y1, opacity }}
          className="text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-white/80">#1 Logistics Network in India</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl sm:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight"
          >
            Move Freight
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">
              Without Limits.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-white/60 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Connect with 50,000+ verified transporters instantly.
            No phone calls, no haggling—just seamless logistics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
          >
            <Link
              to="/register"
              className="group relative px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            </Link>
            <Link to="/demo" className="px-8 py-4 rounded-2xl font-bold text-lg text-white border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1" />
              </div>
              Watch Demo
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: y2, opacity }}
          className="relative hidden lg:block"
        >
          {/* Abstract Truck Illustration */}
          <div className="relative w-full aspect-square max-w-[600px] mx-auto">
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 2, -1, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            >
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop"
                alt="Truck"
                className="w-full h-full object-cover rounded-[3rem] shadow-2xl shadow-purple-500/30 mask-image-gradient"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}
              />
              <div className="absolute inset-0 rounded-[3rem] ring-1 ring-white/20" />
            </motion.div>

            {/* Floating Elements */}
            <FloatingCard
              icon={<Shield className="text-emerald-400" />}
              title="Verified"
              subtitle="100% Safe"
              className="absolute -top-10 -right-10"
              delay={1}
            />
            <FloatingCard
              icon={<Clock className="text-orange-400" />}
              title="Fast"
              subtitle="Instant Quotes"
              className="absolute bottom-10 -left-10"
              delay={1.5}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-white/40 text-sm uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
      </motion.div>
    </section>
  );
};

const FloatingCard = ({ icon, title, subtitle, className, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-xl flex items-center gap-4 ${className}`}
  >
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <div className="font-bold text-white">{title}</div>
      <div className="text-xs text-white/50">{subtitle}</div>
    </div>
  </motion.div>
);

const MovingTrucksSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x1 = useTransform(scrollYProgress, [0, 1], [-1000, 1000]);
  const x2 = useTransform(scrollYProgress, [0, 1], [1000, -1000]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const backgroundX = useTransform(mouseX, [0, 1], [40, -40]);
  const backgroundY = useTransform(mouseY, [0, 1], [40, -40]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="py-32 bg-slate-950 overflow-hidden relative border-y border-white/5 perspective-1000 group"
    >
      {/* Animated Grid Background with Parallax */}
      <motion.div
        style={{ x: backgroundX, y: backgroundY }}
        className="absolute inset-[-10%] w-[120%] h-[120%] bg-slate-950"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />
      </motion.div>

      {/* Connection Nodes Layer - "Constellation Effect" */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-orange-500/20 blur-xl"
            initial={{ opacity: 0.2, scale: 1 }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.2, 1],
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 mb-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-bold tracking-widest uppercase mb-4">
            Global Infrastructure
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            Connecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500 animate-gradient">Every</span> Corner
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-lg leading-relaxed">
            Our intelligent logistics network adapts in real-time to traffic, weather, and demand.
          </p>
        </motion.div>
      </div>

      {/* High Tech Highways */}
      <div className="relative w-full flex flex-col gap-12 perspective-500">

        {/* Highway 1 - Right to Left */}
        <div className="relative h-40 w-full flex items-center">
          {/* Road Surface */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/10 to-transparent skew-x-12 blur-sm" />
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          {/* Moving Trucks Container */}
          <motion.div style={{ x: x1 }} className="absolute left-0 flex items-center gap-64 w-[200vw]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative group/truck">
                {/* Headlights Beam */}
                <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-48 h-24 bg-gradient-to-l from-orange-500/0 via-orange-400/10 to-orange-300/30 skew-x-[30deg] blur-md rounded-l-full opacity-60 group-hover/truck:opacity-100 transition-opacity" />

                {/* Truck Body */}
                <div className="relative z-10 transform transition-transform duration-300 group-hover/truck:scale-110">
                  <div className="flex flex-col items-center">
                    <Truck className="w-20 h-20 text-white fill-slate-950 stroke-[1.5]" />
                    {/* Glowing Underbody */}
                    <div className="w-20 h-4 bg-orange-500/50 blur-lg rounded-full -mt-2 opacity-60" />
                  </div>
                </div>

                {/* Trailing Speed Lines */}
                <div className="absolute top-1/2 left-20 w-32 h-[1px] bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
                <div className="absolute top-1/3 left-24 w-16 h-[1px] bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
              </div>
            ))}
          </motion.div>
        </div>


      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Pan-India Network",
      desc: "Access to 50,000+ trucks across 500+ cities",
      color: "from-blue-400 to-cyan-400"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verified Partners",
      desc: "Every transporter is KYC verified for safety",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Cost Effective",
      desc: "Save up to 30% with competitive bidding",
      color: "from-emerald-400 to-green-400"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-time Tracking",
      desc: "GPS tracking for all your active shipments",
      color: "from-orange-400 to-red-400"
    }
  ];

  return (
    <section className="py-32 bg-slate-950 relative">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative p-8 rounded-3xl bg-slate-900 border border-white/5 hover:border-white/20 transition-all duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`} />
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
      <p className="text-white/50 leading-relaxed">{feature.desc}</p>
    </motion.div>
  );
};

const ParallaxStats = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 1]);

  return (
    <section ref={ref} className="py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-900/20 to-slate-950" />

      <motion.div
        style={{ scale, opacity }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-12 lg:p-24 border border-white/10 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-16">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Industry Leaders</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { val: "50K+", label: "Transporters" },
              { val: "1M+", label: "Tons Moved" },
              { val: "500+", label: "Cities" },
              { val: "4.8/5", label: "User Rating" }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                  {stat.val}
                </div>
                <div className="text-sm font-bold text-orange-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const HowItWorksSection = () => {
  const containerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsDesktop(window.innerWidth >= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth spring animation for all transforms
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Line path animation (0 to 1 for SVG pathLength)
  const pathLength = useTransform(smoothProgress, [0.05, 0.35, 0.75], [0, 0.5, 1]);

  // Step animations for Desktop
  const step1Opacity = useTransform(smoothProgress, [0.05, 0.12], [0, 1]);
  const step1Scale = useTransform(smoothProgress, [0.05, 0.12], [0.6, 1]);
  const step1Y = useTransform(smoothProgress, [0.05, 0.12], [40, 0]);

  const step2Opacity = useTransform(smoothProgress, [0.28, 0.38], [0, 1]);
  const step2Scale = useTransform(smoothProgress, [0.28, 0.38], [0.6, 1]);
  const step2Y = useTransform(smoothProgress, [0.28, 0.38], [40, 0]);

  const step3Opacity = useTransform(smoothProgress, [0.65, 0.75], [0, 1]);
  const step3Scale = useTransform(smoothProgress, [0.65, 0.75], [0.6, 1]);
  const step3Y = useTransform(smoothProgress, [0.65, 0.75], [40, 0]);

  // Flare glow intensity based on line movement
  const flareOpacity = useTransform(smoothProgress, [0.05, 0.10, 0.75, 0.80], [0, 1, 1, 0.3]);
  const flareScale = useTransform(smoothProgress, [0.05, 0.12], [0.5, 1]);
  const flareProgress = useTransform(smoothProgress, [0.05, 0.35, 0.75], [0, 0.5, 1]);
  const flareLeft = useTransform(flareProgress, [0, 0.5, 1], ['7.5%', '50%', '92.5%']);
  const flareTop = useTransform(flareProgress, [0, 0.25, 0.5, 0.75, 1], ['50%', '25%', '50%', '75%', '50%']);

  const steps = [
    {
      id: 1,
      title: "Post Your Load",
      desc: "Submit your transport requirements with complete details in just 2 minutes",
      icon: <Package className="w-8 h-8" />,
      color: "blue",
      opacity: step1Opacity,
      scale: step1Scale,
      y: step1Y
    },
    {
      id: 2,
      title: "Receive Quotes",
      desc: "Get instant competitive quotes from verified transporters",
      icon: <Clock className="w-8 h-8" />,
      color: "purple",
      opacity: step2Opacity,
      scale: step2Scale,
      y: step2Y
    },
    {
      id: 3,
      title: "Track Shipment",
      desc: "Monitor your shipment in real-time until successful delivery",
      icon: <MapPin className="w-8 h-8" />,
      color: "pink",
      opacity: step3Opacity,
      scale: step3Scale,
      y: step3Y
    }
  ];

  return (
    <section
      ref={containerRef}
      className={`relative bg-slate-950 ${isDesktop ? 'h-[400vh]' : 'py-20 min-h-screen'}`}
    >
      <div className={`${isDesktop ? 'sticky top-0 h-screen flex flex-col justify-center overflow-hidden' : 'relative px-4'}`}>

        {/* Background Ambience */}
        <div className="absolute inset-0 bg-slate-950 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
          {/* Dynamic glow - only visible on desktop scroll */}
          {isDesktop && (
            <motion.div
              style={{ opacity: flareOpacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen"
            />
          )}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <span
              className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4"
            >
              Simple Process
            </span>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-6"
            >
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Works</span>
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Desktop Only: Curved Connecting Line */}
            {isDesktop && (
              <div className="absolute top-[3rem] left-0 w-full hidden md:block" style={{ height: '60px' }}>
                <svg
                  viewBox="0 0 800 60"
                  fill="none"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  style={{ overflow: 'visible' }}
                >
                  <path
                    d="M 60 30 
                       C 150 10, 250 50, 400 30 
                       C 550 10, 650 50, 740 30"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <motion.path
                    d="M 60 30 
                       C 150 10, 250 50, 400 30 
                       C 550 10, 650 50, 740 30"
                    stroke="url(#lineGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                      pathLength: pathLength,
                      filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))'
                    }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>

                <motion.div
                  style={{
                    opacity: flareOpacity,
                    scale: flareScale,
                    left: flareLeft,
                    top: flareTop
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <div className="absolute -inset-6 bg-white/20 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute -inset-3 bg-white/40 rounded-full blur-lg" />
                  <div className="relative w-5 h-5 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,1),0_0_50px_rgba(168,85,247,0.9)]" />
                </motion.div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative pt-0 md:pt-8">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  {...(isDesktop ? {
                    style: { opacity: step.opacity, scale: step.scale, y: step.y }
                  } : {
                    initial: { opacity: 0, y: 50 },
                    whileInView: { opacity: 1, y: 0 },
                    transition: { duration: 0.6, delay: idx * 0.2 },
                    viewport: { once: true, margin: "-50px" }
                  })}
                  className="relative flex flex-col items-center text-center group"
                >
                  {/* Step Number Badge */}
                  <div className={`
                      w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br mb-6 md:mb-8 flex items-center justify-center relative z-10
                      shadow-[0_0_30px_rgba(59,130,246,0.2)]
                      ${step.color === 'blue' ? 'from-blue-500 to-blue-600 shadow-blue-500/30' : ''}
                      ${step.color === 'purple' ? 'from-purple-500 to-purple-600 shadow-purple-500/30' : ''}
                      ${step.color === 'pink' ? 'from-pink-500 to-pink-600 shadow-pink-500/30' : ''}
                    `}
                  >
                    <span className="text-3xl md:text-4xl font-black text-white">{step.id}</span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{step.title}</h3>
                  <p className="text-white/50 leading-relaxed max-w-xs text-sm md:text-base">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CallToAction = () => {
  return (
    <section className="py-32 bg-slate-950 text-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] mix-blend-screen" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Ready to Streamline Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-600">Logistics?</span>
          </h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Join the fastest growing logistics network in India today.
            Get instant quotes, real-time tracking, and verified transporters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/register"
              className="px-10 py-5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl text-white font-bold text-xl hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300"
            >
              Get Started Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 overflow-x-clip selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />
      <HeroSection />
      <MovingTrucksSection />
      <FeaturesSection />
      <ParallaxStats />
      <HowItWorksSection key="how-it-works-fixed" />
      <CallToAction />
      <Footer />
    </div>
  );
}
