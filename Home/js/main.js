// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {

    // Initialize the main App object to hold all section logic
    window.App = window.App || {};

    const sections = document.querySelectorAll('.content-section');
    const searchBar = document.querySelector('.fixed-search-bar');
    const logoImage = document.getElementById('site-logo'); // Get the logo image element (desktop logo in side-nav)
    const mobileLogo = document.getElementById('mobile-logo'); // Get the mobile logo element (logo-mark.svg)
    const sideNav = document.getElementById('side-nav'); // Get the side navigation element

    // Create an overlay element for closing the menu
    const menuOverlay = document.createElement('div');
    menuOverlay.classList.add('menu-overlay');
    document.body.appendChild(menuOverlay); // Append it to the body

    // --- Intersection Observer Logic (UPDATED) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                const sectionNumber = entry.target.dataset.section;

                // Create the key to access the correct section logic, e.g., "section1"
                const sectionKey = 'section' + sectionNumber;

                // Check if the logic for this section exists and has an init method
                if (App[sectionKey] && typeof App[sectionKey].init === 'function') {
                    // Call the init function from our global App object
                    App[sectionKey].init();
                }

            } else {
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });


    // --- Interactive Search Bar Logic (remains the same) ---
    if (searchBar) {
        searchBar.addEventListener('mouseenter', () => {
            searchBar.classList.add('hovered');
        });

        searchBar.addEventListener('mouseleave', () => {
            // Check if the input is focused before removing the hovered class
            if (document.activeElement !== searchBar.querySelector('.search-input')) {
                searchBar.classList.remove('hovered');
            }
        });

        // Add focus/blur listeners to keep it open while typing
        const searchInput = searchBar.querySelector('.search-input');
        searchInput.addEventListener('focus', () => {
            searchBar.classList.add('hovered');
        });
        searchInput.addEventListener('blur', () => {
            searchBar.classList.remove('hovered');
        });
    }

    // --- Scroll Progress Ring Logic ---
    const indicator = document.querySelector('.progress-ring__indicator');
    const percentageText = document.querySelector('.progress-ring__percentage'); // Get the text element

    if (indicator && percentageText) {
        const radius = indicator.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;

        indicator.style.strokeDasharray = `${circumference} ${circumference}`;
        indicator.style.strokeDashoffset = circumference;

        function setProgress(percent) {
            const offset = circumference - (percent / 100 * circumference);
            indicator.style.strokeDashoffset = offset;
            percentageText.textContent = `${Math.round(percent)}%`; // Update the text
        }

        function onScroll() {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTop = window.scrollY;
            const scrollPercent = (scrollTop / scrollHeight) * 100;

            setProgress(scrollPercent);
        }

        window.addEventListener('scroll', onScroll);
        // Call onScroll once on load to set initial percentage to 0% if at the top
        onScroll();
    }

    // --- Mode Toggle Functionality ---
    const modeToggle = document.getElementById('mode-toggle');
    const body = document.body;
    // const sideNav = document.getElementById('side-nav'); // Already declared above
    // const scrollProgressContainer = document.querySelector('.scroll-progress-container'); // Not used here

    if (modeToggle) {
         modeToggle.addEventListener('click', () => {
             // We only need to toggle the class on the body.
             // The CSS will handle all visual changes automatically.
             body.classList.toggle('dark-mode');

             // Store the user's preference in local storage
             localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');

             // Change logo based on dark mode
             // logoImage refers to the desktop logo inside the side-nav
             if (body.classList.contains('dark-mode')) {
                 logoImage.src = 'img/logo-on-black.png'; // Updates desktop logo in side-nav
                 if (mobileLogo) {
                     mobileLogo.src = 'img/logo-mark-on-black.svg'; // Updates mobile logo
                 }
             } else {
                 logoImage.src = 'img/logo.png'; // Updates desktop logo in side-nav
                 if (mobileLogo) {
                     mobileLogo.src = 'img/logo-mark.svg'; // Updates mobile logo
                 }
             }
         });

         // Check for saved theme preference on page load
         const savedTheme = localStorage.getItem('theme');
         if (savedTheme === 'dark') {
             body.classList.add('dark-mode');
             logoImage.src = 'img/logo-on-black.png'; // Apply logo change on load if dark mode is saved
             if (mobileLogo) {
                 mobileLogo.src = 'img/logo-mark-on-black.svg'; // Apply dark mode to mobile logo on load
             }
         }
     }

    // --- Interactive Social Connect Logic (Definitive Version) ---
    const connectContainer = document.querySelector('.social-connect-container');
    const connectIcon = document.querySelector('.connect-icon');

    if (connectContainer && connectIcon) {
        // START the animation only when the mouse enters the visible icon
        connectIcon.addEventListener('mouseenter', () => {
            connectContainer.classList.add('is-active');
        });

        // END the animation only when the mouse leaves the entire container stage
        connectContainer.addEventListener('mouseleave', () => {
            connectContainer.classList.remove('is-active');
        });
    }

    // --- Mobile Menu Toggle Logic ---
    if (mobileLogo && sideNav && menuOverlay) {
        mobileLogo.addEventListener('click', () => {
            sideNav.classList.add('menu-open'); // Always add when clicking logo
            menuOverlay.classList.add('is-active'); // Show overlay
        });

        menuOverlay.addEventListener('click', () => {
            sideNav.classList.remove('menu-open'); // Close menu
            menuOverlay.classList.remove('is-active'); // Hide overlay
        });

        // Optionally, close menu when a nav link is clicked
        const navLinks = sideNav.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                sideNav.classList.remove('menu-open');
                menuOverlay.classList.remove('is-active');
            });
        });
    }

});
