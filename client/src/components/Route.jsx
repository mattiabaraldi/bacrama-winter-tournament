import { useEffect } from 'react';

const Route = ({ path, children }) => {
    useEffect(() => {
        // define callback as separate function so it can be removed later with cleanup function
        const onLocationChange = () => {
            console.log('Location Change');
        }

        window.addEventListener('popstate', onLocationChange);

        // clean up event listener
        return () => {
            window.removeEventListener('popstate', onLocationChange)
        };
    }, [])

    return window.location.pathname === path
    ? children
    : null;
}

export default Route;