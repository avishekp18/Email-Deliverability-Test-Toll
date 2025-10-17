import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [state, setState] = useState({
        testId: null,
        testCode: null,
        userEmail: '',
        testInboxes: [],
        results: null,
        loading: false,
    });

    const updateState = (newState) => setState(prev => ({ ...prev, ...newState }));

    return (
        <AppContext.Provider value={{ state, updateState }}>
            {children}
        </AppContext.Provider>
    );
};