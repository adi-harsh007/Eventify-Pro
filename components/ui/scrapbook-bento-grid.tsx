import React from 'react';

interface BentoItemProps {
    className?: string;
    children: React.ReactNode;
    rotation?: string;
}

const BentoItem: React.FC<BentoItemProps> = ({ className = '', children, rotation = '0deg' }) => {
    // We apply the rotation using inline styles for dynamic rotation values.
    // The transition ensures smooth hover scaling.
    const style = {
        transform: `rotate(${rotation})`,
        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };

    return (
        <div
            className={`bento-item relative p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] overflow-hidden group hover:z-50 ${className}`}
            style={style}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = `rotate(0deg) scale(1.02)`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = `rotate(${rotation})`;
            }}
        >
            <div className="content-wrapper relative z-10 h-full w-full flex flex-col">
                {children}
            </div>
        </div>
    );
};

export default BentoItem;
