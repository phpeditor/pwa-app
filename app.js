const APP = {
    deferredInstall: null,
    pwaCheck: true,
    pwaTime: 300,
    scrollCheck: true,
    async init() {
        if ('serviceWorker' in navigator) {
            await APP.isInstalled();
            //register our service worker
            navigator.serviceWorker
                .register('/sw.js', {
                    updateViaCache: 'none',
                    scope: '/',
                })
                .then(() => {
                    //listen for messages
                    navigator.serviceWorker.addEventListener('message', ({data}) => {
                        //received a message from the service worker
                    });

                    //listen for `appinstalled` event
                    window.addEventListener('appinstalled', (evt) => {
                        //deprecated but still runs in Chrome-based browsers.
                        //Not very useful event.
                        //Better to use the DOMContentLoaded and then look at how it was launched
                    });

                    //listen for `beforeinstallprompt` event
                    window.addEventListener('beforeinstallprompt', (ev) => {
                        // Prevent the mini-infobar from appearing on mobile
                        ev.preventDefault();
                        // Stash the event so it can be triggered later.
                        APP.deferredInstall = ev;
                        console.log('saved the install event');
                        // Update UI notify the user they can install the PWA
                        // if you want here...
                    });
                    if((sessionStorage.getItem('pwaCheck')==null || sessionStorage.getItem('pwaCheck')<Math.floor(Date.now() / 1000)) && APP.pwaCheck && !APP.isShow() && window.screen.width<768) {
                        //finished registering
                        document.getElementById('pwaBlock').style.display = 'flex';

                        //listen for scroll event
                        let scrollPos = 0;
                        window.addEventListener('scroll', (e) => {
                            let windowY = window.scrollY;
                            if (APP.scrollCheck) {
                                if (windowY < scrollPos) {
                                    document.getElementById('pwaBlock').style.bottom = '0';
                                } else {
                                    document.getElementById('pwaBlock').style.bottom = '-60px';
                                }
                                scrollPos = windowY;
                            }
                        });
                        let btn = document.getElementById('pwaInstall');
                        btn?.addEventListener('click', APP.startChromeInstall);
                        let btn_close = document.getElementById('pwaClose');
                        btn_close?.addEventListener('click', APP.close);
                    } else {
                        APP.scrollCheck = false;
                        document.getElementById('pwaBlock').style.display = 'none';
                    }
                })
                .catch((err) => {
                    console.warn('Failed to register', err.message);
                    APP.scrollCheck = false;
                    document.getElementById('pwaBlock').style.display = 'none';
                });
        } else {
            APP.scrollCheck = false;
            document.getElementById('pwaBlock').style.display = 'none';
        }
    },
    startChromeInstall() {
        if (APP.deferredInstall) {
            console.log(APP.deferredInstall);
            APP.deferredInstall.prompt();
            APP.deferredInstall.userChoice.then((choice) => {
                if (choice.outcome == 'accepted') {
                    // app installed
                    console.log('installed');
                    APP.scrollCheck = false;
                    document.getElementById('pwaBlock').style.bottom = '-60px';
                    APP.pwaCheck = false;
                } else {
                    // app cancel installed
                    console.log('cancel');
                }
            });
        }
    },
    close() {
        APP.scrollCheck = 0;
        document.getElementById('pwaBlock').style.bottom = '-60px';
        sessionStorage.setItem('pwaCheck', Math.floor(Date.now() / 1000)+APP.pwaTime);
    },
    isShow() {
        // For iOS
        if(window.navigator.standalone) return true

        // For Android
        if(window.matchMedia('(display-mode: standalone)').matches) return true

        // If neither is true, it's not installed
        return false
    },
    async isInstalled() {
        const relatedApps = await navigator.getInstalledRelatedApps();
        if(relatedApps.length) {
            relatedApps.forEach((app) => {
                if (app.id == 'autodata') {
                    APP.pwaCheck = false;
                }
            });
        }
    }
};
document.addEventListener('DOMContentLoaded', APP.init);