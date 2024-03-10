import { DockerClient } from "./lib/client/client.ts";
import { ListImageResponse } from "./lib/types/image/list.ts";

interface ListOptions {
  /**
   * Show all images. Only images from a final layer (no children) are shown by default.
   * @default false
   */
  all?: boolean;
  /**
    * A JSON encoded value of the filters (a map[string][]string) to process on the images list.
    * 
    * Available filters:
    * 
    * - `before` — (`<image-name>[:<tag>]`, `<image id>` or `<image@digest>`)
    * - `dangling` — `true`
    * - `label` — `key` or `label="key=value"` of an image label
    * - `reference` — (`<image-name>[:<tag>]`)
    * - `since` — (`<image-name>[:<tag>]`, `<image id>` or `<image@digest>`)
    * - `until` — `<timestamp>`
   */
  filters?: string;
  /**
   * Compute and show shared size as a `SharedSize` field on each image.
   * @default false
   */
  sharedSize?: boolean;
  /**
   * Show digest information as a `RepoDigests` field on each image.
   * @default false
   */
  digests?: boolean;
}

export class Image {
  private client: DockerClient;

  constructor(client: DockerClient) {
    this.client = client;
  }

  async list(options?: ListOptions): Promise<ListImageResponse[]> {
    const res = await this.client.get("/images/json", [
      // { name: "all", value: options?.all ? "true" : "false" },
      { name: "filters", value: options?.filters ? options.filters.toString() : "" },
      // { name: "shared-size", value: options?.sharedSize ? options.sharedSize.toString() : "" },
      // { name: "digests", value: options?.digests ? "true" : "" },
    ]);
    if (!res.body || !res.body.length) {
      return [];
    }
    return JSON.parse(res.body);
  }
}
