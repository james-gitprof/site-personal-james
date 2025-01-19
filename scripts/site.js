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
        this._heroAnimator()
        this._initFields();
        this._initEducationSpacer();
        this._initFormListeners();
        this._initHeroButtonEvents();
        this._initScrollReveal();
        this._contactFields;
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

    _wait(seconds)  {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    // add event listeners on buttons at the hero section
    _initHeroButtonEvents() {
        heroContainer.addEventListener('click', function(e){
            // e.preventDefault(); <-- Disabled because it interferes with the behavior of anchor tags
            if(e.target.dataset.btnHero === 'contact') {
                const {top: elementTopRelative} = contactForm.closest("section").getBoundingClientRect();
                const targetElementY = window.scrollY + elementTopRelative;
                window.scrollTo({top: targetElementY, behavior: "smooth"});
            }
        });

        floatingScrollCta.addEventListener('click', function(e) {
            const targetElementY = window.scrollY + sectionAboutMe.getBoundingClientRect().top;
            window.scrollTo({top: targetElementY, behavior: "smooth"});
        });
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
            field.addEventListener('invalid', function(e) {
                e.preventDefault();
                const parent = e.currentTarget.closest(".form-component--field");
                const errorElement = parent.querySelector(".error-text");
                this._showElement(errorElement);
            }.bind(this));
        });

        // clear any error text (if present) if any field element is on focus
        contactForm.addEventListener('focusin', function(e) {
            const isFieldFocused = this._contactFields.some(field => field === e.target);
            if (isFieldFocused === false) { return; }
            const fieldParent = this._contactFields.find(field => field === e.target).parentElement;
            const errorText = fieldParent.querySelector(".error-text");
            this._hideElement(errorText);
        }.bind(this));

        // display snackbar when form submits
        contactForm.addEventListener("submit", function(e) {
            e.preventDefault();
            this._contactFields.forEach(field => field.value = "");

            // Shows the element, will cause an animation to play due to transitions
            this._showElement(snackbar, "snackbar--display-hide");

            // Check if the animations are finished on snackbar
            // Then wait for 1.5 seconds before hiding the element
            Promise.all(snackbar.getAnimations().map(anim => anim.finished))
            .then(() => this._wait(1.5))
            .then(() => this._hideElement(snackbar, "snackbar--display-hide")) ;
        }.bind(this));
    }

    // hide sections; reveal section elements on scroll
    _initScrollReveal() {
        const sections = document.querySelectorAll("section");
        const observer = new IntersectionObserver(this._scrollCallback.bind(this), {root: null, threshold: .35});
        sections.forEach(section => {
            this._hideElement(section, "section--hide");
            observer.observe(section);
        });
    }

    _hideElement(el, classToAdd="element--hide") {
        el.classList.add(classToAdd);
    }

    _showElement(el, classToRemove="element--hide") {
        el.classList.remove(classToRemove);
    }

    // callback for the observer
    _scrollCallback(entries, observer) {
        const [observedEntry] = entries;
        const {isIntersecting, target: targetElement} = observedEntry;
        // unhide sections if they are 35% visible in the viewport
        if (isIntersecting) {
            this._showElement(targetElement, "section--hide");
            // once section is revealed, stop observing the element
            observer.unobserve(targetElement);
        }
    }
}

const app = new App();

