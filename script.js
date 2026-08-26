document.addEventListener("DOMContentLoaded", () => {

    // 1. Mobile Menu Toggle
    const hamburger = document.getElementById("hamburger");
    const nav = document.querySelector("nav");

    if (hamburger && nav) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            nav.classList.toggle("active");
        });

        document.querySelectorAll("nav a").forEach((link) => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                nav.classList.remove("active");
            });
        });
    }


    // 2. Scroll Reveal Animation
    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);
                    }

                });

            },
            {
                threshold: 0.15
            }
        );

        revealElements.forEach((el) => {
            revealObserver.observe(el);
        });

    } else {

        revealElements.forEach((el) => {
            el.classList.add("visible");
        });

    }


    // 3. Counter Animation
    const counters = document.querySelectorAll(
        ".about-stats-grid .counter"
    );

    const statsSection = document.querySelector(
        ".about-stats-grid"
    );

    let countersStarted = false;


    if (
        statsSection &&
        counters.length &&
        "IntersectionObserver" in window
    ) {

        const statsObserver = new IntersectionObserver(
            (entries) => {

                if (
                    entries[0].isIntersecting &&
                    !countersStarted
                ) {

                    countersStarted = true;


                    counters.forEach((counter) => {

                        const target = Number(
                            counter.getAttribute("data-target")
                        );

                        let current = 0;

                        const duration = 1600;

                        const increment =
                            target / (duration / 16);


                        const updateCounter = () => {

                            current += increment;


                            if (current < target) {

                                counter.textContent =
                                    Math.floor(current);

                                requestAnimationFrame(
                                    updateCounter
                                );

                            } else {

                                counter.textContent =
                                    target;

                            }

                        };


                        updateCounter();

                    });

                }

            },
            {
                threshold: 0.5
            }
        );


        statsObserver.observe(statsSection);


    } else {

        // Fallback
        counters.forEach((counter) => {

            counter.textContent =
                counter.getAttribute("data-target");

        });

    }


    // 4. Background Image Auto-Slider
    const slides = document.querySelectorAll(
        ".hero-bg-slider .slide"
    );

    let currentSlide = 0;

    const slideInterval = 5000;


    if (slides.length > 0) {

        function nextSlide() {

            slides[currentSlide].classList.remove(
                "active"
            );


            currentSlide =
                (currentSlide + 1) % slides.length;


            slides[currentSlide].classList.add(
                "active"
            );

        }


        setInterval(
            nextSlide,
            slideInterval
        );

    }

});

// Portfolio Filter Script
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        // Remove active class from all buttons
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");

        projectCards.forEach((card) => {
            const cardCategory = card.getAttribute("data-category");

            if (filterValue === "all" || filterValue === cardCategory) {
                card.classList.remove("hide");
            } else {
                card.classList.add("hide");
            }
        });
    });
});

// Contact Form Submission Feedback
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Thank you! Your inquiry has been received. Our engineering team will contact you shortly.");
        contactForm.reset();
    });
}

