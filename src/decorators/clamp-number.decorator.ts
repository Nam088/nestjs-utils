import { Transform } from 'class-transformer';

/**
 * Options interface for ClampNumber decorator.
 */
interface ClampNumberOptions {
    /** Maximum allowed value */
    max: number;
    /** Minimum allowed value */
    min: number;
}

/**
 * Decorator that clamps a numeric value between specified minimum and maximum bounds.
 * @param {ClampNumberOptions} options - The clamping configuration
 * @returns {PropertyDecorator} Transform decorator that clamps the value
 * @example
 * class ExampleDto {
 *   @ClampNumber({ min: 0, max: 100 })
 *   percentage: number;
 * }
 */
export const ClampNumber = ({ max, min }: ClampNumberOptions) =>
    Transform(({ value }) => {
        const num = Number(value);

        if (isNaN(num)) {
            return min; // Or some other default, like the original value
        }

        if (num > max) {
            return max;
        }

        if (num < min) {
            return min;
        }

        return num;
    });
