import { Container } from "./container.ts";
import { Image } from "./image.ts";
import { RegistryAuth } from "./lib/client/auth.ts";
import { DockerClient } from "./lib/client/client.ts";
import { Network } from "./network.ts";

export default class Docker {
  containers: Container;
  images: Image;
  networks: Network;

  constructor(options: string | Deno.ConnectOptions = "/var/run/docker.sock", auth: RegistryAuth | null = null) {
    const client = new DockerClient(options, auth);
    this.containers = new Container(client);
    this.images = new Image(client);
    this.networks = new Network(client);
  }
}
