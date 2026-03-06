import { Check, X } from 'lucide-react';

interface ComparisonItem {
    trueRoof: string;
    otherGuys: string;
}

interface ComparisonChecklistProps {
    items?: ComparisonItem[];
}

const defaultItems: ComparisonItem[] = [
    { trueRoof: 'Permanent structural repairs', otherGuys: 'Quick tarping & walk away' },
    { trueRoof: 'Advanced Flexi-Pointing', otherGuys: 'Rigid cement that cracks' },
    { trueRoof: 'Photographic damage reports', otherGuys: 'Vague handwritten quotes' },
    { trueRoof: '10-Year Workmanship Guarantee', otherGuys: 'No long-term warranty' },
];

export default function ComparisonChecklist({ items = defaultItems }: ComparisonChecklistProps) {
    return (
        <div className="my-8 overflow-hidden rounded-2xl glass-card shadow-xl border border-white/10">
            <div className="grid grid-cols-2 text-center">
                {/* Headers */}
                <div className="bg-[#f97316]/10 p-4 border-b border-[#f97316]/20">
                    <h3 className="text-xl font-bold text-[#f97316]">True Roof</h3>
                </div>
                <div className="bg-slate-800/50 p-4 border-b border-white/5">
                    <h3 className="text-xl font-bold text-slate-300">The Other Guys</h3>
                </div>

                {/* Rows */}
                {items.map((item, index) => (
                    <div key={index} className="contents">
                        {/* True Roof Column */}
                        <div
                            className={`p-4 flex items-center justify-start gap-3 border-r border-white/5 ${index !== items.length - 1 ? 'border-b border-white/5' : ''}`}
                            onClick={() => {
                                if (typeof window !== 'undefined' && (window as any).posthog) {
                                    (window as any).posthog.capture('clicked_comparison_item', {
                                        trueRoofFeature: item.trueRoof,
                                        competitorFeature: item.otherGuys,
                                        position: index + 1
                                    });
                                }
                            }}
                        >
                            <div className="bg-[#f97316]/20 p-1.5 rounded-full flex-shrink-0">
                                <Check size={18} className="text-[#f97316]" strokeWidth={3} />
                            </div>
                            <span className="text-sm md:text-base font-medium text-left">{item.trueRoof}</span>
                        </div>
                        {/* Other Guys Column */}
                        <div
                            className={`p-4 flex items-center justify-start gap-3 ${index !== items.length - 1 ? 'border-b border-white/5' : ''}`}
                            onClick={() => {
                                if (typeof window !== 'undefined' && (window as any).posthog) {
                                    (window as any).posthog.capture('clicked_comparison_item', {
                                        trueRoofFeature: item.trueRoof,
                                        competitorFeature: item.otherGuys,
                                        position: index + 1
                                    });
                                }
                            }}
                        >
                            <div className="bg-red-500/10 p-1.5 rounded-full flex-shrink-0">
                                <X size={18} className="text-red-400" strokeWidth={3} />
                            </div>
                            <span className="text-sm md:text-base text-slate-400 text-left line-through opacity-80">{item.otherGuys}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
