export function convertExpiresInToExpiresAt(expiresIn: number): Date | null {
    if(expiresIn === null || expiresIn === undefined) {
        return null
    }
    return new Date(Date.now() + (expiresIn * 1000))
}

export function convertUnixTimestampToDate(timestampInSeconds: number): Date | null {
    if(timestampInSeconds === null || timestampInSeconds === undefined) {
        return null
    }
    return new Date(timestampInSeconds * 1000)
}
  