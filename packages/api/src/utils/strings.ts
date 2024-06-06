export const escapeTrailingSlash = (path: string) => path.replace(/\/$/, '')
export const escapeLeadingSlash = (path: string) => path.replace(/^\//, '')
