export interface HttpQuery {
  name: string;
  value: string;
}

export interface HttpHeader {
  [key: string]: string;
}

export interface HttpResponse {
  status?: number;
  headers?: HttpHeader;
  body?: string;
}

export interface HttpRequest {
  method: string;
  path: string;
  query: HttpQuery[];
  headers: HttpHeader;
  body: string;
}

export class HttpClient {
  buf: Uint8Array;
  res: string;
  conn: Deno.Conn;

  constructor(conn: Deno.Conn) {
    this.conn = conn;
    this.buf = new Uint8Array(1);
    this.res = "";
  }

  async readLine() {
    this.res = "";
    this.buf = new Uint8Array(1);

    while (true) {
      await this.conn.read(this.buf);
      const char = String.fromCharCode(this.buf[0]);
      this.res += char;
      if (char === "\n") {
        return this.res.slice(0, this.res.length - 2);
      }
    }
  }

  async readHead(res: HttpResponse) {
    const line = await this.readLine();
    res.status = parseInt(line.split(" ")[1]);
  }

  async readHeaders(res: HttpResponse) {
    let isEnd = false;

    res.headers = {};
    while (!isEnd) {
      const line = await this.readLine();
      if (line === "") {
        isEnd = true;
      } else {
        const [name, value] = line.split(":");
        res.headers[name.trim()] = value.trim();
      }
    }
  }

  async readBody(res: HttpResponse) {
    const dec = new TextDecoder();
    let body = "";
    const headers = res.headers;

    if (headers!["Transfer-Encoding"] === "chunked") {
      while (true) {
        // "ab01\r\n"  <-- determines the *total* size of the following chunks to send
        const bufsize = parseInt(await this.readLine(), 16);

        // "0\r\n"  <-- bufsize is 0 => end of stream
        if (bufsize === 0) break;

        let bytesRead = 0;
        while (bytesRead < bufsize) {
          const arr = new Uint8Array(bufsize - bytesRead);
          const chunkSize = await this.conn.read(arr) ?? 0;
          bytesRead += chunkSize;
          // you never know the size of actual data inside the chunk until receiving => "cut" it with no mem/perf cost
          const text = dec.decode(arr.subarray(0, chunkSize));
          body += text;
        }
        // "\r\n"  <-- empty line after data-chunks (skip it)
        await this.readLine();
      }
    } else {
      const bufsize = parseInt(res.headers!["Content-Length"], 10);
      const arr = new Uint8Array(bufsize);
      await this.conn.read(arr);
      body += dec.decode(arr);
    }
    res.body = body;
  }

  send(data: string) {
    const enc = new TextEncoder();

    return this.conn.write(enc.encode(data));
  }

  buildQueryString(query: HttpQuery[]) {
    return query.map((v) => `${v.name}=${v.value}`).join("&");
  }

  buildHeaders(headers: HttpHeader) {
    return Object.keys(headers).map((v) => `${v}: ${headers[v]}`).join("\r\n");
  }

  async sendRequest(request: HttpRequest): Promise<HttpResponse> {
    const head = `${request.method} ${request.path}?${this.buildQueryString(request.query)} HTTP/1.1\r\n`;
    if (request.body.length > 0) {
      request.headers["Content-length"] = request.body.length.toString();
      request.headers["Content-type"] = "application/json";
    }
    const headers = this.buildHeaders(request.headers);
    const reqString = head + headers + "\r\n\r\n" + request.body;
    // console.log(JSON.stringify(reqString));
    await this.send(reqString);
    const response: HttpResponse = {};
    await this.readHead(response);
    await this.readHeaders(response);
    await this.readBody(response);
    this.conn.close();
    return response;
  }
}
