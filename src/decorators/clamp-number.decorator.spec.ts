/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';

import { ClampNumber } from './clamp-number.decorator';

// Mock class-transformer
jest.mock('class-transformer', () => ({
    Transform: jest.fn().mockImplementation((fn) => fn),
}));

const mockTransform = Transform as jest.MockedFunction<typeof Transform>;

describe('ClampNumber', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Transform decorator integration', () => {
        it('should call Transform with the correct function', () => {
            ClampNumber({ max: 100, min: 0 });

            expect(mockTransform).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should return the result of Transform', () => {
            const mockResult = jest.fn();

            mockTransform.mockReturnValue(mockResult);

            const result = ClampNumber({ max: 100, min: 0 });

            expect(result).toBe(mockResult);
        });
    });

    describe('clamping function logic', () => {
        it('should create a function that clamps values correctly', () => {
            // Mock Transform to return the actual function
            mockTransform.mockImplementation((fn: any) => fn);

            const clampFn = ClampNumber({ max: 100, min: 0 }) as any;

            expect(clampFn({ value: 50 })).toBe(50);
            expect(clampFn({ value: 150 })).toBe(100);
            expect(clampFn({ value: -10 })).toBe(0);
        });

        it('should handle edge cases correctly', () => {
            mockTransform.mockImplementation((fn: any) => fn);

            const clampFn = ClampNumber({ max: 100, min: 0 }) as any;

            expect(clampFn({ value: 'invalid' })).toBe(0);
            expect(clampFn({ value: null })).toBe(0);
            expect(clampFn({ value: undefined })).toBe(0);
        });

        it('should work with different ranges', () => {
            mockTransform.mockImplementation((fn: any) => fn);

            const clampFn = ClampNumber({ max: -10, min: -100 }) as any;

            expect(clampFn({ value: -50 })).toBe(-50);
            expect(clampFn({ value: -5 })).toBe(-10);
            expect(clampFn({ value: -150 })).toBe(-100);
        });
    });
});
