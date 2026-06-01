import React, { useState } from 'react';
import { getContrastColor } from '../utils/colorUtils';

const AutoContrastBox = ({ bgColor, children, className = "" }) => {
    const textColor = getContrastColor(bgColor);

    return (
        <div
            className={`p-6 rounded-2xl transition-all duration-300 ${className}`}
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {children}
        </div>
    );
};

const ContrastDemo = () => {
    const [customColor, setCustomColor] = useState('#ea580c'); // Orange-600

    const colors = [
        { name: 'Orange 500', hex: '#f97316' },
        { name: 'Teal 600', hex: '#0d9488' },
        { name: 'Slate 900', hex: '#0f172a' },
        { name: 'Slate 50', hex: '#f8fafc' },
        { name: 'Amber 400', hex: '#fbbf24' },
        { name: 'Rose 500', hex: '#f43f5e' },
        { name: 'Emerald 500', hex: '#10b981' },
        { name: 'Blue 600', hex: '#2563eb' },
    ];

    return (
        <div className="p-8 space-y-8 bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Color Contrast Utility Demo</h2>
                <p className="text-slate-500 font-medium">This utility automatically calculates the best text color (black or white) based on the background luminance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {colors.map((color, i) => (
                    <AutoContrastBox key={i} bgColor={color.hex}>
                        <p className="text-xs font-black uppercase tracking-widest mb-1">{color.name}</p>
                        <p className="font-bold">{color.hex}</p>
                        <p className="text-sm mt-4 opacity-80">Text color adapts automatically for accessibility.</p>
                    </AutoContrastBox>
                ))}
            </div>

            <div className="pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Try a Custom Color:</h3>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-20 h-20 rounded-xl cursor-pointer bg-transparent"
                    />
                    <div className="flex-grow w-full">
                        <AutoContrastBox bgColor={customColor} className="shadow-xl">
                            <h4 className="text-xl font-black mb-2">Live Preview</h4>
                            <p className="font-medium">The text color you are reading right now is dynamically calculated to be visible against <span className="underline">{customColor}</span>.</p>
                        </AutoContrastBox>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContrastDemo;
