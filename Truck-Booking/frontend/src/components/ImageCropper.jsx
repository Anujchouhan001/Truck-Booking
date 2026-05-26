import React, { useState, useRef, useCallback } from 'react';

export default function ImageCropper({ onImageCropped, onCancel }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [quality, setQuality] = useState(0.7);
    const [maxWidth, setMaxWidth] = useState(800);
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const compressAndCropImage = useCallback(() => {
        if (!previewUrl) return;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate aspect ratio and new dimensions
            let newWidth = img.width;
            let newHeight = img.height;

            if (newWidth > maxWidth) {
                const ratio = maxWidth / newWidth;
                newWidth = maxWidth;
                newHeight = img.height * ratio;
            }

            // Set canvas size
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw image with compression
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, newWidth, newHeight);
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Convert to base64 with quality setting
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

            // Calculate size
            const sizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);

            if (sizeKB > 500) {
                // If still too large, try with lower quality
                const lowerQualityBase64 = canvas.toDataURL('image/jpeg', 0.5);
                onImageCropped(lowerQualityBase64);
            } else {
                onImageCropped(compressedBase64);
            }
        };
        img.src = previewUrl;
    }, [previewUrl, quality, maxWidth, onImageCropped]);

    const getEstimatedSize = () => {
        if (!previewUrl) return null;
        // Rough estimate based on current settings
        const originalSize = Math.round((previewUrl.length * 3) / 4 / 1024);
        const estimatedSize = Math.round(originalSize * quality * (maxWidth / 1000));
        return { original: originalSize, estimated: Math.min(estimatedSize, originalSize) };
    };

    const sizes = getEstimatedSize();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Upload Truck Photo</h3>
                        <p className="text-gray-500 text-sm">Select, crop, and compress your image</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {!previewUrl ? (
                        /* File Drop Zone */
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-400 transition cursor-pointer"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('truck-photo-input').click()}
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Drop your image here</h4>
                            <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                            <span className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Select Image
                            </span>
                            <input
                                type="file"
                                id="truck-photo-input"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        /* Image Preview & Settings */
                        <div className="space-y-6">
                            {/* Image Preview */}
                            <div className="relative bg-gray-100 rounded-xl overflow-hidden" ref={containerRef}>
                                <img
                                    ref={imageRef}
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-auto max-h-[300px] object-contain mx-auto"
                                />
                            </div>

                            {/* Compression Settings */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    Compression Settings
                                </h4>

                                {/* Quality Slider */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700">Image Quality</label>
                                        <span className="text-sm text-emerald-600 font-semibold">{Math.round(quality * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.3"
                                        max="1"
                                        step="0.1"
                                        value={quality}
                                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Smaller file</span>
                                        <span>Higher quality</span>
                                    </div>
                                </div>

                                {/* Max Width */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700">Max Width</label>
                                        <span className="text-sm text-emerald-600 font-semibold">{maxWidth}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="400"
                                        max="1200"
                                        step="100"
                                        value={maxWidth}
                                        onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>400px</span>
                                        <span>1200px</span>
                                    </div>
                                </div>

                                {/* Size Estimate */}
                                {sizes && (
                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm text-gray-500">Original: </span>
                                                <span className="text-sm font-medium text-gray-700">{sizes.original} KB</span>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                            <div>
                                                <span className="text-sm text-gray-500">Estimated: </span>
                                                <span className={`text-sm font-bold ${sizes.estimated < 400 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    ~{sizes.estimated} KB
                                                </span>
                                            </div>
                                        </div>
                                        {sizes.estimated > 400 && (
                                            <p className="text-xs text-amber-600 mt-2">⚠️ Try reducing quality or width for faster uploads</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Change Image */}
                            <button
                                onClick={() => {
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Choose a different image
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={compressAndCropImage}
                        disabled={!previewUrl}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${previewUrl
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Apply & Save
                    </button>
                </div>
            </div>
        </div>
    );
}
