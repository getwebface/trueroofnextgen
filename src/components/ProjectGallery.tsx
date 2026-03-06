import { useState } from 'react';

interface GalleryImage {
    src: string;
    alt: string;
    caption?: string;
}

interface ProjectGalleryProps {
    images: GalleryImage[];
}

export default function ProjectGallery({ images }: ProjectGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="my-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="glass-card overflow-hidden cursor-pointer group"
                        onClick={() => setSelectedImage(index)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedImage(index);
                                e.preventDefault();
                            }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View larger image of ${image.alt}`}
                    >
                        <div className="aspect-[4/3] relative overflow-hidden bg-slate-800/50">
                            {/* In a real scenario we'd use next/image or astro/image, but for raw react injected via MDX, a standard img works best. The cdn/ paths will resolve from public/ */}
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            {image.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-sm text-white font-medium truncate">{image.caption}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedImage !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 transition-colors"
                            onClick={() => setSelectedImage(null)}
                            aria-label="Close lightbox"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <img
                            src={images[selectedImage].src}
                            alt={images[selectedImage].alt}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />

                        {images[selectedImage].caption && (
                            <p className="mt-4 text-white text-lg text-center">{images[selectedImage].caption}</p>
                        )}

                        {/* Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage((prev) => prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : null);
                                    }}
                                    aria-label="Previous image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage((prev) => prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : null);
                                    }}
                                    aria-label="Next image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
