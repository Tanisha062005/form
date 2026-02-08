import { useState, useEffect } from 'react';

export default function useDeviceType() {
    const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setDevice('mobile');
            } else if (width >= 768 && width <= 1024) {
                setDevice('tablet');
            } else {
                setDevice('desktop');
            }
        };

        // Set initial value
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return device;
}
