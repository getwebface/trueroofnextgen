import { useState, useEffect, type FC } from 'react';
import { motion } from 'motion/react';
import type { WeatherContext } from '../utils/weatherProcessor';

interface WeatherHeroProps {
    ctx: WeatherContext;
}

// Map weather event + temporal context → hero content
function buildHeroContent(ctx: WeatherContext) {
    const { event, urgency, city, copyHints, topService, temperature, season, timeOfDay, dayOfWeek, isWeekend } = ctx;
    const temp = temperature != null ? `${Math.round(temperature)}°C` : null;
    const svcName = topService?.slug
        ? { 'metal-flashings': 'Metal Flashing Repairs', 'cleaning': 'Roof Cleaning', 'tiled-restoration': 'Tile Restoration' }[topService.slug] || 'Roof Restoration'
        : 'Roof Restoration';

    switch (event) {
        case 'HAIL_STORM':
            return {
                badge: `🚨 HAILSTORM — ${city.toUpperCase()} — URGENCY 5/5`,
                headline: ['Emergency Hail', 'Damage Repairs'],
                highlight: 'Hail',
                sub: `A hailstorm is the fastest way to crack tiles and destroy metal flashings. Our emergency crews are in ${city} right now — call immediately for a damage assessment.`,
                primaryCTA: { label: '📞 Emergency Call Now', href: 'tel:0400000000' },
                secondaryCTA: { label: 'Assess Your Damage →', href: '#quote' },
                stats: [
                    { value: '2hr', label: 'Response Time' },
                    { value: '24/7', label: 'Emergency Line' },
                    { value: '5★', label: 'Google Rating' },
                ],
            };

        case 'THUNDERSTORM':
            return {
                badge: `⛈️ STORM ACTIVE IN ${city.toUpperCase()}`,
                headline: ['Storm Damage?', "We've Got You"],
                highlight: 'Storm',
                sub: `Thunderstorms batter tiles, loosen flashings, and block valleys fast. Don't wait — call us now for an urgent assessment or submit your details and we'll call you back within the hour.`,
                primaryCTA: { label: '📞 Urgent Call Now', href: 'tel:0400000000' },
                secondaryCTA: { label: 'Submit Damage Report', href: '#quote' },
                stats: [
                    { value: '< 2hr', label: 'Urgent Response' },
                    { value: '2,500+', label: 'Roofs Secured' },
                    { value: '5★', label: 'Google Rating' },
                ],
            };

        case 'HIGH_WIND':
            return {
                badge: `💨 HIGH WINDS — ${city.toUpperCase()} — URGENCY 4/5`,
                headline: ['High Winds Can', 'Lift Your Tiles'],
                highlight: 'Lift',
                sub: `Strong wind events in ${city} frequently displace tiles and lift metal flashings. ${copyHints.timeGreeting}, before conditions worsen — get an urgent inspection booked.`,
                primaryCTA: { label: '📞 Book Urgent Inspection', href: 'tel:0400000000' },
                secondaryCTA: { label: 'Request Callback', href: '#quote' },
                stats: [
                    { value: '< 4hr', label: 'Response Time' },
                    { value: '25+', label: 'Years Experience' },
                    { value: '5★', label: 'Google Rating' },
                ],
            };

        case 'HEAVY_RAIN':
            return {
                badge: `🌧️ HEAVY RAIN IN ${city.toUpperCase()} — LEAKS LIKELY`,
                headline: ['Leaking Roof?', 'Act Now.'],
                highlight: 'Now',
                sub: `Heavy rain reveals exactly where your roof is failing. A visible leak means water has been tracking for a while. ${copyHints.timeGreeting} — let's stop the damage before it spreads to your ceiling.`,
                primaryCTA: { label: '🌧️ Stop My Leak Today', href: 'tel:0400000000' },
                secondaryCTA: { label: 'Book Same-Day Visit', href: '#quote' },
                stats: [
                    { value: 'Same-Day', label: 'Often Available' },
                    { value: '2,500+', label: 'Leaks Fixed' },
                    { value: '5★', label: 'Google Rating' },
                ],
            };

        case 'DRIZZLE':
            return {
                badge: `🌦️ RAIN IN ${city.toUpperCase()} TODAY`,
                headline: ["Rain Revealing", "Your Roof's Weak Spots"],
                highlight: 'Weak',
                sub: `Light rain in ${city} ${temp ? `at ${temp}` : ''} is the best diagnostic test for your tiles. An unexpected drip, stain, or musty smell means it's time to investigate. Free inspections available.`,
                primaryCTA: { label: '🌦️ Get a Free Inspection', href: 'tel:0400000000' },
                secondaryCTA: { label: 'Request Callback', href: '#quote' },
                stats: [
                    { value: 'Free', label: 'Inspections' },
                    { value: '25+', label: 'Years Experience' },
                    { value: '4.9★', label: 'Google Rating' },
                ],
            };

        case 'FROST':
            return {
                badge: `❄️ FROST WARNING — ${city.toUpperCase()}`,
                headline: ['Frost Cracks', 'Tile Mortar Fast'],
                highlight: 'Cracks',
                sub: `Frost in ${city} this ${timeOfDay?.toLowerCase()} causes rapid freeze-thaw cycles that crack pointing mortar and shift ridge caps. The damage compounds with every cold snap — get it checked now.`,
                primaryCTA: { label: '❄️ Book Frost Inspection', href: '#quote' },
                secondaryCTA: { label: '📞 Call Us', href: 'tel:0400000000' },
                stats: [
                    { value: 'Free', label: 'Inspections' },
                    { value: '25+', label: 'Yrs Experience' },
                    { value: '4.9★', label: 'Rating' },
                ],
            };

        case 'CLEAR_HOT':
            return {
                badge: `☀️ ${temp ? temp + ' AND CLEAR' : 'SUMMER SUN'} — ${city.toUpperCase()}`,
                headline: ['Summer Is Hard', 'on${" "}Tile Roofs'],
                highlight: 'Summer',
                sub: `${temp ? `${temp} today in ${city}` : `Hot summer conditions in ${city}`} — UV and thermal expansion stress tiles, crack coatings, and bake moss into the surface. Lock in your restoration quote while the season is right.`,
                primaryCTA: { label: '☀️ Get Your Quote', href: '#quote' },
                secondaryCTA: { label: '📞 Call Us', href: 'tel:0400000000' },
                stats: [
                    { value: '2,500+', label: 'Roofs Restored' },
                    { value: '25+', label: 'Yrs Experience' },
                    { value: '4.9★', label: 'Rating' },
                ],
            };

        case 'CLEAR_MILD':
            return {
                badge: season === 'AUTUMN'
                    ? `🍂 AUTUMN IN ${city.toUpperCase()} — BOOK BEFORE WINTER`
                    : `🌤️ IDEAL CONDITIONS — ${city.toUpperCase()}`,
                headline: season === 'AUTUMN'
                    ? ['Book Before', 'Winter Arrives']
                    : ['Perfect Day for', 'Tile Restoration'],
                highlight: season === 'AUTUMN' ? 'Winter' : 'Perfect',
                sub: season === 'AUTUMN'
                    ? `${copyHints.timeGreeting} in ${city} ${temp ? `• ${temp} ` : ''}— ${copyHints.seasonalTip}`
                    : `${temp ? `${temp} and clear in ${city}` : `Clear skies over ${city}`} — optimal conditions for high-pressure cleaning, coating, and pointing. ${isWeekend ? `${dayOfWeek}s fill up fast.` : 'Lock in your week.'}`,
                primaryCTA: { label: season === 'AUTUMN' ? '🍂 Book Before Winter' : '🌤️ Schedule My Restoration', href: '#quote' },
                secondaryCTA: { label: '📞 Call for a Chat', href: 'tel:0400000000' },
                stats: [
                    { value: '2,500+', label: 'Roofs Restored' },
                    { value: '25+', label: 'Yrs Experience' },
                    { value: '4.9★', label: 'Rating' },
                ],
            };

        default:
            return {
                badge: `🏠 MELBOURNE'S TILE RESTORATION SPECIALISTS`,
                headline: ['Restore, Not', 'Replace.'],
                highlight: 'Restore',
                sub: `Melbourne's tiles tell a story. We restore terracotta and concrete tile roofs using our proven 4-stage process — extending roof life by 15-20 years at a fraction of the cost of a re-roof.`,
                primaryCTA: { label: '📋 Get a Free Quote', href: '#quote' },
                secondaryCTA: { label: '📞 Call Us', href: 'tel:0400000000' },
                stats: [
                    { value: '2,500+', label: 'Roofs Restored' },
                    { value: '25+', label: 'Yrs Experience' },
                    { value: '4.9★', label: 'Rating' },
                ],
            };
    }
}

const WeatherHero: FC<WeatherHeroProps> = ({ ctx }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const content = buildHeroContent(ctx);
    const isStormEvent = ctx.event === 'HAIL_STORM' || ctx.event === 'THUNDERSTORM' || ctx.event === 'HIGH_WIND';
    const isRainEvent = ctx.event === 'HEAVY_RAIN' || ctx.event === 'DRIZZLE';

    return (
        <section className="hero-section">
            {/* Rain particle effect */}
            {mounted && isRainEvent && (
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div key={i}
                            style={{
                                position: 'absolute',
                                width: '1px',
                                height: `${10 + Math.random() * 20}px`,
                                background: 'linear-gradient(to bottom, transparent, rgba(100, 160, 255, 0.35))',
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{ y: ['-5vh', '110vh'], opacity: [0, 0.8, 0.8, 0] }}
                            transition={{ duration: 1 + Math.random() * 0.6, repeat: Infinity, delay: Math.random() * 2, ease: 'linear' }}
                        />
                    ))}
                </div>
            )}

            {/* Storm red pulse */}
            {mounted && isStormEvent && (
                <motion.div aria-hidden="true"
                    style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(220,38,38,0.07) 0%, transparent 70%)', pointerEvents: 'none' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                />
            )}

            {/* Frost shimmer */}
            {mounted && ctx.event === 'FROST' && (
                <motion.div aria-hidden="true"
                    style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(147,210,255,0.05) 0%, transparent 60%)', pointerEvents: 'none' }}
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            )}

            <div className="hero-content">
                <motion.div className="hero-badge" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {content.badge}
                </motion.div>

                <motion.h1 className="hero-headline" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    {content.headline.map((line, i) => (
                        <span key={i}>
                            {line.includes(content.highlight)
                                ? <>{line.split(content.highlight)[0]}<span className="highlight">{content.highlight}</span>{line.split(content.highlight)[1]}</>
                                : line}
                            {i < content.headline.length - 1 && <br />}
                        </span>
                    ))}
                </motion.h1>

                <motion.p className="hero-sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    {content.sub}
                </motion.p>

                <motion.div className="hero-ctas" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                    <a href={content.primaryCTA.href} className="cta-primary">{content.primaryCTA.label}</a>
                    <a href={content.secondaryCTA.href} className="cta-secondary">{content.secondaryCTA.label}</a>
                </motion.div>

                <motion.div className="hero-stats" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                    {content.stats.map((stat, i) => (
                        <div key={i}>
                            <div className="hero-stat-value">{stat.value}</div>
                            <div className="hero-stat-label">{stat.label}</div>
                        </div>
                    ))}
                    {ctx.temperature != null && (
                        <div>
                            <div className="hero-stat-value">{Math.round(ctx.temperature)}°C</div>
                            <div className="hero-stat-label">{ctx.condition} • {ctx.city}</div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default WeatherHero;
