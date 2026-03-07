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
    // ⚡ Bolt Optimization: Use useMotionValue instead of useState to prevent expensive
    // React re-renders on every animation frame during the drag operation.
    const sliderPos = useMotionValue(50);
    const containerRef = useRef<HTMLDivElement>(null);

    // ⚡ Bolt Optimization: Cache the bounding rect to prevent layout thrashing
    // (forced synchronous layout) which causes jank during drag.
    const rectRef = useRef<DOMRect | null>(null);
    // ariaValue state only updates when drag completes or keyboard is used, keeping it accessible without thrashing render loop
    const [ariaValue, setAriaValue] = useState(50);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        let newPos = sliderPos.get();
        if (e.key === 'ArrowLeft') {
            newPos = Math.max(0, newPos - 5);
            sliderPos.set(newPos);
            setAriaValue(Math.round(newPos));
        } else if (e.key === 'ArrowRight') {
            newPos = Math.min(100, newPos + 5);
            sliderPos.set(newPos);
            setAriaValue(Math.round(newPos));
        }
    };

    const handleDragStart = () => {
        if (containerRef.current) {
            rectRef.current = containerRef.current.getBoundingClientRect();
        }
    };

    const handleDrag = (event: any, info: any) => {
        // Fallback to live rect if cache missed (e.g. fast interaction before mount)
        const rect = rectRef.current || containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Calculate percentage based on mouse position relative to container
        let newPos = ((info.point.x - rect.left) / rect.width) * 100;
        newPos = Math.max(0, Math.min(newPos, 100)); // Clamp between 0 and 100
        sliderPos.set(newPos);
    };

    const handleDragEnd = () => {
        rectRef.current = null; // Clear cache
        const finalPos = Math.round(sliderPos.get());
        setAriaValue(finalPos);

        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('interacted_before_after_slider', {
                beforeLabel,
                afterLabel,
                final_position: finalPos,
                method: 'drag'
            });
        }
    };

    // Derived motion values for style injection without re-renders
    const clipPath = useTransform(sliderPos, (val) => `polygon(0 0, ${val}% 0, ${val}% 100%, 0 100%)`);
    const leftPos = useTransform(sliderPos, (val) => `${val}%`);

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
                <motion.div
                    className="absolute inset-0 border-r-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                    style={{ clipPath }}
                >
                    <img src={beforeImage} alt="Before restoration" loading="lazy" width="1280" height="720" className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold border border-white/10 z-10">
                        {beforeLabel}
                    </div>
                </motion.div>

                {/* Draggable Handle */}
                <motion.div
                    role="slider"
                    aria-label="Image before and after slider"
                    aria-valuenow={ariaValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize z-20 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 rounded-full"
                    style={{ left: leftPos }}
                    drag="x"
                    dragConstraints={containerRef}
                    dragElastic={0}
                    dragMomentum={false}
                    onDragStart={handleDragStart}
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
