import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { useAppContext } from "../contexts/AppContext";

const SendEmail = () => {
    const { state } = useAppContext();
    const navigate = useNavigate();

    // Refs for copy buttons to show feedback
    const copyCodeBtnRef = useRef(null);
    const copyInboxesBtnRef = useRef(null);

    const copyToClipboard = (text, buttonRef) => {
        navigator.clipboard.writeText(text).then(() => {
            if (buttonRef?.current) {
                const btn = buttonRef.current;
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<Copy className="h-5 w-5 text-green-600 mr-1" /> Copied!';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                }, 2000);
            }
        }).catch((err) => {
            console.error('Failed to copy: ', err);
        });
    };

    const handleConfirm = async () => {
        try {
            const res = await fetch(`/api/test/${state.testId}/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Confirm success:", data);
                navigate("/loading");
            } else {
                // Read error as text to avoid JSON parse on HTML/404 page
                const errorText = await res.text();
                console.error("Confirm failed:", errorText);
                alert(`Failed to confirm: ${res.status} ${res.statusText}. Ensure backend is running on port 5000.`);
            }
        } catch (err) {
            console.error("Network error:", err);
            alert("Network error. Check if backend is running.");
        }
    };

    return (
        <div className="fade-in">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Your Test is Ready!</h2>
                <p className="text-gray-500 mb-6">
                    Send an email from your client to the addresses below. <br className="hidden sm:inline" />
                    You <strong className="text-red-600">must</strong> include the unique code in the subject or body.
                </p>
            </div>

            {/* Test Code */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg mb-6 text-center">
                <p className="font-semibold">Your Unique Test Code:</p>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-2xl font-mono tracking-wider">{state.testCode}</p>
                    <button
                        ref={copyCodeBtnRef}
                        onClick={() => copyToClipboard(state.testCode, copyCodeBtnRef)}
                        className="p-2 rounded-md hover:bg-yellow-200 transition"
                        title="Copy code"
                    >
                        <Copy className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Inboxes */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-between">
                    <span>Test Inboxes:</span>
                    <button
                        ref={copyInboxesBtnRef}
                        onClick={() => copyToClipboard(state.testInboxes.join(', '), copyInboxesBtnRef)}
                        className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
                        title="Copy all inboxes"
                    >
                        <Copy className="h-4 w-4" /> Copy All
                    </button>
                </h3>
                <div className="bg-gray-100 p-4 rounded-lg space-y-1 font-mono text-sm text-gray-700">
                    {state.testInboxes.map((inbox, i) => (
                        <p key={i}>{inbox}</p>
                    ))}
                </div>
            </div>

            <button
                onClick={handleConfirm}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-md"
                disabled={!state.testId}
            >
                I've Sent the Email - Check Now!
            </button>
        </div>
    );
};

export default SendEmail;