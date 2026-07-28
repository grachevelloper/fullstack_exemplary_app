import {createContext, ReactNode, useContext, useEffect, useState} from 'react';

import {useLayout} from '../../hooks';

import {SidebarContextType} from './types';

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({children}: {children: ReactNode}) => {
    const {isDesktop} = useLayout();
    const isResumePage = window.location.pathname === '/resume';
    const [isCollapsed, setCollapsed] = useState<boolean>(!isDesktop);
    const toggleCollapsed = () => {
        setCollapsed((prev) => !prev);
    };

    useEffect(() => {
        if (isResumePage) {
            setTimeout(() => {
                setCollapsed(true);
            }, 0);
        }
    }, [isResumePage]);

    return (
        <SidebarContext.Provider
            value={{isCollapsed, setCollapsed, toggleCollapsed}}
        >
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
