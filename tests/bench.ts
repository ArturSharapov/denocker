const buff = new Uint8Array([115]);
const decoder = new TextDecoder()

Deno.bench("fromCharCode", () => {
  String.fromCharCode(buff[0])
});

Deno.bench("decoder", () => {
  decoder.decode(buff)[0]
});

// benchmark         time (avg)        iter/s             (min … max)       p75       p99      p995
// ------------------------------------------------------------------ -----------------------------
// fromCharCode       5.33 ns/iter 187,785,231.5    (5.25 ns … 11.56 ns) 5.3 ns 5.81 ns 6.08 ns
// decoder           87.49 ns/iter  11,430,175.1   (83.76 ns … 97.26 ns) 87.87 ns 89.83 ns 90.19 ns
