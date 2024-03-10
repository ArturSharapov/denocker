export interface CreateNetworkResponse {
  Name: string,
  CheckDuplicate: boolean;
  Driver: "bridge";
  EnableIPv6: boolean;
  IPAM: {
    Driver: "default";
    Config: {
      Subnet: string;
      IPRange?: string;
      Gateway: string;
    }[];
    Options: Record<string, string>;
  };
  Internal: boolean;
  Attachable: boolean;
  Ingress: boolean;
  Options: Record<string, string>;
  Labels: Record<string, string>;
}
