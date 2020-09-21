

class StatusHandler {
	constructor(element) {
		this.element = element;

		this.groups = [];
		this.services = [];
	}

	init() {
		const groupReq = this.getGroups();
		const servicesReq = this.getServices();

		Promise.all([groupReq, servicesReq]).then((values) => {
			this.groups = values[0];
			this.services = values[1];

			this.element.innerHTML = "";
			this.services.forEach((service, index) => {
				let group = this.groups.find(el => el.id == service.groupId);
				this.element.insertAdjacentHTML('beforeend', this.generateHtml(group, service))
			});
		});
	}

	async getGroups() {
		return this.getJson('groups')
			.then(response => response.json())
			.then(data => {
				return data.map((group, index) => {
					return {
						id: group.id,
						name: group.name
					};
				});
			});
	}

	getServices() {
		return this.getJson('services')
			.then(response => response.json())
			.then(data => {
				return data.map((service, index) => {
					return {
						id: service.id,
						name: service.name,
						latency: service.latency,
						online: service.online,
						groupId: service.group_id,
						permalink: `https://status.elitefettsack.com/service/${service.permalink}`
					};
				});
			});
	}

	getJson(endpoint) {
		const url = `https://status.elitefettsack.com/api/${endpoint}`;
		return fetch(url);
	}

	generateHtml(group, service) {
		let latencyText = Math.floor(service.latency / 1000) + "ms";
		if (service.latency < 1000) {
			latencyText = service.latency + "μs";
		}

		const color = service.online ? 'green' : 'red';
		const offlineMarkup = `<span class="text-xs uppercase tracking-wide font-bold px-2 py-1 bg-red-300 rounded text-red-900">Offline</span>`;
		const onlineMarkup = `
			<span class="text-xs text-gray-600 mr-2">${latencyText}</span>	
			<span class="text-xs uppercase tracking-wide font-bold px-2 py-1 bg-green-300 rounded text-green-900">Online</span>
		`;

		return `
			<a href="${service.permalink}" class="flex hover:bg-${color}-100 justify-between items-center bg-white shadow p-4 mt-4 rounded-lg">
                <div>
                    <p class="text-sm text-purple-600">${group.name}</p>
                    <p>${service.name}</p>
                </div>
                <div class="text-center">
                    ${service.online ? onlineMarkup : offlineMarkup}
                </div>
            </a>
		`;
	}
}

document.addEventListener('DOMContentLoaded', function () {
	const el = document.getElementById('status');
	var statusHandler = new StatusHandler(el);
	statusHandler.init();
});