interface FootballIconProps {
  size?: number;
}

const FootballIcon = ({ size = 40 }: FootballIconProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="50" rx="42" ry="28" fill="#8B4513" stroke="#5C2D0A" strokeWidth="3" transform="rotate(-30 50 50)" />
    <path d="M30 50 Q50 30 70 50" stroke="white" strokeWidth="2.5" fill="none" />
    <path d="M30 50 Q50 70 70 50" stroke="white" strokeWidth="2.5" fill="none" />
    <line x1="42" y1="38" x2="42" y2="62" stroke="white" strokeWidth="1.5" />
    <line x1="50" y1="35" x2="50" y2="65" stroke="white" strokeWidth="1.5" />
    <line x1="58" y1="38" x2="58" y2="62" stroke="white" strokeWidth="1.5" />
  </svg>
);

export default FootballIcon;
