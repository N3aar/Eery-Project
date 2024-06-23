export default class BaseRequest {
	private url: string;
	private options: RequestInit;
	private queryOptions: URLSearchParams;

	constructor(url: string, options: RequestInit, queryOptions = {}) {
		this.url = url;
		this.options = options;
		this.queryOptions = new URLSearchParams(queryOptions);
	}

	private async request<T>(path: string, options: RequestInit): Promise<T> {
		const dash = path.startsWith("/") ? "" : "/";
		const prefix = path.includes("?") ? "&" : "?";

		const query = `${prefix}${this.queryOptions.toString()}`;
		const endpoint = `${this.url}${dash}${path}${query}`;

		const response: Response = await fetch(endpoint, {
			...this.options,
			...options,
		});

		if (!response.ok)
			throw new Error(`Failed to fetch: ${response.statusText}`);

		return response.json();
	}

	async get<T>(path: string, options?: RequestInit): Promise<T> {
		return this.request(path, { ...options, method: "GET" });
	}

	async post<T>(path: string, options?: RequestInit): Promise<T> {
		return this.request(path, { ...options, method: "POST" });
	}

	async put<T>(path: string, options?: RequestInit): Promise<T> {
		return this.request(path, { ...options, method: "PUT" });
	}

	async delete<T>(path: string, options?: RequestInit): Promise<T> {
		return this.request(path, { ...options, method: "DELETE" });
	}

	async patch<T>(path: string, options?: RequestInit): Promise<T> {
		return this.request(path, { ...options, method: "PATCH" });
	}
}
