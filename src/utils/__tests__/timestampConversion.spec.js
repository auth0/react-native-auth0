import { convertExpiresInToExpiresAt, convertUnixTimestampToDate } from '../timestampConversion'

describe('timestamp conversion', () => {
    beforeAll(() => {
        jest
          .useFakeTimers()
          .setSystemTime(new Date('2023-01-01'));
      });
    
    describe('test convertExpiresInToExpiresAt', () => {
        it('should successfully convert', () => {
            let expiresIn = 86400
            const result = convertExpiresInToExpiresAt(expiresIn)
            expect(result).toMatchSnapshot();
        });

        it('should handle zero', () => {
            let expiresIn = 0
            const result = convertExpiresInToExpiresAt(expiresIn)
            expect(result).toMatchSnapshot();
        });

        it('should handle null', () => {
            let expiresIn = null
            const result = convertExpiresInToExpiresAt(expiresIn)
            expect(result).toMatchSnapshot();
        });

        it('should handle undefined', () => {
            let expiresIn = undefined
            const result = convertExpiresInToExpiresAt(expiresIn)
            expect(result).toMatchSnapshot();
        });
    })

    describe('convertUnixTimestampToDate', () => {
        it('should successfully convert', () => {
            let timestampInSeconds = 1691594356
            const result = convertUnixTimestampToDate(timestampInSeconds)
            expect(result).toMatchSnapshot();
        });

        it('should handle zero', () => {
            let timestampInSeconds = 0
            const result = convertUnixTimestampToDate(timestampInSeconds)
            expect(result).toMatchSnapshot();
        });

        it('should handle null', () => {
            let timestampInSeconds = null
            const result = convertUnixTimestampToDate(timestampInSeconds)
            expect(result).toMatchSnapshot();
        });

        it('should handle undefined', () => {
            let timestampInSeconds = undefined
            const result = convertUnixTimestampToDate(timestampInSeconds)
            expect(result).toMatchSnapshot();
        });
    })
});
