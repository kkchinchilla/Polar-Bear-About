// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {

    // Initialize the main App object to hold all section logic
    window.App = window.App || {};

    const searchBar = document.querySelector('.fixed-search-bar');
    const logoImage = document.getElementById('site-logo'); // Get the logo image element (desktop logo in side-nav)
    const mobileLogo = document.getElementById('mobile-logo'); // Get the mobile logo element (logo-mark.svg)
    const sideNav = document.getElementById('side-nav'); // Get the side navigation element
    const wrapper = document.querySelector('.perspective-wrapper');
    const sections = document.querySelectorAll('body > section');
    const scrollHeightExtender = document.querySelector('.scroll-height-extender');
    const menuOverlay = document.createElement('div'); // Create the menu overlay element
    menuOverlay.classList.add('menu-overlay'); // Add the class to it
    document.body.appendChild(menuOverlay); // Append it to the body

    // Set the height of the scroll extender to allow scrolling through all sections.
    // Each section effectively needs 100vh of scroll space.
    scrollHeightExtender.style.height = `${sections.length * 100}vh`;

    // Force the wrapper's scroll position to the very top immediately on DOMContentLoaded
    // This is the first line of defense against remembered scroll positions.
    wrapper.scrollTop = 0;

    let currentSectionIndex = 0; // Tracks the currently active section
    let isScrolling = false; // Flag to prevent rapid scroll events

    /**
     * Updates the active section by applying/removing CSS classes.
     * This triggers the "come forward, expand, fade out" animation via CSS transitions.
     * @param {number} index The index of the section to make active.
     */
    const updateActiveSection = (index) => {
        sections.forEach((section, i) => {
            if (i === index) {
                // Current section: make it active (visible, expanded, forward)
                section.classList.add('active');
                section.classList.remove('passed'); // Ensure it's not marked as passed
            } else if (i < index) {
                // Sections that have been scrolled past: mark as passed (faded out, back)
                section.classList.remove('active');
                section.classList.add('passed');
            } else {
                // Future sections: reset to initial state (hidden, small, back)
                section.classList.remove('active');
                section.classList.remove('passed');
            }
        });
    };

    // Initial setup: activate the first section on page load
    // Call this AFTER setting scrollTop to ensure the visual state matches the scroll position
    updateActiveSection(currentSectionIndex);

    /**
     * Handles the scroll event for the wrapper.
     * Determines which section should be active based on scroll position.
     */
    wrapper.addEventListener('scroll', () => {
        // Calculate the current scroll position within the wrapper
        const scrollY = wrapper.scrollTop;
        // Get the height of the scrollable viewport (wrapper)
        const viewportHeight = wrapper.clientHeight;

        // Determine the target section index based on how much has been scrolled.
        // Each section effectively occupies one viewport height of scroll space.
        const targetIndex = Math.round(scrollY / viewportHeight);

        // If the target section is different from the current active one, update it
        if (targetIndex !== currentSectionIndex) {
            currentSectionIndex = targetIndex;
            updateActiveSection(currentSectionIndex);
        }
    });

    /**
     * Adds keyboard navigation for scrolling with Arrow Up/Down and Page Up/Down keys.
     * Provides an alternative to mouse/touch scrolling.
     */
    document.addEventListener('keydown', (e) => {
        if (isScrolling) return; // Prevent new scroll actions while one is in progress

        let newIndex = currentSectionIndex;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            // Move to the next section, ensuring not to go beyond the last section
            newIndex = Math.min(sections.length - 1, currentSectionIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            // Move to the previous section, ensuring not to go before the first section
            newIndex = Math.max(0, currentSectionIndex - 1);
        } else {
            return; // If it's not a relevant key, do nothing
        }

        // If a new section index is determined, initiate the scroll
        if (newIndex !== currentSectionIndex) {
            isScrolling = true; // Set flag to true
            currentSectionIndex = newIndex;

            // Programmatically scroll the wrapper to the top of the target section
            wrapper.scrollTo({
                top: currentSectionIndex * wrapper.clientHeight,
                behavior: 'smooth' // Smooth scroll animation
            });

            // Update the active state immediately for visual feedback during scroll
            updateActiveSection(currentSectionIndex);

            // Reset the scrolling flag after a delay slightly longer than the CSS transition
            // This ensures the animation has time to complete before another scroll is initiated
            setTimeout(() => {
                isScrolling = false;
            }, 900); // 800ms CSS transition + a small buffer
        }
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
            // Use wrapper.scrollTop and wrapper.scrollHeight for calculations
            const scrollHeight = wrapper.scrollHeight - wrapper.clientHeight;
            const scrollTop = wrapper.scrollTop;
            const scrollPercent = (scrollTop / scrollHeight) * 100;

            setProgress(scrollPercent);
        }

        // Listen to scroll events on the wrapper, not the window
        wrapper.addEventListener('scroll', onScroll);
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
    // Ensure menuOverlay is defined here.
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

// window.onload is still here as a fallback, but DOMContentLoaded with scrollRestoration
// should be more effective.
window.onload = () => {
    const wrapper = document.querySelector('.perspective-wrapper');
    if (wrapper) {
        wrapper.scrollTop = 0; // Force scroll to the top
    }
};