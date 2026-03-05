import { useState, useRef, useEffect, memo, type FC } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    label?: string;
}

const BeforeAfterSlider: FC<BeforeAfterSliderProps> = ({
    beforeImage,
    afterImage,
    beforeLabel = 'Before',
    afterLabel = 'After',
    label
}) => {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            setSliderPos((prev) => Math.max(0, prev - 5));
        } else if (e.key === 'ArrowRight') {
            setSliderPos((prev) => Math.min(100, prev + 5));
        }
    };

    const handleDrag = (event: any, info: any) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate percentage based on mouse position relative to container
        let newPos = ((info.point.x - rect.left) / rect.width) * 100;
        newPos = Math.max(0, Math.min(newPos, 100)); // Clamp between 0 and 100
        setSliderPos(newPos);
    };

    const handleDragEnd = () => {
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('interacted_before_after_slider', {
                beforeLabel,
                afterLabel,
                final_position: Math.round(sliderPos),
                method: 'drag'
            });
        }
    };

    return (
        <div className="my-8">
            {label && (
                <h3 className="text-xl font-bold mb-4 text-center">{label}</h3>
            )}
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-2xl shadow-2xl glass-card select-none"
                style={{ aspectRatio: '16/9' }}
            >
                {/* Background Image (After) */}
                <div className="absolute inset-0">
                    <img src={afterImage} alt="After restoration" loading="lazy" width="1280" height="720" className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold border border-white/10 z-10">
                        {afterLabel}
                    </div>
                </div>

                {/* Foreground Image (Before) clipped by slider */}
                <div
                    className="absolute inset-0 border-r-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                    style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                >
                    <img src={beforeImage} alt="Before restoration" loading="lazy" width="1280" height="720" className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold border border-white/10 z-10">
                        {beforeLabel}
                    </div>
                </div>

                {/* Draggable Handle */}
                <motion.div
                    role="slider"
                    aria-label="Image before and after slider"
                    aria-valuenow={sliderPos}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize z-20 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 rounded-full"
                    style={{ left: `${sliderPos}%` }}
                    drag="x"
                    dragConstraints={containerRef}
                    dragElastic={0}
                    dragMomentum={false}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                >
                    <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-[#3b82f6] text-[#3b82f6]">
                        <ArrowLeftRight size={20} strokeWidth={2.5} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default memo(BeforeAfterSlider);
