const baseUrl = `http://localhost:4000`;
export type queryParams = Record<string, any>;

function generateUrl(baseUrl: string, queryParams?: queryParams): string {
    if (!queryParams) {
        return baseUrl;
    }
    const queryString = Object.keys(queryParams)
        .map((key) => `${key}=${queryParams[key]}`)
        .join("&");
    return baseUrl + (queryString ? `?${queryString}` : "");
}

export const Api = {
    Files: (queryParams?: queryParams) =>
        generateUrl(baseUrl + `/fs`, queryParams),
    MediaView: (queryParams?: queryParams) =>
        generateUrl(baseUrl + `/fs/stream-video`, queryParams),
};

export interface ServerPaginationResponse<DataType> {
    results: DataType;
    total: number;
}
