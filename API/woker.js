const BASE = "https://raw.githubusercontent.com/chkdua/Wilayah-Administrasi-Indonesia/master/csv/";

let DATA = null;

function clean(value) {
  return value.replace(/^"|"$/g, "").trim();
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(";").map(clean);

  return lines.slice(1).map(line => {
    const values = line.split(";");
    let obj = {};
    headers.forEach((h, i) => obj[h] = clean(values[i] || ""));
    return obj;
  });
}

async function loadData() {
  if (DATA) return DATA;

  const [p, r, d, v] = await Promise.all([
    fetch(BASE + "provinces.csv").then(r => r.text()),
    fetch(BASE + "regencies.csv").then(r => r.text()),
    fetch(BASE + "districts.csv").then(r => r.text()),
    fetch(BASE + "villages.csv").then(r => r.text()),
  ]);

  const provinces = parseCSV(p);
  const regencies = parseCSV(r);
  const districts = parseCSV(d);
  const villages = parseCSV(v);

  DATA = { provinces, regencies, districts, villages };
  return DATA;
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const { provinces, regencies, districts, villages } = await loadData();
if (path === "/") {
  return json({
    name: "Wilayah Indonesia API",
    status: "online",
    base_url: url.origin,
    endpoints: {
      provinces: {
        method: "GET",
        url: url.origin + "/api/provinces",
        description: "Ambil semua provinsi"
      },
      regencies: {
        method: "GET",
        url: url.origin + "/api/regencies?province_id=11",
        description: "Ambil kabupaten berdasarkan province_id"
      },
      districts: {
        method: "GET",
        url: url.origin + "/api/districts?regency_id=1101",
        description: "Ambil kecamatan berdasarkan regency_id"
      },
      villages: {
        method: "GET",
        url: url.origin + "/api/villages?district_id=110101",
        description: "Ambil desa berdasarkan district_id"
      }
    }
  });
}

    if (path === "/api/provinces") {
      return json(provinces);
    }

    if (path === "/api/regencies") {
      const province_id = url.searchParams.get("province_id");
      return json(regencies.filter(r => r.province_id === province_id));
    }

    if (path === "/api/districts") {
      const regency_id = url.searchParams.get("regency_id");
      return json(districts.filter(d => d.regency_id === regency_id));
    }

    if (path === "/api/villages") {
      const district_id = url.searchParams.get("district_id");
      return json(villages.filter(v => v.district_id === district_id));
    }

    return new Response("Wilayah API Ready 🚀", { status: 200 });
  }
};
