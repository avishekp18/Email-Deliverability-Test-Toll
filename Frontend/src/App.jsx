import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom'; // HashRouter for demo
import StartTest from './components/StartTest';
import SendEmail from './components/SendEmail';
import Loading from './components/Loading';
import Report from './components/Report';
import { AppProvider } from './contexts/AppContext'; // For state sharing
import DemoBanner from "./components/DemoBanner";

function AppContent() {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('report_id');

  return (
    <>
      <DemoBanner
        id="my-demo-banner"
        message="Demo environment — data is simulated. Do not use for production."
        color="blue"
        showIcon
        dismissible
      />
      <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8 mt-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Email Deliverability Test</h1>
          <p className="text-lg text-gray-600 mt-2">Find out where your email lands: Inbox, Spam, or Promotions.</p>
        </header>
        <main className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 max-w-4xl">
          <Routes>
            <Route path="/" element={<StartTest />} />
            <Route path="/send" element={<SendEmail />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/report" element={<Report />} />
            {reportId && <Route path="/report" element={<Report initialTestId={reportId} />} />}
          </Routes>
        </main>
        <footer className="text-center mt-8 text-sm text-gray-400">
          <p>Email Spam Report Tool &copy; 2025</p>
        </footer>
      </div>
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;