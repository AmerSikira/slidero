"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Slidero_instances, _Slidero_addSlideroClass, _Slidero_initialClassDistribution, _Slidero_addActiveClass, _Slidero_updateActiveClasses, _Slidero_init, _Slidero_next, _Slidero_previous, _Slidero_startInterval, _Slidero_stopInterval, _Slidero_createSingleArrow, _Slidero_createArrows, _Slidero_createSingleDot, _Slidero_createDots, _Slidero_createSingleThumbnail, _Slidero_createThumbnails, _Slidero_createNavigation, _Slidero_handleArrowClick, _Slidero_handleDotClick, _Slidero_handleThumbnailClick, _Slidero_getActiveIndex, _Slidero_handleAnimation, _Slidero_getSource;
/**
 * Slidero class for creating and managing a slider component.
 */
class Slidero {
    /**
     * Create a new Slidero instance.
     *
     * @param {SliderOptions} defaults - Configuration options for the slider.
     * @throws {Error} Throws an error if no element is provided.
     */
    constructor(defaults) {
        _Slidero_instances.add(this);
        this.el = defaults.el;
        this.elHeight = defaults.elHeight || "100vh";
        this.autoPlay = defaults.autoPlay || true;
        this.autoPlaySpeed = defaults.autoPlaySpeed || 2000;
        this.navigation = defaults.navigation || [
            "arrows",
            "dots",
            "thumbnails",
        ];
        this.animationDuration = defaults.animationDuration || 300;
        this.animationType = defaults.animationType || "";
        this.activeIndex = 0;
        this.interval = null; //Initialise interval as null because user may have chosen not to have autoplay
        this.unwantedChildren = "slidero-navigation-item";
        // Check if an element is provided
        if (!this.el) {
            throw new Error("No element provided");
        }
        //Set el position relative, it is much easier here than in CSS
        this.el.style.position = "relative";
        //Set el height, so we don't have issues with position relative and absolute
        this.el.style.height = this.elHeight;
        // Add the "slidero-item" class to each child element
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addSlideroClass).call(this, this.el);
        // Hide all elements except the first one
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_initialClassDistribution).call(this, this.el.children);
        // Initialize the slider and autoplay if enabled
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_init).call(this, this.el, this.autoPlay, this.autoPlaySpeed);
        //Add navigation
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_createNavigation).call(this, this.el);
        //Make active class unified across every feature
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_updateActiveClasses).call(this, this.activeIndex);
    }
}
_Slidero_instances = new WeakSet(), _Slidero_addSlideroClass = function _Slidero_addSlideroClass(el) {
    for (let i = 0; i < el.children.length; i++) {
        el.children[i].classList.add("slidero-item");
    }
}, _Slidero_initialClassDistribution = function _Slidero_initialClassDistribution(els) {
    for (let i = 0; i < els.length; i++) {
        if (i === 0) {
            els[i].classList.add("active");
        }
        else {
            els[i].classList.add("out");
        }
    }
}, _Slidero_addActiveClass = function _Slidero_addActiveClass(els, index) {
    for (let i = 0; i < els.length; i++) {
        // Add the "active" class to the element at the specified index
        // and remove the "active" class from other elements
        console.log(els[i]);
        if (i === index) {
            //Add animation only to main slides, not to rest of the items and only if animation is set
            if (els[i].classList.contains("slidero-item") &&
                this.animationType !== "") {
                __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_handleAnimation).call(this, els[i], this.animationDuration, `${this.animationType}In`);
            }
            els[i].classList.add("active");
        }
        else {
            //Remove animation only from main slides, not the rest of the items and only if animation is set
            if (els[i].classList.contains("slidero-item") &&
                this.animationType !== "") {
                els[i].classList.add("out");
                __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_handleAnimation).call(this, els[i], this.animationDuration, `${this.animationType}Out`);
                setTimeout(() => {
                    els[i].classList.remove("out");
                    els[i].classList.remove("active");
                }, this.animationDuration);
            }
            else {
                els[i].classList.remove("active");
            }
        }
    }
}, _Slidero_updateActiveClasses = function _Slidero_updateActiveClasses(index) {
    var _a, _b;
    // Get the collection of dot elements
    const dots = (_a = this.el.querySelector(".slidero-dots-holder")) === null || _a === void 0 ? void 0 : _a.children;
    // Get the collection of slide elements using getElementsByClassName
    // NodeList is used, which requires using [0] to access elements
    const slides = this.el.getElementsByClassName("slidero-item");
    // Get the collection of thumbnail elements
    const thumbnails = (_b = this.el.querySelector(".slidero-thumbnails-holder")) === null || _b === void 0 ? void 0 : _b.children;
    if (this.navigation.includes("dots") && dots) {
        // Update the active class for dots
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addActiveClass).call(this, dots, index);
    }
    if (this.navigation.includes("thumbnails") && thumbnails) {
        // Update the active class for thumbnails
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addActiveClass).call(this, thumbnails, index);
    }
    // Update the active class for both dots and slides
    __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addActiveClass).call(this, slides, index);
}, _Slidero_init = function _Slidero_init(el, autoPlay, autoPlaySpeed) {
    if (autoPlay) {
        // Set up an interval to switch to the next slide
        this.interval = setInterval(() => {
            __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_next).call(this, el);
        }, autoPlaySpeed);
        // Pause the autoplay when the mouse enters the slider
        el.addEventListener("mouseenter", () => {
            __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_stopInterval).call(this);
        });
        // Resume the autoplay when the mouse leaves the slider
        el.addEventListener("mouseleave", () => {
            __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_startInterval).call(this, el, autoPlaySpeed);
        });
    }
}, _Slidero_next = function _Slidero_next(el) {
    const activeIndex = __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_getActiveIndex).call(this, el);
    /**
     * We have to use getElementsByClassName because it returns HTMLCollection
     * while querySelectorAll returns NodeList.
     */
    const children = el.getElementsByClassName("slidero-item");
    // Switch the "active" class to the next slide
    //By using modulus when we get to the end of the array, modulus will be 0 and it will "automatically" transfer us to the first element of the array
    __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addActiveClass).call(this, children, (activeIndex + 1) % children.length);
    __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_updateActiveClasses).call(this, (activeIndex + 1) % children.length);
}, _Slidero_previous = function _Slidero_previous(el) {
    // Get the index of the active slide
    const activeIndex = __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_getActiveIndex).call(this, el);
    // Get all child elements with the "slidero-item" class
    /**
     * We have to use getElementsByClassName because it returns HTMLCollection
     * while querySelectorAll returns NodeList.
     */
    const children = el.getElementsByClassName("slidero-item");
    const totalChildren = children.length;
    // Calculate the index of the previous slide considering looping
    const previousIndex = (activeIndex - 1 + totalChildren) % totalChildren;
    // Switch the "active" class to the previous slide
    __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addActiveClass).call(this, children, previousIndex);
    __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_updateActiveClasses).call(this, previousIndex);
}, _Slidero_startInterval = function _Slidero_startInterval(el, autoPlaySpeed) {
    if (!this.interval) {
        // Restart the autoplay interval
        this.interval = setInterval(() => {
            __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_next).call(this, el);
        }, autoPlaySpeed);
    }
}, _Slidero_stopInterval = function _Slidero_stopInterval() {
    if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
    }
}, _Slidero_createSingleArrow = function _Slidero_createSingleArrow() {
    // Create a new div element for the arrow
    const arrow = document.createElement("div");
    // Add necessary classes to the arrow element
    arrow.classList.add("slidero-arrow", "slidero-navigation-item");
    // Return the created arrow element
    return arrow;
}, _Slidero_createArrows = function _Slidero_createArrows(el) {
    // Create the left arrow navigation element
    const leftArrow = __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_createSingleArrow).call(this);
    leftArrow.classList.add("slidero-arrow-left");
    // Create the right arrow navigation element
    const rightArrow = __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_createSingleArrow).call(this);
    rightArrow.classList.add("slidero-arrow-right");
    // Append the left and right arrow elements to the provided element
    el.appendChild(leftArrow);
    el.appendChild(rightArrow);
}, _Slidero_createSingleDot = function _Slidero_createSingleDot() {
    const dot = document.createElement("div");
    dot.classList.add("slidero-dot", "slidero-navigation-item");
    return dot;
}, _Slidero_createDots = function _Slidero_createDots(el) {
    // Retrieve all child elements of the slider
    const children = el.querySelectorAll(".slidero-item");
    // Create a container for dot elements
    const dots = document.createElement("div");
    dots.classList.add("slidero-dots-holder");
    // Create and handle click events for each dot element
    for (let i = 0; i < children.length; i++) {
        const dot = __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_createSingleDot).call(this);
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_handleDotClick).call(this, dot, () => {
            __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addActiveClass).call(this, dots.children, i);
            __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addActiveClass).call(this, this.el.children, i);
        });
        dots.appendChild(dot);
    }
    // Append the dot container to the provided element
    el.appendChild(dots);
}, _Slidero_createSingleThumbnail = function _Slidero_createSingleThumbnail(src) {
    // Create a new image element
    const img = document.createElement("img");
    // Set the source attribute to the provided URL
    img.src = src;
    // Add the "slidero-thumbnail" class to the image element
    img.classList.add("slidero-thumbnail", "slidero-navigation-item");
    // Return the created thumbnail image element
    return img;
}, _Slidero_createThumbnails = function _Slidero_createThumbnails(el) {
    // Find all child elements with the class "slidero-item"
    const children = el.querySelectorAll(".slidero-item");
    // Create a container for thumbnail elements
    const thumbnails = document.createElement("div");
    thumbnails.classList.add("slidero-thumbnails-holder");
    // Iterate through the child elements
    for (let i = 0; i < children.length; i++) {
        // Get the source attribute of the current child element
        let src = __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_getSource).call(this, children[i]);
        // If the source attribute is empty or null, skip to the next iteration
        if (!src || src === "")
            continue;
        // Create a thumbnail for the current child element's source
        const thumbnail = __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_createSingleThumbnail).call(this, src);
        // Attach a click event handler to the thumbnail
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_handleThumbnailClick).call(this, thumbnail, () => {
            // Add "active" class to the clicked thumbnail and corresponding slide
            __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addActiveClass).call(this, thumbnails.children, i);
            __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_addActiveClass).call(this, this.el.children, i);
        });
        // Append the created thumbnail to the container
        thumbnails.appendChild(thumbnail);
    }
    // If no thumbnails were created, return
    if (thumbnails.children.length === 0)
        return;
    // Append the container of thumbnails to the parent element
    el.appendChild(thumbnails);
}, _Slidero_createNavigation = function _Slidero_createNavigation(el) {
    // Create arrow navigation elements if specified
    if (this.navigation.includes("arrows")) {
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_createArrows).call(this, el);
        // Add event listeners for arrow clicks
        const rightArrow = el.querySelector(".slidero-arrow-right");
        if (!rightArrow) {
            throw new Error("No right arrow found");
        }
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_handleArrowClick).call(this, rightArrow, () => __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_next).call(this, el));
        const leftArrow = el.querySelector(".slidero-arrow-left");
        if (!leftArrow) {
            throw new Error("No left arrow found");
        }
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_handleArrowClick).call(this, leftArrow, () => __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_previous).call(this, el));
    }
    // Create dot navigation elements if specified
    if (this.navigation.includes("dots")) {
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_createDots).call(this, el);
    }
    if (this.navigation.includes("thumbnails")) {
        __classPrivateFieldGet(this, _Slidero_instances, "m", _Slidero_createThumbnails).call(this, el);
    }
}, _Slidero_handleArrowClick = function _Slidero_handleArrowClick(el, callback) {
    el.addEventListener("click", () => {
        callback();
    });
}, _Slidero_handleDotClick = function _Slidero_handleDotClick(el, callback) {
    el.addEventListener("click", () => {
        callback();
    });
}, _Slidero_handleThumbnailClick = function _Slidero_handleThumbnailClick(el, callback) {
    el.addEventListener("click", () => {
        callback();
    });
}, _Slidero_getActiveIndex = function _Slidero_getActiveIndex(el) {
    const active = el.querySelector(".active");
    if (!active) {
        throw new Error("No active element found");
    }
    const activeIndex = Array.from(el.querySelectorAll(".slidero-item")).indexOf(active);
    this.activeIndex = activeIndex;
    return activeIndex;
}, _Slidero_handleAnimation = function _Slidero_handleAnimation(el, duration, type) {
    el.style.animation = `${type} ${duration}ms ease-in-out`;
}, _Slidero_getSource = function _Slidero_getSource(el) {
    if (el.tagName === "IMG") {
        // If the provided element is an image element, return its source attribute.
        return el.getAttribute("src");
    }
    else {
        // If the provided element is not an image element, search for the first image element within it.
        let imgElement = el.querySelector("img");
        if (imgElement) {
            // If an image element is found, return its source attribute.
            return imgElement.getAttribute("src");
        }
    }
    // If no image element is found, return null.
    return null;
};
