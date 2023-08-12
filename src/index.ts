/**
 * Configuration options for the slider.
 */
type SliderOptions = {
	el: HTMLElement;
	elHeight?: string;
	autoPlay?: boolean;
	autoPlaySpeed?: number;
	navigation?: string[];
	animationType: string;
	animationDuration?: number;
};

/**
 * Slidero class for creating and managing a slider component.
 */
class Slidero {
	el: HTMLElement;
	elHeight: string;
	autoPlay: boolean;
	autoPlaySpeed: number;
	navigation: string[]; //possible values: ["arrows", "dots", "thumbnails"]
	animationType: string | "";
	animationDuration: number;

	//Utility stuff
	activeIndex: number; //We have to keep track of currently active index because we will use it for many things, e.g. dots navigation
	interval: number | null; //Used to store setInterval so we can destroy it and restart it on certain events
	unwantedChildren: string; //Used to store elements that are not sliding items, but rather helpers. Like navigation and similar things

	/**
	 * Create a new Slidero instance.
	 *
	 * @param {SliderOptions} defaults - Configuration options for the slider.
	 * @throws {Error} Throws an error if no element is provided.
	 */
	constructor(defaults: SliderOptions) {
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
		this.#addSlideroClass(this.el);

		// Hide all elements except the first one
		this.#initialClassDistribution(this.el.children);

		// Initialize the slider and autoplay if enabled
		this.#init(this.el, this.autoPlay, this.autoPlaySpeed);

		//Add navigation
		this.#createNavigation(this.el);

		//Make active class unified across every feature
		this.#updateActiveClasses(this.activeIndex);
	}
	/********************************************************************************
	 * HTML Classes Manipulation
	 * TOC:
	 * 1. addSlideroClass
	 * 2. addActiveClass
	 * 3. updateActiveClasses
	 *******************************************************************************/

	/**
	 * Add the "slidero-item" class to each child element of the provided element.
	 *
	 * @param {HTMLElement} el - The element whose child elements will receive the class.
	 */
	#addSlideroClass(el: HTMLElement) {
		for (let i = 0; i < el.children.length; i++) {
			el.children[i].classList.add("slidero-item");
		}
	}

	#initialClassDistribution(els: HTMLCollection) {
		for (let i = 0; i < els.length; i++) {
			if (i === 0) {
				els[i].classList.add("active");
			} else {
				els[i].classList.add("out");
			}
		}
	}

	/**
	 * Add or remove the "active" class to elements based on the provided index.
	 *
	 * @param {HTMLCollection} els - Collection of elements.
	 * @param {number} index - Index of the element to be marked as active.
	 */
	#addActiveClass(els: HTMLCollection, index: number) {
		for (let i = 0; i < els.length; i++) {
			// Add the "active" class to the element at the specified index
			// and remove the "active" class from other elements
			console.log(els[i]);
			if (i === index) {
				//Add animation only to main slides, not to rest of the items and only if animation is set
				if (
					els[i].classList.contains("slidero-item") &&
					this.animationType !== ""
				) {
					this.#handleAnimation(
						els[i] as HTMLElement,
						this.animationDuration,
						`${this.animationType}In`
					);
				}
				els[i].classList.add("active");
			} else {
				//Remove animation only from main slides, not the rest of the items and only if animation is set
				if (
					els[i].classList.contains("slidero-item") &&
					this.animationType !== ""
				) {
					els[i].classList.add("out");
					this.#handleAnimation(
						els[i] as HTMLElement,
						this.animationDuration,
						`${this.animationType}Out`
					);
					setTimeout(() => {
						els[i].classList.remove("out");
						els[i].classList.remove("active");
					}, this.animationDuration);
				} else {
					els[i].classList.remove("active");
				}
			}
		}
	}

	/**
	 * Update the active classes for dots and slides based on the provided index.
	 *
	 * @param {number} index - Index of the element to be marked as active.
	 */
	#updateActiveClasses(index: number) {
		// Get the collection of dot elements
		const dots = this.el.querySelector(".slidero-dots-holder")?.children;

		// Get the collection of slide elements using getElementsByClassName
		// NodeList is used, which requires using [0] to access elements
		const slides = this.el.getElementsByClassName("slidero-item");

		// Get the collection of thumbnail elements
		const thumbnails = this.el.querySelector(
			".slidero-thumbnails-holder"
		)?.children;

		if (this.navigation.includes("dots") && dots) {
			// Update the active class for dots
			this.#addActiveClass(dots, index);
		}
		if (this.navigation.includes("thumbnails") && thumbnails) {
			// Update the active class for thumbnails
			this.#addActiveClass(thumbnails, index);
		}

		// Update the active class for both dots and slides

		this.#addActiveClass(slides, index);
	}

	/********************************************************************************
	 * Init slider and move slides
	 * TOC:
	 * 1. init
	 * 2. next
	 * 3. previous
	 *******************************************************************************/
	/**
	 * Initialize the slider and autoplay if enabled.
	 *
	 * @param {HTMLElement} el - The slider element.
	 * @param {boolean} autoPlay - Whether autoplay is enabled.
	 * @param {number} autoPlaySpeed - The autoplay speed in milliseconds.
	 */
	#init(el: HTMLElement, autoPlay: boolean, autoPlaySpeed: number) {
		if (autoPlay) {
			// Set up an interval to switch to the next slide
			this.interval = setInterval(() => {
				this.#next(el);
			}, autoPlaySpeed);

			// Pause the autoplay when the mouse enters the slider
			el.addEventListener("mouseenter", () => {
				this.#stopInterval();
			});

			// Resume the autoplay when the mouse leaves the slider
			el.addEventListener("mouseleave", () => {
				this.#startInterval(el, autoPlaySpeed);
			});
		}
	}
	/**
	 * Show the next slide in the slider.
	 *
	 * @param {HTMLElement} el - The slider element.
	 */
	#next(el: HTMLElement) {
		const activeIndex = this.#getActiveIndex(el);
		/**
		 * We have to use getElementsByClassName because it returns HTMLCollection
		 * while querySelectorAll returns NodeList.
		 */
		const children = el.getElementsByClassName("slidero-item");
		// Switch the "active" class to the next slide
		//By using modulus when we get to the end of the array, modulus will be 0 and it will "automatically" transfer us to the first element of the array
		this.#addActiveClass(children, (activeIndex + 1) % children.length);
		this.#updateActiveClasses((activeIndex + 1) % children.length);
	}

	/**
	 * Slide to the previous slide in the slider.
	 *
	 * @param {HTMLElement} el - The slider element.
	 */
	#previous(el: HTMLElement) {
		// Get the index of the active slide
		const activeIndex = this.#getActiveIndex(el);

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
		this.#addActiveClass(children, previousIndex);
		this.#updateActiveClasses(previousIndex);
	}

	/********************************************************************************
	 * Autoplay
	 * TOC:
	 * 1. startInterval
	 * 2. stopInterval
	 *******************************************************************************/
	/**
	 * Start the autoplay interval.
	 *
	 * @param {HTMLElement} el - The slider element.
	 * @param {number} autoPlaySpeed - The autoplay speed in milliseconds.
	 */
	#startInterval(el: HTMLElement, autoPlaySpeed: number) {
		if (!this.interval) {
			// Restart the autoplay interval
			this.interval = setInterval(() => {
				this.#next(el);
			}, autoPlaySpeed);
		}
	}

	/**
	 * Stop the autoplay interval.
	 */
	#stopInterval() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	/********************************************************************************
	 * Navigation
	 * TOC:
	 * 1. Arrows
	 *    - createSingleArrow
	 *    - createArrows
	 * 2. Dots
	 *    - createSingleDot
	 *    - createDots
	 * 3. Navigation
	 *    - createNavigation
	 *
	 *******************************************************************************/

	/**
	 * Create a single arrow navigation element.
	 *
	 * @returns {HTMLElement} The created arrow navigation element.
	 */
	#createSingleArrow(): HTMLElement {
		// Create a new div element for the arrow
		const arrow = document.createElement("div");

		// Add necessary classes to the arrow element
		arrow.classList.add("slidero-arrow", "slidero-navigation-item");

		// Return the created arrow element
		return arrow;
	}

	/**
	 * Create arrow navigation elements and add them to the provided element.
	 *
	 * @param {HTMLElement} el - The element to which arrow navigation elements will be added.
	 */
	#createArrows(el: HTMLElement) {
		// Create the left arrow navigation element
		const leftArrow = this.#createSingleArrow();
		leftArrow.classList.add("slidero-arrow-left");

		// Create the right arrow navigation element
		const rightArrow = this.#createSingleArrow();
		rightArrow.classList.add("slidero-arrow-right");

		// Append the left and right arrow elements to the provided element
		el.appendChild(leftArrow);
		el.appendChild(rightArrow);
	}

	/**
	 * Create a single dot navigation element.
	 *
	 * @returns {HTMLElement} The created dot element.
	 */
	#createSingleDot(): HTMLElement {
		const dot = document.createElement("div");
		dot.classList.add("slidero-dot", "slidero-navigation-item");
		return dot;
	}

	/**
	 * Create dot navigation elements and add them to the provided element.
	 *
	 * @param {HTMLElement} el - The element to which dot navigation elements will be added.
	 */
	#createDots(el: HTMLElement) {
		// Retrieve all child elements of the slider
		const children = el.querySelectorAll(".slidero-item");

		// Create a container for dot elements
		const dots = document.createElement("div");
		dots.classList.add("slidero-dots-holder");

		// Create and handle click events for each dot element
		for (let i = 0; i < children.length; i++) {
			const dot = this.#createSingleDot();
			this.#handleDotClick(dot, () => {
				this.#addActiveClass(dots.children, i);
				this.#addActiveClass(this.el.children, i);
			});
			dots.appendChild(dot);
		}

		// Append the dot container to the provided element
		el.appendChild(dots);
	}

	/**
	 * Create a single thumbnail element with the specified image source.
	 *
	 * @param {string} src - The image source URL.
	 * @returns {HTMLElement} The created thumbnail image element.
	 */
	#createSingleThumbnail(src: string): HTMLElement {
		// Create a new image element
		const img = document.createElement("img");
		// Set the source attribute to the provided URL
		img.src = src;
		// Add the "slidero-thumbnail" class to the image element
		img.classList.add("slidero-thumbnail", "slidero-navigation-item");
		// Return the created thumbnail image element
		return img;
	}

	/**
	 * Create thumbnail elements for each child element of the provided element.
	 *
	 * @param {HTMLElement} el - The parent element containing child elements.
	 */
	#createThumbnails(el: HTMLElement) {
		// Find all child elements with the class "slidero-item"
		const children = el.querySelectorAll(".slidero-item");

		// Create a container for thumbnail elements
		const thumbnails = document.createElement("div");
		thumbnails.classList.add("slidero-thumbnails-holder");

		// Iterate through the child elements
		for (let i = 0; i < children.length; i++) {
			// Get the source attribute of the current child element
			let src = this.#getSource(children[i] as HTMLElement);

			// If the source attribute is empty or null, skip to the next iteration
			if (!src || src === "") continue;

			// Create a thumbnail for the current child element's source
			const thumbnail = this.#createSingleThumbnail(src);

			// Attach a click event handler to the thumbnail
			this.#handleThumbnailClick(thumbnail, () => {
				// Add "active" class to the clicked thumbnail and corresponding slide
				this.#addActiveClass(thumbnails.children, i);
				this.#addActiveClass(this.el.children, i);
			});

			// Append the created thumbnail to the container
			thumbnails.appendChild(thumbnail);
		}

		// If no thumbnails were created, return
		if (thumbnails.children.length === 0) return;

		// Append the container of thumbnails to the parent element
		el.appendChild(thumbnails);
	}

	/**
	 * Create navigation elements (arrows and/or dots) and add event listeners.
	 *
	 * @param {HTMLElement} el - The element to which navigation elements will be added.
	 */
	#createNavigation(el: HTMLElement) {
		// Create arrow navigation elements if specified
		if (this.navigation.includes("arrows")) {
			this.#createArrows(el);

			// Add event listeners for arrow clicks
			const rightArrow = el.querySelector(".slidero-arrow-right");
			if (!rightArrow) {
				throw new Error("No right arrow found");
			}
			this.#handleArrowClick(rightArrow, () => this.#next(el));

			const leftArrow = el.querySelector(".slidero-arrow-left");
			if (!leftArrow) {
				throw new Error("No left arrow found");
			}
			this.#handleArrowClick(leftArrow, () => this.#previous(el));
		}

		// Create dot navigation elements if specified
		if (this.navigation.includes("dots")) {
			this.#createDots(el);
		}

		if (this.navigation.includes("thumbnails")) {
			this.#createThumbnails(el);
		}
	}

	/********************************************************************************
	 * Events
	 * TOC:
	 * 1. handleArrowClick
	 * 2. handleDotClick
	 *******************************************************************************/

	/**
	 * Add a click event listener to an arrow element and execute the provided callback.
	 *
	 * @param {Element} el - The arrow element to which the click event listener will be added.
	 * @param {Function} callback - The callback function to be executed when the arrow is clicked.
	 */
	#handleArrowClick(el: Element, callback: () => void) {
		el.addEventListener("click", () => {
			callback();
		});
	}

	/**
	 * Add a click event listener to a dot element and execute the provided callback.
	 *
	 * @param {Element} el - The dot element to which the click event listener will be added.
	 * @param {Function} callback - The callback function to be executed when the dot is clicked.
	 */
	#handleDotClick(el: Element, callback: () => void) {
		el.addEventListener("click", () => {
			callback();
		});
	}

	/**
	 * Add a click event listener to a thumbnail element and execute the provided callback.
	 *
	 * @param {Element} el - The thumbnail element to which the click event listener will be added.
	 * @param {Function} callback - The callback function to be executed when the thumbnail is clicked.
	 */
	#handleThumbnailClick(el: Element, callback: () => void) {
		el.addEventListener("click", () => {
			callback();
		});
	}

	/********************************************************************************
	 * Utils
	 * TOC:
	 * 1. getActiveIndex
	 * 2. handleAnimation
	 * 3. getSource
	 *******************************************************************************/

	/**
	 * Get the index of the active element within the slider.
	 *
	 * @param {HTMLElement} el - The slider element.
	 * @returns {number} The index of the active element.
	 * @throws {Error} Throws an error if no active element is found.
	 */
	#getActiveIndex(el: HTMLElement): number {
		const active = el.querySelector(".active");
		if (!active) {
			throw new Error("No active element found");
		}
		const activeIndex = Array.from(
			el.querySelectorAll(".slidero-item")
		).indexOf(active);
		this.activeIndex = activeIndex;
		return activeIndex;
	}
	/**
	 * Apply animation to an element with the specified duration and animation type.
	 *
	 * @param {HTMLElement} el - The element to which the animation will be applied.
	 * @param {number} duration - The duration of the animation in milliseconds.
	 * @param {string} type - The type of animation (e.g., "fadeIn", "fadeOut").
	 */
	#handleAnimation(el: HTMLElement, duration: number, type: string) {
		el.style.animation = `${type} ${duration}ms ease-in-out`;
	}

	/**
	 * Get the source attribute of an image element or the first image element within the provided element.
	 *
	 * @param {HTMLElement} el - The element containing the image element.
	 * @returns {string | null} The source attribute of the image or null if no image element is found.
	 */
	#getSource(el: HTMLElement): string | null {
		if (el.tagName === "IMG") {
			// If the provided element is an image element, return its source attribute.
			return el.getAttribute("src");
		} else {
			// If the provided element is not an image element, search for the first image element within it.
			let imgElement = el.querySelector("img");
			if (imgElement) {
				// If an image element is found, return its source attribute.
				return imgElement.getAttribute("src");
			}
		}
		// If no image element is found, return null.
		return null;
	}
}
