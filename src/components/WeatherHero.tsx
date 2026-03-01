import { useState, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WeatherHeroProps {
    weatherMode: string;
    city: string;
    temperature?: number;
    condition?: string;
}

const heroContent: Record<string, { headline: string; highlight: string; sub: string; cta: string; badge: string }> = {
    STORM_EMERGENCY: {
        headline: 'Emergency Tile Leak\n& Flashing Repairs',
        highlight: 'Emergency',
        sub: 'Severe weather hitting your area. Our emergency crews are on standby for immediate tile and flashing repairs. Don\'t wait for the damage to spread.',
        cta: '📞 Emergency Call 24/7',
        badge: '🚨 STORM CREWS ON STANDBY'
    },
    RAIN_ACTIVE: {
        headline: 'Roof Leaking\nRight Now?',
        highlight: 'Leaking',
        sub: 'Rain is falling and every minute counts. We can diagnose and repair tile leaks, blocked valleys, and failed flashings — often same-day.',
        cta: '🌧️ Stop Leaks Today',
        badge: '⚡ SAME-DAY LEAK REPAIRS'
    },
    PREVENTATIVE: {
        headline: 'Protect Your Tiles\nBefore Winter Hits',
        highlight: 'Protect',
        sub: 'Autumn is the critical window for roof maintenance. Book a free inspection now and fix small issues before they become expensive winter emergencies.',
        cta: '🍂 Book Free Inspection',
        badge: '🍂 AUTUMN MAINTENANCE SPECIAL'
    },
    ROOF_RESTORATION: {
        headline: 'Perfect Day for\nTile Restoration',
        highlight: 'Restoration',
        sub: 'Clear skies and mild temperatures — ideal conditions for our 4-stage restoration process. Lock in your quote while the weather holds.',
        cta: '☀️ Get Free Quote',
        badge: '☀️ IDEAL RESTORATION CONDITIONS'
    },
    DEFAULT: {
        headline: 'Melbourne\'s Tile\nRestoration Experts',
        highlight: 'Restoration',
        sub: 'We don\'t just patch roofs — we restore them to their former glory. Specialized care for Melbourne\'s terracotta and concrete tile roofs.',
        cta: '📋 Get a Free Quote',
        badge: '🏆 MELBOURNE\'S #1 TILE SPECIALISTS'
    }
};

const WeatherHero: FC<WeatherHeroProps> = ({ weatherMode, city, temperature, condition }) => {
    const content = heroContent[weatherMode] || heroContent.DEFAULT;
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const headlineParts = content.headline.split('\n');

    return (
        <section className="hero-section">
            {/* Animated weather particles */}
            {mounted && weatherMode === 'RAIN_ACTIVE' && (
                <div className="rain-particles" aria-hidden="true">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: '1px',
                                height: `${12 + Math.random() * 18}px`,
                                background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.4))',
                                left: `${Math.random() * 100}%`,
                                top: '-20px',
                            }}
                            animate={{
                                y: ['0vh', '105vh'],
                                opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                                duration: 1.2 + Math.random() * 0.8,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                                ease: 'linear',
                            }}
                        />
                    ))}
                </div>
            )}

            {mounted && weatherMode === 'STORM_EMERGENCY' && (
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            <div className="hero-content">
                <motion.div
                    className="hero-badge"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {content.badge}
                </motion.div>

                <motion.h1
                    className="hero-headline"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {headlineParts.map((part, i) => (
                        <span key={i}>
                            {part.includes(content.highlight)
                                ? <>
                                    {part.split(content.highlight)[0]}
                                    <span className="highlight">{content.highlight}</span>
                                    {part.split(content.highlight)[1]}
                                </>
                                : part
                            }
                            {i < headlineParts.length - 1 && <br />}
                        </span>
                    ))}
                </motion.h1>

                <motion.p
                    className="hero-sub"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {content.sub}
                </motion.p>

                <motion.div
                    className="hero-ctas"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <a href="tel:0400000000" className="cta-primary">{content.cta}</a>
                    <a href="#quote" className="cta-secondary">
                        Or Request a Callback →
                    </a>
                </motion.div>

                <motion.div
                    className="hero-stats"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div>
                        <div className="hero-stat-value">2,500+</div>
                        <div className="hero-stat-label">Roofs Restored</div>
                    </div>
                    <div>
                        <div className="hero-stat-value">25+</div>
                        <div className="hero-stat-label">Years Experience</div>
                    </div>
                    <div>
                        <div className="hero-stat-value">4.9★</div>
                        <div className="hero-stat-label">Google Rating</div>
                    </div>
                    {temperature != null && (
                        <div>
                            <div className="hero-stat-value">{Math.round(temperature)}°C</div>
                            <div className="hero-stat-label">{condition} in {city}</div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default WeatherHero;
