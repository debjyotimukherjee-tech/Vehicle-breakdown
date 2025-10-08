document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reportForm");
  const output = document.getElementById("output");
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbySWQ7Cnkfkm_JzV_zrevKLMh3pTduSPZdrClLzAwroNjpzb1BxtcQnUkPZv34IWs2b_w/exec"; // 🔹 Replace with your Web App URL

  // Leaflet Map
  const map = L.map("map").setView([20.5937, 78.9629], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
  }).addTo(map);

  let marker;
  map.on("click", (e) => {
    if (marker) marker.setLatLng(e.latlng);
    else marker = L.marker(e.latlng).addTo(map);
    document.getElementById("lat").value = e.latlng.lat;
    document.getElementById("lng").value = e.latlng.lng;
  });

  // Helper to convert image file to base64
  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Form submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      timestamp: document.getElementById("timestamp").value,
      timeExchange: document.getElementById("timeExchange").value,
      repName: document.getElementById("repName").value,
      riderName: document.getElementById("riderName").value,
      contactNumber: document.getElementById("contactNumber").value,
      breakReg: document.getElementById("breakReg").value,
      breakOdo: document.getElementById("breakOdo").value,
      breakLocationText: document.getElementById("breakLocationText").value,
      lat: document.getElementById("lat").value,
      lng: document.getElementById("lng").value,
      problem: document.getElementById("problem").value,
      repVehicleReg: document.getElementById("repVehicleReg").value,
      repVehicleOdo: document.getElementById("repVehicleOdo").value,
    };

    const breakOdoPhoto = document.getElementById("breakOdoPhoto").files[0];
    const repVehicleOdoPhoto = document.getElementById("repVehicleOdoPhoto").files[0];

    if (breakOdoPhoto) data.breakOdoPhoto = await readFileAsBase64(breakOdoPhoto);
    if (repVehicleOdoPhoto) data.repVehicleOdoPhoto = await readFileAsBase64(repVehicleOdoPhoto);

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "text/plain" },
      });
      const result = await res.json();
      if (result.status === "success") {
        output.textContent = "✅ Data submitted successfully!";
        form.reset();
      } else {
        output.textContent = "❌ Error: " + result.message;
      }
    } catch (err) {
      output.textContent = "⚠️ Failed: " + err.message;
    }
  });
});
