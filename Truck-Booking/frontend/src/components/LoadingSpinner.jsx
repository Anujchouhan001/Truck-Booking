import React from 'react';

/**
 * LoadingSpinner - A premium loading component with animated truck
 * @param {Object} props
 * @param {string} props.message - Custom loading message
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} props.fullScreen - Whether to display as full screen overlay
 */
export default function LoadingSpinner({
    message = 'Loading...',
    size = 'md',
    fullScreen = false
}) {
    const sizes = {
        sm: { truck: 80, text: 'text-sm' },
        md: { truck: 120, text: 'text-base' },
        lg: { truck: 160, text: 'text-lg' }
    };

    const currentSize = sizes[size] || sizes.md;

    const content = (
        <div className="flex flex-col items-center justify-center">
            {/* Truck Animation Container */}
            <div className="relative mb-6">
                {/* Glowing background orb */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse scale-150" />

                {/* Animated Truck SVG */}
                <svg
                    width={currentSize.truck}
                    height={currentSize.truck * 0.75}
                    viewBox="0 0 120 90"
                    className="relative z-10 animate-truck-bounce"
                >
                    {/* Exhaust puffs */}
                    <g className="animate-exhaust">
                        <circle cx="8" cy="55" r="4" fill="#94A3B8" opacity="0.6" />
                        <circle cx="3" cy="52" r="3" fill="#94A3B8" opacity="0.4" />
                    </g>

                    {/* Truck Body */}
                    <g>
                        {/* Cargo Container */}
                        <rect x="35" y="25" width="55" height="35" rx="4" fill="url(#truckGradient)" />
                        <rect x="38" y="28" width="49" height="29" rx="2" fill="#818CF8" opacity="0.5" />

                        {/* Container Lines */}
                        <line x1="55" y1="25" x2="55" y2="60" stroke="#4338CA" strokeWidth="1.5" opacity="0.5" />
                        <line x1="75" y1="25" x2="75" y2="60" stroke="#4338CA" strokeWidth="1.5" opacity="0.5" />

                        {/* Cabin */}
                        <path d="M20 40 L20 60 L35 60 L35 35 L30 35 L25 40 Z" fill="#4F46E5" />
                        <rect x="22" y="42" width="10" height="10" rx="1" fill="#DBEAFE" />

                        {/* Cabin Details */}
                        <circle cx="17" cy="52" r="2" fill="#FCD34D" /> {/* Headlight */}
                    </g>

                    {/* Wheels */}
                    <g>
                        {/* Front Wheel */}
                        <circle cx="30" cy="68" r="10" fill="#1F2937" />
                        <circle cx="30" cy="68" r="6" fill="#6B7280" />
                        <circle cx="30" cy="68" r="3" fill="#9CA3AF" className="animate-wheel-spin origin-center" style={{ transformOrigin: '30px 68px' }} />

                        {/* Rear Wheel */}
                        <circle cx="75" cy="68" r="10" fill="#1F2937" />
                        <circle cx="75" cy="68" r="6" fill="#6B7280" />
                        <circle cx="75" cy="68" r="3" fill="#9CA3AF" className="animate-wheel-spin origin-center" style={{ transformOrigin: '75px 68px' }} />
                    </g>

                    {/* Road */}
                    <line
                        x1="5" y1="80" x2="115" y2="80"
                        stroke="#CBD5E1"
                        strokeWidth="3"
                        strokeDasharray="10,8"
                        className="animate-road-move"
                    />

                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="truckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Loading Message */}
            <div className="text-center">
                <p className={`font-semibold text-gray-700 ${currentSize.text}`}>
                    {message}
                </p>

                {/* Animated Dots */}
                <div className="flex justify-center gap-1.5 mt-3">
                    <span
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                    />
                    <span
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                    />
                    <span
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                    />
                </div>
            </div>

            {/* Subtle progress shimmer */}
            <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-shimmer"
                    style={{ width: '150%', marginLeft: '-50%' }} />
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center flex items-center justify-center min-h-[300px]">
            {content}
        </div>
    );
}

/**
 * LoadingSkeleton - A shimmer loading placeholder for cards
 */
export function LoadingSkeleton({ count = 3 }) {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl shadow-lg p-5 animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <div className="flex items-center gap-4">
                        {/* Route skeleton */}
                        <div className="flex-shrink-0 space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="h-3 w-20 bg-gray-100 rounded" />
                        </div>

                        {/* Details skeleton */}
                        <div className="flex-1 grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-gray-100 rounded" />
                                <div className="h-4 w-20 bg-gray-200 rounded" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-gray-100 rounded" />
                                <div className="h-4 w-16 bg-gray-200 rounded" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-gray-100 rounded" />
                                <div className="h-4 w-24 bg-gray-200 rounded" />
                            </div>
                        </div>

                        {/* Button skeleton */}
                        <div className="flex-shrink-0">
                            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
