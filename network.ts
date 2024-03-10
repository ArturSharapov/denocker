import { DockerClient } from "./lib/client/client.ts";
import { CreateNetworkResponse } from "./lib/types/network/create.ts";

interface ListOptions {
  /**
    * A JSON encoded value of the filters (a map[string][]string) to process on the images list.
    * 
    * Available filters:
    * 
    * - `dangling=<boolean>` — When set to true (or 1), returns all networks that are not in use by a container. When set to false (or 0), only networks that are in use by one or more containers are returned.
    * - `driver=<driver-name>` — Matches a network's driver.
    * - `id=<network-id>` — Matches all or part of a network ID.
    * - `label=<key>` — or label=<key>=<value>` — of a network label.
    * - `name=<network-name>` — Matches all or part of a network name.
    * - `scope=["swarm"|"global"|"local"]` — Filters networks by scope (swarm, global, or local).
    * - `type=["custom"|"builtin"]` — Filters networks by type. The custom keyword returns all user-defined networks.
   */
  filters?: string;
}

interface CreateOptions {
  Name: string;
  Driver?: "bridge" | "host" | "overlay" | "ipvlan" | "macvlan" | "none";
}

export class Network {
  private client: DockerClient;

  constructor(client: DockerClient) {
    this.client = client;
  }

  async create(options: CreateOptions): Promise<CreateNetworkResponse[]> {
    const res = await this.client.post("/networks/create", JSON.stringify(options));
    if (!res.body || !res.body.length) {
      return [];
    }
    return JSON.parse(res.body);
  }

  async list(options?: ListOptions): Promise<CreateNetworkResponse[]> {
    const res = await this.client.get("/networks", [
      { name: "filters", value: options?.filters ? options.filters.toString() : "" },
    ]);
    if (!res.body || !res.body.length) {
      return [];
    }
    return JSON.parse(res.body);
  }
}
