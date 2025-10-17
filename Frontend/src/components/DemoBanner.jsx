import { useEffect, useState } from "react";
import { FiInstagram, FiFacebook, FiLinkedin, FiTwitter } from "react-icons/fi"; // Import icons from react-icons/fi

/**
 * DemoBanner props:
 * - id: unique key for localStorage (default "demo-banner-hidden") - no longer used for persistence
 * - message: text to show
 * - color: "blue" | "red" | "yellow" | "green" (affects banner color)
 * - showIcon: whether to show a small icon
 * - dismissible: whether the user can close the banner
 * - autoHide: if true, auto hides after `duration` ms
 * - duration: ms to auto-hide when autoHide true (default 7000)
 */
const COLOR_CLASSES = {
    blue: {
        bg: "bg-blue-600",
        text: "text-white",
        accent: "bg-blue-700",
    },
    red: {
        bg: "bg-red-600",
        text: "text-white",
        accent: "bg-red-700",
    },
    yellow: {
        bg: "bg-yellow-400",
        text: "text-black",
        accent: "bg-yellow-500",
    },
    green: {
        bg: "bg-green-600",
        text: "text-white",
        accent: "bg-green-700",
    },
};

const socialLinks = [
    {
        icon: <FiInstagram className="w-5 h-5" />,
        url: "https://www.instagram.com/avishekiapi/",
        target: "_blank",
        rel: "noopener noreferrer",
        name: "Instagram",
    },
    {
        icon: <FiFacebook className="w-5 h-5" />,
        url: "https://www.facebook.com/Avi.p.08",
        target: "_blank",
        rel: "noopener noreferrer",
        name: "Facebook",
    },
    {
        icon: <FiLinkedin className="w-5 h-5" />,
        url: "https://www.linkedin.com/in/avishek-pradhan0118052002",
        target: "_blank",
        rel: "noopener noreferrer",
        name: "LinkedIn",
    },
    {
        icon: <FiTwitter className="w-5 h-5" />,
        url: "https://x.com/Avishekp18",
        target: "_blank",
        rel: "noopener noreferrer",
        name: "Twitter",
    },
];

export default function DemoBanner({
    id = "demo-banner-hidden", // Kept for reference but not used for persistence
    message = "Demo — environment.",
    color = "yellow",
    showIcon = true,
    dismissible = true,
    autoHide = false,
    duration = 7000,
}) {
    const [hidden, setHidden] = useState(false); // Reset to false on every mount

    useEffect(() => {
        let timer;
        if (!hidden && autoHide) {
            timer = setTimeout(() => {
                setHidden(true); // Hide without persistence
            }, duration);
        }
        return () => clearTimeout(timer);
    }, [hidden, autoHide, duration]);

    const handleHide = () => {
        setHidden(true); // Hide temporarily, no persistence
    };

    if (hidden) return null;

    const classes = COLOR_CLASSES[color] || COLOR_CLASSES.yellow;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`${classes.bg} ${classes.text} w-full fixed top-0 left-0 z-50`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {showIcon && (
                            <svg
                                className="h-5 w-5 opacity-90 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                                />
                            </svg>
                        )}
                        <p className="text-sm font-medium leading-5 break-words">
                            {message}
                        </p>
                    </div>


                    <div className="flex items-center gap-2">
                        <a
                            href="/"
                            className="hidden sm:inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded hover:opacity-90 transition"
                            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                        >
                            View Home
                        </a>

                        {dismissible && (
                            <button
                                onClick={handleHide}
                                aria-label="Dismiss demo banner"
                                className="p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                            >
                                <svg
                                    className="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        {!dismissible && (
                            <button
                                onClick={handleHide}
                                aria-label="Hide banner temporarily"
                                className="p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                            >
                                <svg
                                    className="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {/* Social Links */}
                    <div className="flex items-center gap-8">
                        {socialLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                target={link.target}
                                rel={link.rel}
                                className="text-gray-200 hover:text-white transition-colors"
                                aria-label={link.name}
                            >
                                {link.icon}
                            </a>
                        ))}
                        <span
                            onClick={() => window.open("https://avishekpradhan.netlify.app/", "_blank")}
                            className="ml-2 inline-block rounded-md px-4 py-2 text-xs font-semibold opacity-90 bg-white/10 cursor-pointer"
                        >
                            Visit My Site
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}