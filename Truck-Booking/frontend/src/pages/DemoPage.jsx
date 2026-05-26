
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const DemoPage = () => {
    const [activeTab, setActiveTab] = useState('customer');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const CustomerDemo = () => (
        <motion.div
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: 20 }}
            variants={containerVariants}
            className="space-y-8"
        >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="p-2 bg-blue-500 rounded-xl bg-opacity-20 text-blue-300">🏢</span>
                    For Customers: Shipper Journey
                </h3>

                <div className="grid md:grid-cols-5 gap-4">
                    {/* Step 1: Post a Load */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-blue-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">1️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Post Load</h4>
                        <p className="text-slate-300 text-sm">Enter cargo details, pay a small booking fee, and your load goes live.</p>
                    </motion.div>

                    {/* Step 2: Review Quotes */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-blue-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">2️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Review Quotes</h4>
                        <p className="text-slate-300 text-sm">Drivers submit their price quotes. Compare rates and driver profiles.</p>
                    </motion.div>

                    {/* Step 3: Accept Quote */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-blue-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">3️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Accept Quote</h4>
                        <p className="text-slate-300 text-sm">Choose the best quote and the driver is automatically assigned.</p>
                    </motion.div>

                    {/* Step 4: Track Delivery */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-blue-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">4️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Track Delivery</h4>
                        <p className="text-slate-300 text-sm">Real-time tracking as your goods move from pickup to delivery.</p>
                    </motion.div>

                    {/* Step 5: Pay & Complete */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-blue-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">5️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Pay & Complete</h4>
                        <p className="text-slate-300 text-sm">Pay remaining amount (Quote - Booking Fee) via Razorpay.</p>
                    </motion.div>
                </div>

                {/* Payment info box */}
                <div className="mt-6 p-4 bg-blue-900/30 rounded-xl border border-blue-400/20">
                    <h4 className="text-md font-semibold text-blue-200 mb-2 flex items-center gap-2">
                        💰 How Payment Works
                    </h4>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span>Pay small booking fee when posting</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span>Driver quotes their price</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span>Pay (Quote - Booking Fee) after delivery</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-500/30">
                    <h4 className="text-lg font-semibold text-blue-200 mb-2">💡 Pro Tip</h4>
                    <p className="text-slate-300">Compare quotes from multiple drivers to get the best rate! Driver ratings and delivery time estimates help you make informed decisions.</p>
                </div>
            </div>

            <div className="flex justify-center">
                <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transform hover:scale-105 transition duration-300 flex items-center gap-2">
                    Start Shipping Now <span className="text-xl">→</span>
                </Link>
            </div>
        </motion.div>
    );

    const DriverDemo = () => (
        <motion.div
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: 20 }}
            variants={containerVariants}
            className="space-y-8"
        >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="p-2 bg-green-500 rounded-xl bg-opacity-20 text-green-300">🚚</span>
                    For Drivers: Carrier Journey
                </h3>

                <div className="grid md:grid-cols-5 gap-4">
                    {/* Step 1: Browse Loads */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-green-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">1️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Browse Loads</h4>
                        <p className="text-slate-300 text-sm">Find available loads matching your route and truck capacity on the Load Board.</p>
                    </motion.div>

                    {/* Step 2: Submit Quote */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-green-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">2️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Submit Quote</h4>
                        <p className="text-slate-300 text-sm">Enter your price quote for the job. Add estimated delivery time.</p>
                    </motion.div>

                    {/* Step 3: Get Assigned */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-green-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">3️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Get Assigned</h4>
                        <p className="text-slate-300 text-sm">If customer accepts your quote, you're assigned to the load!</p>
                    </motion.div>

                    {/* Step 4: Deliver */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-green-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">4️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Deliver</h4>
                        <p className="text-slate-300 text-sm">Pickup cargo, update status as you go, and deliver safely.</p>
                    </motion.div>

                    {/* Step 5: Get Paid */}
                    <motion.div variants={itemVariants} className="bg-slate-800/50 p-5 rounded-2xl border border-white/10 hover:border-green-400/50 transition duration-300 group">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">5️⃣</div>
                        <h4 className="text-lg font-semibold text-white mb-2">Get Paid</h4>
                        <p className="text-slate-300 text-sm">Customer pays your quoted amount. Fast & secure payments!</p>
                    </motion.div>
                </div>

                {/* Quoting info box */}
                <div className="mt-6 p-4 bg-green-900/30 rounded-xl border border-green-400/20">
                    <h4 className="text-md font-semibold text-green-200 mb-2 flex items-center gap-2">
                        💼 How Quoting Works
                    </h4>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span>You set your own price</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span>Customer compares quotes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span>Best quote wins the job!</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-2xl border border-green-500/30">
                    <h4 className="text-lg font-semibold text-green-200 mb-2">💡 Pro Tip</h4>
                    <p className="text-slate-300">Competitive quotes with quick estimated delivery times get accepted more often! Build your rating for premium loads.</p>
                </div>
            </div>

            <div className="flex justify-center">
                <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 transform hover:scale-105 transition duration-300 flex items-center gap-2">
                    Join as Driver <span className="text-xl">→</span>
                </Link>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen pt-20 pb-16 bg-slate-900 overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 blur-sm fixed"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-900"></div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-blue-200 mb-6 drop-shadow-lg">
                            Experience TruckSuvidha
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Discover how our platform connects shippers and drivers seamlessly. Choose your path below to see how it works.
                        </p>
                    </motion.div>

                    {/* Tab Selection */}
                    <motion.div variants={itemVariants} className="flex justify-center mb-12">
                        <div className="glass-panel p-2 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 inline-flex">
                            <button
                                onClick={() => setActiveTab('customer')}
                                className={`px-8 py-3 rounded-xl text-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'customer'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>📦</span> Customer Demo
                            </button>
                            <button
                                onClick={() => setActiveTab('driver')}
                                className={`px-8 py-3 rounded-xl text-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'driver'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>🚚</span> Driver Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'customer' ? <CustomerDemo key="customer" /> : <DriverDemo key="driver" />}
                    </AnimatePresence>

                    {/* Additional Features Section */}
                    <motion.div variants={itemVariants} className="mt-24 grid md:grid-cols-2 gap-8">
                        <div className="bg-slate-800/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <h3 className="text-2xl font-bold text-white mb-4">🚀 Why TruckSuvidha?</h3>
                            <ul className="space-y-4 text-slate-300">
                                <li className="flex items-center gap-3">
                                    <span className="text-green-400">✓</span>
                                    <span>Verified Drivers & Shippers Only</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-green-400">✓</span>
                                    <span>Transparent Pricing, No Hidden Fees</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-green-400">✓</span>
                                    <span>24/7 Customer Support</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-slate-800/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <h3 className="text-2xl font-bold text-white mb-4">📱 Mobile First Experience</h3>
                            <p className="text-slate-300 mb-4">
                                Our platform is optimized for all devices. Manage your logistics on the go from your smartphone or tablet.
                            </p>
                            <div className="flex gap-4">
                                <span className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white border border-white/10">📱 Android Ready</span>
                                <span className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white border border-white/10">🍎 iOS Ready</span>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
};

export default DemoPage;
