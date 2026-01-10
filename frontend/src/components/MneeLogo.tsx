import Image from "next/image";

interface MneeLogoProps {
    className?: string;
}

export function MneeLogo({ className = "w-6 h-6" }: MneeLogoProps) {
    return (
        <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 border border-white/10 ${className}`}>
            <span className="font-bold text-white text-[10px] tracking-tighter">M</span>
        </div>
    );
}
