export interface ListImageResponse {
  Id: string,
  ParentId: string,
  RepoTags: string[],
  RepoDigests: string[],
  Created: string,
  Size: number,
  SharedSize: number,
  VirtualSize: number,
  Labels: Record<string, string>,
  Containers: number,
}
