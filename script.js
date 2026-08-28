// ============================================================
// AS CONSTRUCTION - MAIN JAVASCRIPT
// ============================================================

// ============================================================
// 1. FIREBASE CONFIG & INITIALIZATION
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyB8uFBZKFHWJp_lwHRLNlO_h_90JFr168",
    authDomain: "as-construction-web-e0ca4.firebaseapp.com",
    projectId: "as-construction-web-e0ca4",
    storageBucket: "as-construction-web-e0ca4.firebasestorage.app",
    messagingSenderId: "881497663137",
    appId: "1:881497663137:web:d1e90e4f641e9c9f88b2e0"
};

let db = null;

try {
    if (typeof firebase !== "undefined") {

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        db = firebase.firestore();

    } else {
        console.warn(
            "Firebase SDK is not loaded. Reviews will be unavailable."
        );
    }

} catch (error) {
    console.error("Firebase initialization error:", error);
    db = null;
}


// ============================================================
// 2. HTML ESCAPE / SECURITY HELPER
// ============================================================

function escapeHTML(str) {
    if (!str) return "";

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// 3. SUCCESS POPUP
// ============================================================

function showSuccessPopup() {

    let popup = document.getElementById("customPopup");

    if (!popup) {

        popup = document.createElement("div");

        popup.id = "customPopup";
        popup.className = "custom-popup-overlay";

        popup.innerHTML = `
            <div class="custom-popup-card">

                <i class="fa-solid fa-circle-check success-icon"></i>

                <h3>Thanks for review!</h3>

                <p>
                    Your feedback has been published successfully.
                </p>

                <button type="button" onclick="closeSuccessPopup()">
                    OK
                </button>

            </div>
        `;

        document.body.appendChild(popup);
    }

    popup.style.display = "flex";
}


function closeSuccessPopup() {

    const popup = document.getElementById("customPopup");

    if (popup) {
        popup.style.display = "none";
    }
}


// ============================================================
// 4. REAL-TIME REVIEWS
// ============================================================

function listenForReviews() {

    const slider = document.getElementById("reviewsSlider");

    if (!slider) return;

    if (!db) {
        console.warn("Reviews unavailable because Firebase is not connected.");
        return;
    }

    try {

        db.collection("reviews")
            .orderBy("timestamp", "desc")
            .onSnapshot(

                (snapshot) => {

                    if (snapshot.empty) {

                        slider.innerHTML = `
                            <p style="
                                color:#888;
                                text-align:center;
                                width:100%;
                            ">
                                Be the first to leave a review!
                            </p>
                        `;

                        return;
                    }

                    let htmlBuffer = "";

                    snapshot.forEach((doc) => {

                        const rev = doc.data() || {};

                        let ratingNum = parseInt(rev.rating, 10);

                        if (
                            isNaN(ratingNum) ||
                            ratingNum < 1 ||
                            ratingNum > 5
                        ) {
                            ratingNum = 5;
                        }

                        const starsHTML =
                            "★".repeat(ratingNum) +
                            "☆".repeat(5 - ratingNum);

                        const rawName =
                            rev.name && String(rev.name).trim()
                                ? String(rev.name).trim()
                                : "Anonymous";

                        const cleanName = escapeHTML(rawName);

                        const cleanText =
                            escapeHTML(rev.text || "");

                        const cleanRole =
                            escapeHTML(rev.role || "Client");

                        const cleanProjectType =
                            escapeHTML(rev.projectType || "");

                        const firstLetter =
                            rawName.charAt(0).toUpperCase() || "A";

                        const roleDisplay =
                            cleanProjectType
                                ? `${cleanRole} • ${cleanProjectType}`
                                : cleanRole;

                        htmlBuffer += `
                            <div class="review-card">

                                <div class="card-header-row">

                                    <div class="user-info">

                                        <div class="avatar-initial">
                                            ${escapeHTML(firstLetter)}
                                        </div>

                                        <div class="user-details">

                                            <div class="client-name">
                                                ${cleanName}
                                            </div>

                                            <div class="client-role">
                                                ${roleDisplay}
                                            </div>

                                        </div>

                                    </div>

                                    <i class="fa-solid fa-quote-right quote-icon"></i>

                                </div>

                                <div class="rating-row">

                                    <span class="stars">
                                        ${starsHTML}
                                    </span>

                                    <span class="rating-score">
                                        ${ratingNum.toFixed(1)}
                                    </span>

                                </div>

                                <p class="review-text">
                                    "${cleanText}"
                                </p>

                            </div>
                        `;
                    });

                    slider.innerHTML = htmlBuffer;
                },

                (error) => {
                    console.error(
                        "Error fetching reviews:",
                        error
                    );
                }
            );

    } catch (error) {

        console.error(
            "Review listener error:",
            error
        );
    }
}


// ============================================================
// 5. REVIEW AUTO SLIDER
// ============================================================

let autoSlideInterval = null;


function startAutoSlide() {

    const slider = document.getElementById("reviewsSlider");

    if (!slider) return;

    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }

    autoSlideInterval = setInterval(() => {

        if (!slider || slider.scrollWidth <= slider.clientWidth) {
            return;
        }

        const maxScroll =
            slider.scrollWidth - slider.clientWidth;

        if (slider.scrollLeft >= maxScroll - 10) {

            slider.scrollTo({
                left: 0,
                behavior: "smooth"
            });

        } else {

            slider.scrollBy({
                left: 360,
                behavior: "smooth"
            });
        }

    }, 4000);
}


function stopAutoSlide() {

    if (autoSlideInterval) {

        clearInterval(autoSlideInterval);

        autoSlideInterval = null;
    }
}


// ============================================================
// 6. DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------------------
    // Reviews
    // --------------------------------------------------------

    listenForReviews();

    startAutoSlide();

    const sliderElem =
        document.getElementById("reviewsSlider");

    if (sliderElem) {

        sliderElem.addEventListener("mouseenter", () => {
            stopAutoSlide();
        });

        sliderElem.addEventListener("mouseleave", () => {
            startAutoSlide();
        });
    }


    // --------------------------------------------------------
    // Star Rating
    // --------------------------------------------------------

    const stars =
        document.querySelectorAll("#starRating .star");

    const ratingInput =
        document.getElementById("custRating");

    stars.forEach((star) => {

        star.addEventListener("click", function () {

            const selectedVal =
                parseInt(
                    this.getAttribute("data-value"),
                    10
                );

            if (ratingInput) {
                ratingInput.value = selectedVal;
            }

            stars.forEach((s) => {

                const itemVal =
                    parseInt(
                        s.getAttribute("data-value"),
                        10
                    );

                if (itemVal <= selectedVal) {

                    s.classList.add("active");

                    s.style.color = "#ffc107";

                } else {

                    s.classList.remove("active");

                    s.style.color = "#444";
                }
            });
        });
    });


    // --------------------------------------------------------
    // Character Counter
    // --------------------------------------------------------

    const messageInput =
        document.getElementById("custMessage");

    const wordCounter =
        document.getElementById("wordCounter");

    if (messageInput && wordCounter) {

        messageInput.addEventListener("input", () => {

            const charCount =
                messageInput.value.length;

            wordCounter.textContent =
                `${charCount}/100`;

            wordCounter.style.color =
                charCount >= 100
                    ? "#ff4d4d"
                    : "#2ecc71";
        });
    }


    // --------------------------------------------------------
    // Review Form
    // --------------------------------------------------------

    const reviewForm =
        document.getElementById("reviewForm");

    if (reviewForm) {

        reviewForm.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();

                const message =
                    messageInput
                        ? messageInput.value.trim()
                        : "";

                if (message.length > 100) {

                    alert(
                        "Maximum 100 characters allowed!"
                    );

                    return;
                }

                const firstName =
                    document
                        .getElementById("custFirstName")
                        ?.value.trim() || "";

                const lastName =
                    document
                        .getElementById("custLastName")
                        ?.value.trim() || "";

                const fullName =
                    `${firstName} ${lastName}`.trim();

                const projectType =
                    document
                        .getElementById("projectType")
                        ?.value || "";

                const role =
                    document
                        .getElementById("custRole")
                        ?.value || "";

                const email =
                    document
                        .getElementById("custEmail")
                        ?.value.trim() || "";

                const rating =
                    ratingInput
                        ? parseInt(
                            ratingInput.value,
                            10
                        ) || 5
                        : 5;

                const submitBtn =
                    this.querySelector(
                        ".submit-review-btn"
                    );

                const originalBtnText =
                    submitBtn
                        ? submitBtn.innerHTML
                        : "Submit";


                if (submitBtn) {

                    submitBtn.innerText =
                        "Submitting...";

                    submitBtn.disabled = true;
                }


                // Firebase unavailable
                if (!db) {

                    alert(
                        "Review service is temporarily unavailable. Please try again later."
                    );

                    if (submitBtn) {

                        submitBtn.innerHTML =
                            originalBtnText;

                        submitBtn.disabled = false;
                    }

                    return;
                }


                try {

                    await db
                        .collection("reviews")
                        .add({

                            name: fullName,

                            firstName: firstName,

                            lastName: lastName,

                            projectType: projectType,

                            role: role,

                            email: email,

                            rating: rating,

                            text: message,

                            timestamp:
                                firebase
                                    .firestore
                                    .FieldValue
                                    .serverTimestamp()
                        });


                    // Success
                    showSuccessPopup();

                    this.reset();


                    if (wordCounter) {

                        wordCounter.textContent =
                            "0/100";

                        wordCounter.style.color =
                            "#2ecc71";
                    }


                    // Reset stars to 5
                    stars.forEach((star) => {

                        star.classList.add("active");

                        star.style.color =
                            "#ffc107";
                    });

                    if (ratingInput) {
                        ratingInput.value = 5;
                    }


                } catch (error) {

                    console.error(
                        "Error submitting review:",
                        error
                    );

                    alert(
                        "Could not submit review. Please try again."
                    );

                } finally {

                    if (submitBtn) {

                        submitBtn.innerHTML =
                            originalBtnText;

                        submitBtn.disabled = false;
                    }
                }
            }
        );
    }


    // ========================================================
    // 7. SCROLL REVEAL
    // ========================================================

    // IMPORTANT:
    // Only ONE revealElements and ONE observer are used.
    // This fixes the duplicate declaration error.

    const revealElements =
        document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );
                        }
                    });

                },
                {
                    threshold: 0.15
                }
            );

        revealElements.forEach((element) => {

            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach((element) => {

            element.classList.add("visible");
        });
    }


    // ========================================================
    // 8. COUNTER ANIMATION
    // ========================================================

    const counters =
        document.querySelectorAll(
            ".about-stats-grid .counter"
        );

    const statsSection =
        document.querySelector(
            ".about-stats-grid"
        );

    let countersStarted = false;


    function setCountersToTarget() {

        counters.forEach((counter) => {

            counter.textContent =
                counter.getAttribute(
                    "data-target"
                ) || "0";
        });
    }


    if (
        statsSection &&
        counters.length &&
        "IntersectionObserver" in window
    ) {

        const statsObserver =
            new IntersectionObserver(
                (entries) => {

                    if (
                        entries[0].isIntersecting &&
                        !countersStarted
                    ) {

                        countersStarted = true;

                        counters.forEach(
                            (counter) => {

                                const target =
                                    Number(
                                        counter.getAttribute(
                                            "data-target"
                                        )
                                    );

                                if (
                                    isNaN(target)
                                ) {
                                    counter.textContent =
                                        "0";
                                    return;
                                }

                                let current = 0;

                                const duration =
                                    1600;

                                const increment =
                                    target /
                                    (duration / 16);


                                const updateCounter =
                                    () => {

                                        current +=
                                            increment;

                                        if (
                                            current <
                                            target
                                        ) {

                                            counter.textContent =
                                                Math.floor(
                                                    current
                                                );

                                            requestAnimationFrame(
                                                updateCounter
                                            );

                                        } else {

                                            counter.textContent =
                                                target;
                                        }
                                    };


                                updateCounter();
                            }
                        );
                    }
                },
                {
                    threshold: 0.5
                }
            );


        statsObserver.observe(
            statsSection
        );

    } else {

        setCountersToTarget();
    }


    // ========================================================
    // 9. HERO BACKGROUND SLIDER
    // ========================================================

    const slides =
        document.querySelectorAll(
            ".hero-bg-slider .slide"
        );

    let currentSlide = 0;

    if (slides.length > 1) {

        slides.forEach((slide, index) => {

            slide.classList.toggle(
                "active",
                index === 0
            );
        });


        setInterval(() => {

            slides[currentSlide]
                .classList.remove("active");

            currentSlide =
                (currentSlide + 1) %
                slides.length;

            slides[currentSlide]
                .classList.add("active");

        }, 5000);
    }


    // ========================================================
    // 10. PORTFOLIO FILTER
    // ========================================================

    const filterBtns =
        document.querySelectorAll(
            ".filter-btn"
        );

    const projectCards =
        document.querySelectorAll(
            ".project-card"
        );


    filterBtns.forEach((btn) => {

        btn.addEventListener("click", () => {

            filterBtns.forEach((button) => {

                button.classList.remove(
                    "active"
                );
            });


            btn.classList.add("active");


            const filterValue =
                btn.getAttribute(
                    "data-filter"
                );


            projectCards.forEach((card) => {

                const cardCategory =
                    card.getAttribute(
                        "data-category"
                    );


                if (
                    filterValue === "all" ||
                    filterValue === cardCategory
                ) {

                    card.classList.remove(
                        "hide"
                    );

                } else {

                    card.classList.add(
                        "hide"
                    );
                }
            });
        });
    });


    // ========================================================
    // 11. CONTACT FORM -> WHATSAPP
    // ========================================================

    const contactForm =
        document.getElementById(
            "contactForm"
        );


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            function (e) {

                e.preventDefault();


                const name =
                    document
                        .getElementById("name")
                        ?.value.trim() || "";

                const phone =
                    document
                        .getElementById("phone")
                        ?.value.trim() || "";

                const email =
                    document
                        .getElementById("email")
                        ?.value.trim() || "";

                const service =
                    document
                        .getElementById("service")
                        ?.value || "";

                const message =
                    document
                        .getElementById("message")
                        ?.value.trim() || "";


                if (
                    !name ||
                    !phone ||
                    !message
                ) {

                    alert(
                        "Please fill in all required fields."
                    );

                    return;
                }


                const whatsappMessage =
`*AS CONSTRUCTION*
━━━━━━━━━━━━━━━━━━
*NEW PROJECT ENQUIRY*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📧 *Email:* ${email || "Not provided"}
🏗️ *Service:* ${service || "Not specified"}
📝 *Project Details:* ${message}
━━━━━━━━━━━━━━━━━━`;


                const whatsappNumber =
                    "917249371499";


                const whatsappURL =
                    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        whatsappMessage
                    )}`;


                window.open(
                    whatsappURL,
                    "_blank",
                    "noopener,noreferrer"
                );
            }
        );
    }


    // ========================================================
    // 12. REVIEW MANUAL SLIDER BUTTONS
    // ========================================================

    const prevBtn =
        document.getElementById(
            "prevBtn"
        );

    const nextBtn =
        document.getElementById(
            "nextBtn"
        );


    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            () => {

                const slider =
                    document.getElementById(
                        "reviewsSlider"
                    );

                if (!slider) return;

                slider.scrollBy({
                    left: -360,
                    behavior: "smooth"
                });
            }
        );
    }


    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            () => {

                const slider =
                    document.getElementById(
                        "reviewsSlider"
                    );

                if (!slider) return;

                slider.scrollBy({
                    left: 360,
                    behavior: "smooth"
                });
            }
        );
    }


    // ========================================================
    // 13. ACTIVE NAVIGATION LINK
    // ========================================================

    const sections =
        document.querySelectorAll(
            "section[id], div[id]"
        );

    const navLinks =
        document.querySelectorAll(
            ".mobile-nav-links .menu-item, #mainNav a"
        );


    function changeNavOnScroll() {

        const scrollPosition =
            window.scrollY + 200;


        sections.forEach((section) => {

            const sectionTop =
                section.offsetTop;

            const sectionHeight =
                section.offsetHeight;

            const sectionId =
                section.getAttribute("id");


            if (!sectionId) return;


            if (
                scrollPosition >= sectionTop &&
                scrollPosition <
                    sectionTop + sectionHeight
            ) {

                navLinks.forEach((link) => {

                    link.classList.remove(
                        "active"
                    );


                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        href ===
                        `#${sectionId}`
                    ) {

                        link.classList.add(
                            "active"
                        );
                    }
                });
            }
        });
    }


    window.addEventListener(
        "scroll",
        changeNavOnScroll,
        {
            passive: true
        }
    );


    // Run once on page load
    changeNavOnScroll();


    // ========================================================
    // 14. SERVICES - MOBILE TAP ANIMATION
    // ========================================================

    const serviceCards =
        document.querySelectorAll(
            ".service-card"
        );


    serviceCards.forEach((card) => {

        card.addEventListener(
            "click",
            function () {

                if (window.innerWidth <= 992) {

                    serviceCards.forEach(
                        (otherCard) => {

                            if (
                                otherCard !==
                                card
                            ) {

                                otherCard.classList.remove(
                                    "active"
                                );
                            }
                        }
                    );


                    card.classList.toggle(
                        "active"
                    );
                }
            }
        );
    });

});


// ============================================================
// 15. MOBILE MENU
// ============================================================

document.addEventListener(
    "click",
    function (event) {

        const mobileMenu =
            document.getElementById(
                "mobileMenu"
            );


        // Hamburger
        const hamburgerBtn =
            event.target.closest(
                "#hamburger"
            );


        if (hamburgerBtn) {

            event.preventDefault();

            if (mobileMenu) {

                mobileMenu.classList.add(
                    "active"
                );
            }

            document.body.classList.add(
                "menu-open"
            );

            return;
        }


        // Close button
        const closeBtn =
            event.target.closest(
                "#closeMenu"
            );


        if (closeBtn) {

            event.preventDefault();

            if (mobileMenu) {

                mobileMenu.classList.remove(
                    "active"
                );
            }

            document.body.classList.remove(
                "menu-open"
            );

            return;
        }


        // Mobile navigation link
        const navLink =
            event.target.closest(
                ".mobile-nav-links a"
            );


        if (navLink) {

            if (mobileMenu) {

                mobileMenu.classList.remove(
                    "active"
                );
            }

            document.body.classList.remove(
                "menu-open"
            );

            return;
        }


        // Click outside menu content
        if (
            mobileMenu &&
            event.target === mobileMenu
        ) {

            mobileMenu.classList.remove(
                "active"
            );

            document.body.classList.remove(
                "menu-open"
            );
        }
    }
);


// ============================================================
// 16. ESC KEY - CLOSE MOBILE MENU / POPUP
// ============================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") return;


        const mobileMenu =
            document.getElementById(
                "mobileMenu"
            );


        if (mobileMenu) {

            mobileMenu.classList.remove(
                "active"
            );

            document.body.classList.remove(
                "menu-open"
            );
        }


        const popup =
            document.getElementById(
                "customPopup"
            );


        if (popup) {

            popup.style.display =
                "none";
        }
    }
);


// ============================================================
// 17. SMART NAVBAR HIDE / SHOW ON SCROLL
// ============================================================

let lastScrollTop = 0;

const navbar =
    document.querySelector(
        ".navbar"
    );


if (navbar) {

    window.addEventListener(
        "scroll",
        () => {

            const currentScroll =
                window.pageYOffset ||
                document.documentElement.scrollTop;


            if (currentScroll <= 50) {

                navbar.classList.remove(
                    "nav-hidden"
                );

                lastScrollTop = 0;

                return;
            }


            if (
                currentScroll >
                lastScrollTop
            ) {

                navbar.classList.add(
                    "nav-hidden"
                );

            } else {

                navbar.classList.remove(
                    "nav-hidden"
                );
            }


            lastScrollTop =
                currentScroll <= 0
                    ? 0
                    : currentScroll;
        },
        {
            passive: true
        }
    );
}