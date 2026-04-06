const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3001";

function postFile(endpoint, filepath) {
  return new Promise((resolve, reject) => {
    const boundary = "----FormBoundary7MA4YWxkTrZu0gW";
    const fileContent = fs.readFileSync(filepath);
    const filename = path.basename(filepath);

    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="log"; filename="${filename}"\r\n`;
    body += `Content-Type: text/plain\r\n\r\n`;
    body += fileContent;
    body += `\r\n--${boundary}--`;

    const url = new URL(endpoint, BASE_URL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function get(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);

    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      })
      .on("error", reject);
  });
}

async function test() {
  console.log("1. Subiendo archivo de log...\n");
  const upload = await postFile("/logs/upload", "./sample.log");
  console.log("Upload response:", JSON.stringify(upload.body, null, 2));

  console.log("\n2. Analizando archivo de log...\n");
  const analyze = await postFile("/logs/analyze", "./sample.log");
  console.log("Analysis response:", JSON.stringify(analyze.body, null, 2));

  console.log("\n3. Obteniendo errores...\n");
  const errors = await get("/logs/errors");
  console.log("Errors response:", JSON.stringify(errors.body, null, 2));

  console.log("\n4. Filtrando por servicio...\n");
  const filterService = await get("/logs/errors?service=customer");
  console.log(
    "Filtered by service:",
    JSON.stringify(filterService.body, null, 2),
  );
}

test().catch(console.error);
