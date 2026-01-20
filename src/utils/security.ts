/**
 * Discourages DevTools access by disabling right-click and common keyboard shortcuts.
 */
export const initSecurity = () => {
    if (process.env.NODE_ENV === 'development') return;

    // Disable Right-Click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Disable DevTools shortcuts
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        // Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
        }
        // Ctrl+Shift+C (Element Picker)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
        }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
        }
    });

    console.log('%c STOP! ', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%c This is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone, it is a scam and will give them access to your account. ', 'font-size: 16px;');
};
