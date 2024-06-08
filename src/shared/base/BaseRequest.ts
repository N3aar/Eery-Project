export default class BaseRequest {
	private url: string;
	private options: RequestInit;

	constructor(url: string, options: RequestInit) {
		this.url = url;
		this.options = options;
	}

	private async request<T>(path: string, options: RequestInit): Promise<T> {
		const endpoint = `${this.url}${path.startsWith("/") ? "" : "/"}${path}`;
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
