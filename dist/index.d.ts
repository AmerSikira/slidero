/**
 * Configuration options for the slider.
 */
declare type SliderOptions = {
    el: HTMLElement;
    autoPlay?: boolean;
    autoPlaySpeed?: number;
    navigation?: string[];
};
/**
 * Slidero class for creating and managing a slider component.
 */
declare class Slidero {
    #private;
    el: HTMLElement;
    autoPlay: boolean;
    autoPlaySpeed: number;
    navigation: string[];
    activeIndex: number;
    interval: number | null;
    unwantedChildren: string;
    /**
     * Create a new Slidero instance.
     *
     * @param {SliderOptions} defaults - Configuration options for the slider.
     * @throws {Error} Throws an error if no element is provided.
     */
    constructor(defaults: SliderOptions);
}
//# sourceMappingURL=index.d.ts.map