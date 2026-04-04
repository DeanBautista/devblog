export default function WebIcon() {

    return (
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#334155" />
                    <stop offset="50%" style="stop-color:#0f172a" />
                    <stop offset="100%" style="stop-color:#1e293b" />
                </linearGradient>
                
                <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#94a3b8" />
                    <stop offset="50%" style="stop-color:#475569" />
                    <stop offset="100%" style="stop-color:#94a3b8" />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            <path d="M100 10 L177.94 55 V145 L100 190 L22.06 145 V55 L100 10Z" 
                  fill="url(#hexGradient)" 
                  stroke="url(#strokeGradient)" 
                  stroke-width="4" />

            <path d="M100 45 L147.63 72.5 V127.5 L100 155 L52.37 127.5 V72.5 L100 45Z" 
                  fill="#020617" 
                  stroke="#334155" 
                  stroke-width="2" />

            <g filter="url(#glow)">
                <path d="M80 85 L65 100 L80 115" 
                      stroke="#f8fafc" 
                      stroke-width="6" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" />
                
                <path d="M110 75 L90 125" 
                      stroke="#f8fafc" 
                      stroke-width="6" 
                      stroke-linecap="round" />
                
                <path d="M120 85 L135 100 L120 115" 
                      stroke="#f8fafc" 
                      stroke-width="6" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" />
            </g>

            <rect x="145" y="65" width="8" height="3" fill="#64748b" rx="1" />
            <rect x="155" y="72" width="5" height="3" fill="#64748b" rx="1" />
            <rect x="40" y="130" width="10" height="2" fill="#475569" rx="1" />
        </svg>
    )
}