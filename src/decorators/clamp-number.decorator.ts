import { Transform } from 'class-transformer';

interface ClampNumberOptions {
    max: number;
    min: number;
}

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
