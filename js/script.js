/* =====================================================
   DREAM GARAGE - PART 3
   JavaScript Functionality
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ================================================
       1. PRODUCT SEARCH, FILTERING AND SORTING
       ================================================ */

    const carCards = Array.from(
        document.querySelectorAll(".car-card")
    );
    const searchInput = document.getElementById("productSearch");
    const sortSelect = document.getElementById("sortProducts");
    const productCount = document.getElementById("productCount");
    function filterProducts() {
        const searchTerm = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const visibleCards = [];
        carCards.forEach(card => {

            const cardText = card.textContent.toLowerCase();
            const matchesSearch = cardText.includes(searchTerm);

            if (matchesSearch) {
                card.style.display = "";
                visibleCards.push(card);
            } else {
                card.style.display = "none";
            }

        });

        // Update product count
        if (productCount) {
            productCount.textContent =
                `Showing ${visibleCards.length} of ${carCards.length} products`;
        }

        // Sort visible products
        if (sortSelect) {

            const sortValue = sortSelect.value;

            visibleCards.sort((a, b) => {

                const priceA = getPrice(a);
                const priceB = getPrice(b);

                const nameA = a.querySelector("h3").textContent;
                const nameB = b.querySelector("h3").textContent;

                if (sortValue === "name-asc") {
                    return nameA.localeCompare(nameB);
                }

                if (sortValue === "price-low") {
                    return priceA - priceB;
                }

                if (sortValue === "price-high") {
                    return priceB - priceA;
                }

                return 0;

            });

            const grids = new Set(
                visibleCards.map(card => card.parentElement)
            );

            grids.forEach(grid => {

                visibleCards
                    .filter(card => card.parentElement === grid)
                    .forEach(card => grid.appendChild(card));

            });

        }

    }

    function getPrice(card) {

        const priceElement = card.querySelector(".car-card__price");
        if (!priceElement) return Infinity;
        const digits = priceElement.textContent.replace(/\D/g, "");
        return digits ? Number(digits) : Infinity;

    }

    if (searchInput) {
        searchInput.addEventListener("input", filterProducts);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", filterProducts);
    }


    /* ================================================
       2. IMAGE GALLERY LIGHTBOX
       ================================================ */

    const images = document.querySelectorAll(".car-card__image");

    const lightbox = document.getElementById("imageLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const closeLightbox = document.getElementById("closeLightbox");

    if (lightbox) {

        images.forEach(image => {

            image.style.cursor = "zoom-in";

            image.addEventListener("click", function () {

                lightboxImage.src = this.src;
                lightboxImage.alt = this.alt;
                lightboxCaption.textContent = this.alt;
                lightbox.classList.add("active");
                lightbox.setAttribute("aria-hidden", "false");
                document.body.style.overflow = "hidden";
                closeLightbox.focus();
            });
        });

        function closeImageLightbox() {

            lightbox.classList.remove("active");
            lightbox.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";

        }

        closeLightbox.addEventListener("click", closeImageLightbox);
        lightbox.addEventListener("click", function (event) {

            if (event.target === lightbox) {
                closeImageLightbox();
            }
        });

        document.addEventListener("keydown", function (event) {

            if (event.key === "Escape") {
                closeImageLightbox();
            }
        });
    }


    /* ================================================
       3. ACCORDION
       ================================================ */

    const accordionButtons = document.querySelectorAll(
        ".accordion-button"
    );

    accordionButtons.forEach(button => {

        button.addEventListener("click", function () {
            const content = this.nextElementSibling;
            const isOpen = this.getAttribute("aria-expanded") === "true";
            this.setAttribute("aria-expanded", String(!isOpen));
            content.hidden = isOpen;

        });

    });


    /* ================================================
       4. ENQUIRY FORM VALIDATION
       ================================================ */

    const enquiryForm = document.getElementById("enquiryForm");

    if (enquiryForm) {
        const response = document.getElementById("enquiryResponse");
        enquiryForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!enquiryForm.checkValidity()) {
                enquiryForm.reportValidity();
                return;
            }

            const formData = new FormData(enquiryForm);
            const category = formData.get("category");
            const product = formData.get("product");
            const budget = formData.get("budget");
            let result = "";

            if (category === "Accessories") {
                result = "Our accessories team will assist you with pricing and availability.";

            } else if (budget === "Under R1 million") {
                result = "Our team will help you explore suitable options within your budget.";

            } else {
                result = "Thank you! Our team will confirm the vehicle's price and availability.";
            }

            response.innerHTML = `
                <h3>Enquiry Ready!</h3>
                <p>Thank you, ${escapeHTML(formData.get("name"))}.</p>
                <p>Interest: ${escapeHTML(product || category)}</p>
                <p>${result}</p>
                <p>Your enquiry is being submitted.</p>
            `;

            response.hidden = false;
            submitAjaxForm(enquiryForm, response);
        });
    }


    /* ================================================
       5. CONTACT FORM VALIDATION
       ================================================ */

    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        const response = document.getElementById("contactResponse");
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }
            submitAjaxForm(contactForm, response);
        });
    }

    /* ================================================
       6. AJAX FORM SUBMISSION
       ================================================ */

    async function submitAjaxForm(form, response) {

        const submitButton = form.querySelector(
            'button[type="submit"]'
        );
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {

            const formData = new FormData(form);
            const result = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            const data = await result.json();

            if (!result.ok || data.success === "false") {
                throw new Error("Unable to send the form.");
            }
            response.innerHTML = `
                <h3>Thank you!</h3>
                <p>Your information has been submitted successfully.</p>
                <p>The Dream Garage team will get back to you.</p>
            `;
            response.hidden = false;
            form.reset();
        } catch (error) {
            response.innerHTML = `
                <h3>Submission unsuccessful</h3>
                <p>We could not send your information right now.
                Please try again or email info@dreamgarage.co.za.</p>
            `;
            response.hidden = false;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    /* ================================================
       7. HELPER FUNCTION - HTML SAFETY
       ================================================ */

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };
            return entities[character];
        });
    }
    /* ================================================
       8. SCROLL ANIMATIONS
       ================================================ */

    const animatedElements = document.querySelectorAll(
        ".feature-card, .info-card, .car-card, .contact-card"
    );

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12
        });

        animatedElements.forEach(element => {
            element.classList.add("reveal");
            observer.observe(element);

        });
    }
});
