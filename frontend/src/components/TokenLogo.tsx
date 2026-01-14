import Image from "next/image";

interface TokenLogoProps {
    className?: string;
}

export function TokenLogo({ className = "w-6 h-6" }: TokenLogoProps) {
    return (
        <div className={`${className} rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-blue-500/20`}>
            $
        </div>
    );
}
