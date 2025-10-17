import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Inbox, ShieldAlert, Tag, XCircle, Share2, Download } from "lucide-react"; // Added Download icon
import { useAppContext } from "../contexts/AppContext";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "react-toastify/dist/ReactToastify.css";

const Report = () => {
    const { state, updateState } = useAppContext();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const testId = state.testId || searchParams.get("report_id");

    useEffect(() => {
        if (testId && !state.results) {
            fetchReport(testId);
        } else if (state.results) {
            setLoading(false);
        } else {
            toast.error("No report available. Start a new test.");
            navigate("/");
        }
    }, [testId, state.testId, state.results, navigate]);

    const fetchReport = async (id) => {
        try {
            const response = await fetch(`/api/report/${id}`);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
            }
            const data = await response.json();
            updateState({
                testId: id,
                testCode: data.testCode,
                testInboxes: data.testInboxes,
                results: data.results,
            });
            setLoading(false);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error(`Failed to load report: ${err.message}`);
            navigate("/");
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}${window.location.pathname}?report_id=${state.testId}`;
        const title = "Email Deliverability Report";
        const text = "Check out my deliverability test report!";

        // ✅ If Web Share API is supported (mobile/tablet)
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                toast.success("Shared successfully!");
            } catch (err) {
                console.error("Share failed:", err);
                toast.error("Failed to share link.");
            }
        }
        // ✅ Otherwise, fallback to Clipboard
        else if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
            } catch (err) {
                console.error("Clipboard copy failed:", err);
                // Old fallback for very old browsers
                const textarea = document.createElement("textarea");
                textarea.value = url;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                toast.success("Link copied using fallback!");
            }
        }
        // ✅ Last resort (super old browsers)
        else {
            const textarea = document.createElement("textarea");
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            toast.success("Link copied to clipboard!");
        }
    };


    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = 20;

        // 🏷️ Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Email Deliverability Report", pageWidth / 2, y, { align: "center" });
        y += 10;

        // 🧾 Test Details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Test Code: ${state.testCode}`, margin, y);
        y += 7;
        doc.text(`Generated On: ${new Date().toLocaleString()}`, margin, y);
        y += 10;

        // 📋 Table Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, y, pageWidth - margin * 2, 9, "F");
        doc.text("No.", margin + 2, y + 6);
        doc.text("Inbox", margin + 15, y + 6);
        doc.text("Status", pageWidth - 60, y + 6);
        doc.text("Folder", pageWidth - 30, y + 6);
        y += 11;

        // 📨 Table Rows
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        state.results.forEach((result, i) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            const statusColor = result.status === "Received" ? [0, 150, 0] : [200, 0, 0];
            const folder = result.folder || "—";

            doc.text(String(i + 1), margin + 2, y);
            doc.text(result.inbox, margin + 15, y);

            doc.setTextColor(...statusColor);
            doc.text(result.status, pageWidth - 60, y);
            doc.setTextColor(0, 0, 0);

            doc.text(folder, pageWidth - 30, y);
            y += 8;
        });

        // 📄 Summary Section
        y += 10;
        const inboxCount = state.results.filter(r => r.folder === "Inbox").length;
        const promoCount = state.results.filter(r => r.folder === "Promotions").length;
        const spamCount = state.results.filter(r => r.folder === "Spam").length;
        const notReceivedCount = state.results.filter(r => r.status === "Not Received").length;

        doc.setFont("helvetica", "bold");
        doc.text("Summary:", margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.text(`Inbox: ${inboxCount}`, margin, y);
        doc.text(`Promotions: ${promoCount}`, margin + 50, y);
        doc.text(`Spam: ${spamCount}`, margin + 100, y);
        doc.text(`Not Received: ${notReceivedCount}`, margin + 150, y);

        // 🖊️ Footer
        y = doc.internal.pageSize.height - 15;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Generated by Email Deliverability Test Tool", pageWidth / 2, y, { align: "center" });

        // 💾 Save file
        doc.save(`Deliverability_Report_${state.testCode}.pdf`);
        toast.success("📄 PDF report downloaded successfully!");
    };


    if (loading) {
        return (
            <div className="text-center min-h-screen flex items-center justify-center">
                <div className="loader mx-auto h-20 w-20 border-8 border-t-8 border-gray-200 animate-spin" />
                <p className="mt-4 text-gray-600">Loading report...</p>
            </div>
        );
    }

    if (!state.results) {
        return (
            <div className="text-center min-h-screen flex items-center justify-center">
                <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No Results Yet</h2>
                    <p className="text-gray-500 mb-6">No report available. Start a new test?</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Start New Test
                    </button>
                </div>
            </div>
        );
    }

    const getResultItem = (result) => {
        let icon, colorClass, folderBadge = "";
        switch (result.folder) {
            case "Inbox":
                icon = <Inbox className="h-6 w-6" />;
                colorClass = "text-green-600";
                folderBadge = <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">Inbox</span>;
                break;
            case "Spam":
                icon = <ShieldAlert className="h-6 w-6" />;
                colorClass = "text-red-600";
                folderBadge = <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full">Spam</span>;
                break;
            case "Promotions":
                icon = <Tag className="h-6 w-6" />;
                colorClass = "text-blue-600";
                folderBadge = <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">Promotions</span>;
                break;
            default:
                icon = <XCircle className="h-6 w-6" />;
                colorClass = "text-gray-500";
                folderBadge = <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full">Not Received</span>;
        }

        return (
            <div key={result.inbox} className="flex items-center p-4 bg-white rounded-lg shadow-md border border-gray-100 hover:bg-gray-50 transition duration-200">
                <div className={`mr-4 ${colorClass}`}>{icon}</div>
                <div className="flex-grow">
                    <p className="font-medium text-gray-800">{result.inbox}</p>
                </div>
                <div>{folderBadge}</div>
            </div>
        );
    };

    return (
        <div className="fade-in min-h-screen py-8 bg-gray-50">
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center pb-6 border-b border-gray-200">
                    <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center border-4 border-green-200">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold mt-4">Report Ready!</h2>
                    <p className="text-gray-500 mt-2">Test Code: <span className="font-mono">{state.testCode}</span></p>
                </div>

                <div className="space-y-4 mt-6">
                    {state.results.map(getResultItem)}
                </div>

                <div className="flex flex-cols justify-center mt-8 text-center space-x-4">
                    <button
                        onClick={handleShare}
                        className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 flex items-center gap-2 transition duration-200"
                    >
                        <Share2 className="h-5 w-5" /> Share Report
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition duration-200"
                    >
                        <Download className="h-5 w-5" /> Download PDF
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Report;