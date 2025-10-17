import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailPlus } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const StartTest = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { updateState } = useAppContext();
    const navigate = useNavigate();

    const handleStartTest = async (e) => {
        e.preventDefault();
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const response = await fetch('https://email-backend-u29t.onrender.com/api/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail: email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            updateState({ userEmail: email, testId: data.testId, testCode: data.testCode, testInboxes: data.testInboxes });
            navigate('/send');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center">
            <div className="mx-auto bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center border-4 border-blue-200 mb-4">
                <MailPlus className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Start a New Test</h2>
            <p className="text-gray-500 mb-6">Enter your email to receive the report and get your unique test code.</p>
            <form onSubmit={handleStartTest} className="space-y-4">
                <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="loader h-6 w-6 border-gray-200 border-t-blue-600 rounded-full" />
                    ) : (
                        'Get My Test Code'
                    )}
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

export default StartTest;