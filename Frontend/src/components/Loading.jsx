import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const Loading = () => {
    const { state, updateState } = useAppContext();
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('Initializing...');
    const navigate = useNavigate();

    useEffect(() => {
        const checkResults = async () => {
            try {
                const response = await fetch(`/api/check/${state.testId}`, { method: 'POST' });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                if (data.results) {
                    updateState({ results: data.results });
                    navigate('/report');
                    return;
                }
                // If not ready, simulate progress
                const interval = setInterval(() => {
                    setProgress((prev) => {
                        const newProgress = prev + 10;
                        if (newProgress >= 100) {
                            clearInterval(interval);
                            // Retry fetch after full progress
                            setTimeout(checkResults, 1000);
                            return 100;
                        }
                        setProgressText(`Checking ${state.testInboxes[Math.floor((newProgress / 100) * state.testInboxes.length)]}...`);
                        return newProgress;
                    });
                }, 500);
                return () => clearInterval(interval);
            } catch (err) {
                console.error(err);
                navigate('/report'); // Fallback
            }
        };

        checkResults();
    }, [state.testId, navigate, updateState]);

    return (
        <div className="fade-in text-center">
            <div className="mx-auto h-20 w-20 loader ease-linear rounded-full border-8 border-t-8 border-gray-200 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Analyzing Inboxes...</h2>
            <p className="text-gray-500 mb-6">This can take up to 5 minutes. We're checking where your email landed.</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">{progressText}</p>
        </div>
    );
};

export default Loading;