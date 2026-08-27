// 1. Firebase Config & Initialization
const firebaseConfig = {
    apiKey: "AIzaSyB8uFBZKFHWJp_lwHRLNlO_h_90JFr168",
    authDomain: "as-construction-web-e0ca4.firebaseapp.com",
    projectId: "as-construction-web-e0ca4",
    storageBucket: "as-construction-web-e0ca4.firebasestorage.app",
    messagingSenderId: "881497663137",
    appId: "1:881497663137:web:d1e90e4f641e9c9f88b2e0"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Helper Utility: XSS Sanitization
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 2. Custom Popup Functions
function showSuccessPopup() {
    let popup = document.getElementById('customPopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'customPopup';
        popup.className = 'custom-popup-overlay';
        popup.innerHTML = `
            <div class="custom-popup-card">
                <i class="fa-solid fa-circle-check success-icon"></i>
                <h3>Thanks for review!</h3>
                <p>Your feedback has been published successfully.</p>
                <button onclick="closeSuccessPopup()">OK</button>
            </div>
        `;
        document.body.appendChild(popup);
    }
    popup.style.display = 'flex';
}

function closeSuccessPopup() {
    const popup = document.getElementById('customPopup');
    if (popup) popup.style.display = 'none';
}

// 3. Real-Time Review Fetcher
function listenForReviews() {
    const slider = document.getElementById('reviewsSlider');
    if (!slider) return;

    db.collection("reviews")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
            slider.innerHTML = '<p style="color:#888; text-align:center; width:100%;">Be the first to leave a review!</p>';
            return;
        }

        let htmlBuffer = '';
        snapshot.forEach((doc) => {
            const rev = doc.data();
            const ratingNum = parseInt(rev.rating) || 5;
            const starsHTML = '★'.repeat(ratingNum) + '☆'.repeat(5 - ratingNum);
            
            const rawName = rev.name ? rev.name.trim() : 'Anonymous';
            const cleanName = escapeHTML(rawName);
            const cleanText = escapeHTML(rev.text || '');
            const cleanRole = escapeHTML(rev.role || 'Client');
            const cleanProjectType = escapeHTML(rev.projectType || '');

            const firstLetter = cleanName.charAt(0).toUpperCase() || 'A';

            const roleDisplay = cleanProjectType 
                ? `${cleanRole} • ${cleanProjectType}` 
                : cleanRole;

            htmlBuffer += `
                <div class="review-card">
                    <div class="card-header-row">
                        <div class="user-info">
                            <div class="avatar-initial">${firstLetter}</div>
                            <div class="user-details">
                                <div class="client-name">${cleanName}</div>
                                <div class="client-role">${roleDisplay}</div>
                            </div>
                        </div>
                        <i class="fa-solid fa-quote-right quote-icon"></i>
                    </div>

                    <div class="rating-row">
                        <span class="stars">${starsHTML}</span>
                        <span class="rating-score">${ratingNum.toFixed(1)}</span>
                    </div>

                    <p class="review-text">"${cleanText}"</p>
                </div>
            `;
        });
        slider.innerHTML = htmlBuffer;
    }, (error) => {
        console.error("Error fetching reviews: ", error);
    });
}

// 4. Automatic Slider Logic
let autoSlideInterval = null;

function startAutoSlide() {
    const slider = document.getElementById('reviewsSlider');
    if (!slider) return;

    if (autoSlideInterval) clearInterval(autoSlideInterval);

    autoSlideInterval = setInterval(() => {
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
            slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            slider.scrollBy({ left: 360, behavior: 'smooth' });
        }
    }, 3500);
}

// 5. Main Execution on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    listenForReviews();
    startAutoSlide();

    const sliderElem = document.getElementById('reviewsSlider');
    if (sliderElem) {
        sliderElem.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        sliderElem.addEventListener('mouseleave', () => startAutoSlide());
    }

    // Star Rating Logic
    const stars = document.querySelectorAll('#starRating .star');
    const ratingInput = document.getElementById('custRating');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const selectedVal = parseInt(star.getAttribute('data-value'));
            if (ratingInput) ratingInput.value = selectedVal;

            stars.forEach(s => {
                const itemVal = parseInt(s.getAttribute('data-value'));
                if (itemVal <= selectedVal) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Character Counter Logic
    const messageInput = document.getElementById('custMessage');
    const wordCounter = document.getElementById('wordCounter');

    if (messageInput && wordCounter) {
        messageInput.addEventListener('input', () => {
            const charCount = messageInput.value.length;
            wordCounter.textContent = `${charCount}/100`;
            wordCounter.style.color = charCount >= 100 ? '#ff4d4d' : '#2ecc71';
        });
    }

    // Review Form Submission Logic
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const message = messageInput ? messageInput.value.trim() : '';
            if (message.length > 100) {
                alert(`Maximum 100 characters allowed!`);
                return;
            }

            const firstName = document.getElementById('custFirstName') ? document.getElementById('custFirstName').value.trim() : '';
            const lastName = document.getElementById('custLastName') ? document.getElementById('custLastName').value.trim() : '';
            const fullName = `${firstName} ${lastName}`.trim();
            const projectType = document.getElementById('projectType') ? document.getElementById('projectType').value : '';
            const role = document.getElementById('custRole') ? document.getElementById('custRole').value : '';
            const email = document.getElementById('custEmail') ? document.getElementById('custEmail').value.trim() : '';
            const rating = ratingInput ? parseInt(ratingInput.value) : 5;

            const submitBtn = this.querySelector('.submit-review-btn');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.innerText = 'Submitting...';
            submitBtn.disabled = true;

            db.collection("reviews").add({
                name: fullName,
                firstName: firstName,
                lastName: lastName,
                projectType: projectType,
                role: role,
                email: email,
                rating: rating,
                text: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                showSuccessPopup();
                this.reset();
                if (wordCounter) {
                    wordCounter.textContent = '0/100';
                    wordCounter.style.color = '#2ecc71';
                }
                stars.forEach(s => s.classList.add('active'));
                if (ratingInput) ratingInput.value = 5;
            })
            .catch((error) => {
                console.error("Error submitting review: ", error);
                alert('Could not submit review. Please try again.');
            })
            .finally(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

    // Scroll Reveal Animation
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
            { threshold: 0.15 }
        );
        revealElements.forEach((el) => revealObserver.observe(el));
    } else {
        revealElements.forEach((el) => el.classList.add("visible"));
    }

    // Counter Animation
    const counters = document.querySelectorAll(".about-stats-grid .counter");
    const statsSection = document.querySelector(".about-stats-grid");
    let countersStarted = false;

    if (statsSection && counters.length && "IntersectionObserver" in window) {
        const statsObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !countersStarted) {
                    countersStarted = true;
                    counters.forEach((counter) => {
                        const target = Number(counter.getAttribute("data-target"));
                        let current = 0;
                        const duration = 1600;
                        const increment = target / (duration / 16);

                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.textContent = Math.floor(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.textContent = target;
                            }
                        };
                        updateCounter();
                    });
                }
            },
            { threshold: 0.5 }
        );
        statsObserver.observe(statsSection);
    } else {
        counters.forEach((counter) => {
            counter.textContent = counter.getAttribute("data-target");
        });
    }

    // Hero Background Auto-Slider
    const slides = document.querySelectorAll(".hero-bg-slider .slide");
    let currentSlide = 0;
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove("active");
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add("active");
        }, 5000);
    }

    // Portfolio Filter Script
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");
    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
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

    // Contact Form Submission -> WhatsApp Redirect
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim();
            const service = document.getElementById("service").value;
            const message = document.getElementById("message").value.trim();

            if (!name || !phone || !message) {
                alert("Please fill in all required fields.");
                return;
            }

            const whatsappMessage = 
`*AS CONSTRUCTION*
━━━━━━━━━━━━━━━━━━
*NEW PROJECT ENQUIRY*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📧 *Email:* ${email || "Not provided"}
🏗️ *Service:* ${service}
📝 *Project Details:* ${message}
━━━━━━━━━━━━━━━━━━`;

            const whatsappNumber = "917249371499";
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

            window.open(whatsappURL, "_blank");
        });
    }

    // Manual Slider Controls
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            document.getElementById('reviewsSlider').scrollBy({ left: -360, behavior: 'smooth' });
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            document.getElementById('reviewsSlider').scrollBy({ left: 360, behavior: 'smooth' });
        });
    }
});

// 6. Mobile Menu Event Delegation
document.addEventListener("click", function (event) {
    const mobileMenu = document.getElementById("mobileMenu");
    
    // 1. Hamburger Icon or Button click (Open Menu)
    const hamburgerBtn = event.target.closest("#hamburger");
    if (hamburgerBtn) {
        event.preventDefault();
        if (mobileMenu) {
            mobileMenu.classList.add("active");
        }
        return;
    }

    // 2. Close Button click (Close Menu)
    const closeBtn = event.target.closest("#closeMenu");
    if (closeBtn) {
        event.preventDefault();
        if (mobileMenu) {
            mobileMenu.classList.remove("active");
        }
        return;
    }

    // 3. Menu Link click (Close Menu)
    const navLink = event.target.closest(".mobile-nav-links a");
    if (navLink) {
        if (mobileMenu) {
            mobileMenu.classList.remove("active");
        }
        return;
    }

    // 4. Overlay background click (Close Menu)
    if (mobileMenu && event.target === mobileMenu) {
        mobileMenu.classList.remove("active");
    }
});

// Smart Scroll Hide / Show Logic
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // Agar user ekdam top par (0 - 50px) ho toh hamesha navbar visible rahe
        if (currentScroll <= 50) {
            navbar.classList.remove('nav-hidden');
            return;
        }

        // Down Scroll -> Hide Navbar (Gayab ho jaye)
        if (currentScroll > lastScrollTop) {
            navbar.classList.add('nav-hidden');
        } 
        // Up Scroll -> Show Navbar (Visible ho jaye)
        else {
            navbar.classList.remove('nav-hidden');
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Mobile bounce effect preventer
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section, div[id]"); // Page ke sections ko target karne ke liye
    const navLinks = document.querySelectorAll(".mobile-nav-links .menu-item"); // Aapke mobile menu ke items

    window.addEventListener("scroll", function () {
        let scrollPosition = window.scrollY + 200; // Offset taaki thoda pehle hi active ho jaye

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute("id");

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove("active"); // Sabhi se active hatao
                    if (link.getAttribute("href") === "#" + sectionId) {
                        link.classList.add("active"); // Current section wale par active lagao
                    }
                });
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section, div[id]");
    const navLinks = document.querySelectorAll("#mainNav a");

    function changeNavOnScroll() {
        let scrollPosition = window.scrollY + 200; // Offset taaki thoda pehle hi active ho jaye

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute("id");

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${sectionId}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }

    window.addEventListener("scroll", changeNavOnScroll);
});