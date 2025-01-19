"use strict";

const educationEvenNodes = document.querySelectorAll(".education-node:nth-child(even)");
const educationOddNodes = document.querySelectorAll(".education-node:nth-child(odd)");
const messageArea = document.querySelector(".form-component--field textarea");
const contactForm = document.querySelector(".contact-form");
const heroContainer = document.querySelector(".hero-content-container");
const floatingScrollCta = document.querySelector(".scroll-cta");
const sectionAboutMe = document.querySelector(".section-about-me");
const main = document.querySelector("main");
const snackbar = document.querySelector(".snackbar--notif-submit");

class App {
    /*
    Instance variables:

    _contactFields: Array[] - Contains <input> and <textarea> fields in the contact form

    */
    constructor() {
        this._resetScrollPos();
        this._heroAnimator()
        this._initFields();
        this._initEducationSpacer();
        this._initFormListeners();
        this._initHeroButtonEvents();
        this._initScrollReveal();
        this._contactFields;
    }

    _resetScrollPos() {
        window.addEventListener('beforeunload', () => window.scrollTo({ top: 0 }));
    }

    _heroAnimator() {
        const heroComponents = [document.querySelector(".greeter-content"), document.querySelector(".intro-container"), document.querySelector(".scroll-cta"), document.querySelector(".clickables-container")];
        heroComponents.forEach(el => {
            el.classList.add("force-animate");
            el.classList.add("element--sliding");
            this._hideElement(el, "element--hide-sliding");
        });

        this._wait(0.2).then(() => heroComponents.forEach(el => this._showElement(el, "element--hide-sliding")));
    }

    _wait(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    // add event listeners on buttons at the hero section
    _initHeroButtonEvents() {
        heroContainer.addEventListener('click', function (e) {
            const button = e.target.closest("a");
            if (!button.classList.contains("social-link")) {
                e.preventDefault();
            }
            if (button.dataset.btnHero === 'contact') {
                const { top: contactFormTop } = contactForm.closest("section").getBoundingClientRect();
                this._scrollTo(contactFormTop);
            }
            if (button.dataset.btnHero === "scrollAbout") {
                const { top: aboutMeTop } = sectionAboutMe.getBoundingClientRect();
                this._scrollTo(aboutMeTop);
            }
        }.bind(this));
    }

    _scrollTo(elementTopRelativeCoords) {
        const targetElementY = window.scrollY + elementTopRelativeCoords;
        window.scrollTo({ top: targetElementY, behavior: "smooth" });
    }

    // adds empty grid items on educational background section to give an alternating look
    _initEducationSpacer() {
        const spacerElement = document.createElement("div");
        spacerElement.classList.add("auto-generated-spacer");
        educationOddNodes.forEach(node => {
            node.after(spacerElement.cloneNode());
        });

        educationEvenNodes.forEach(node => {
            node.before(spacerElement.cloneNode());
        })
    }

    // gets the <input> and <textarea> from contact form and clears any value on them
    // pack elements in the array for later use
    _initFields() {
        const fields = Array.from(document.querySelectorAll(".form-component--field input"));
        fields.push(messageArea);
        fields.forEach(field => field.value = "");
        this._contactFields = fields;
    }

    // customizes the form a bit to the way it react to certain events
    _initFormListeners() {
        this._contactFields.forEach(field => {
            // override default message with my own if there any errors
            field.addEventListener('invalid', function (e) {
                e.preventDefault();
                const parent = e.currentTarget.closest(".form-component--field");
                const errorElement = parent.querySelector(".error-text");
                this._showElement(errorElement);
            }.bind(this));
        });

        // clear any error text (if present) if any field element is on focus
        contactForm.addEventListener('focusin', function (e) {
            const isFieldFocused = this._contactFields.some(field => field === e.target);
            if (isFieldFocused === false) { return; }
            const fieldParent = this._contactFields.find(field => field === e.target).parentElement;
            const errorText = fieldParent.querySelector(".error-text");
            this._hideElement(errorText);
        }.bind(this));

        // display snackbar when form submits
        contactForm.addEventListener("submit", async function (e) {
            try {
                e.preventDefault();

                const form = e.target;
                const formData = new FormData(form);
                const formBody = new URLSearchParams(formData).toString();
                const sendFormData = fetch("/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formBody
                })
                await sendFormData();
                this._contactFields.forEach(field => field.value = "");

                // Shows the element, will cause an animation to play due to transitions
                this._showElement(snackbar, "snackbar--display-hide");

                // Check if the animations are finished on snackbar
                // Then wait for 1.5 seconds before hiding the element
                await Promise.all(snackbar.getAnimations().map(anim => anim.finished));
                await this._wait(1.5);
                this._hideElement(snackbar, "snackbar--display-hide");
            } catch (err) {
                console.error(err);
                console.error(err.stack);
                alert("An error has occured.");
            }
        }.bind(this));
    }

    // hide sections; reveal section elements on scroll
    _initScrollReveal() {
        const sections = document.querySelectorAll("section");
        const observer = new IntersectionObserver(this._scrollCallback.bind(this), { root: null, threshold: .35 });
        sections.forEach(section => {
            this._hideElement(section, "section--hide");
            observer.observe(section);
        });
    }

    _hideElement(el, classToAdd = "element--hide") {
        el.classList.add(classToAdd);
    }

    _showElement(el, classToRemove = "element--hide") {
        el.classList.remove(classToRemove);
    }

    // callback for the observer
    _scrollCallback(entries, observer) {
        const [observedEntry] = entries;
        const { isIntersecting, target: targetElement } = observedEntry;
        // unhide sections if they are 35% visible in the viewport
        if (isIntersecting) {
            this._showElement(targetElement, "section--hide");
            // once section is revealed, stop observing the element
            observer.unobserve(targetElement);
        }
    }
}

const app = new App();

