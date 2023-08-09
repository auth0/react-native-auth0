export function convertExpiresInToExpiresAt(expiresIn: number): number | null {
    if(expiresIn === null || expiresIn === undefined) {
        return null
    }
    return Math.floor(Date.now() / 1000 + expiresIn)
}