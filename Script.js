document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("breakdownForm");
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyN2IH4kNc_5gicFZIrEucall9FfQ6WsZYYJ-NoS2sur_fW1bAAmjwzItOP7V-HwWpstw/exec"; // Replace with your Apps Script URL

  const previewImage = (inputEl, previewId) => {
    const container = document.getElementById(previewId);
    container.innerHTML = "";
    for (let file of inputEl.files) {
      if (!file.type.startsWith("image/")) continue;
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      container.appendChild(img);
      img.onload = () => URL.revokeObjectURL(img.src);
    }
  };

  document.getElementById("breakOdoPhoto").addEventListener("change", () => previewImage(document.getElementById("breakOdoPhoto"), "previewBreakOdo"));
  document.getElementById("repVehicleOdoPhoto").addEventListener("change", () => previewImage(document.getElementById("repVehicleOdoPhoto"), "previewRepOdo"));

  // Map
  const map = L.map('map').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);

  let marker = null;
  const setMarker = (latlng) => {
    if (marker) marker.setLatLng(latlng);
    else {
      marker = L.marker(latlng, { draggable: true }).addTo(map);
      marker.on('dragend', e => {
        const p = e.target.getLatLng();
        document.getElementById('lat').value = p.lat;
        document.getElementById('lng').value = p.lng;
      });
    }
    document.getElementById('lat').value = latlng.lat;
    document.getElementById('lng').value = latlng.lng;
    map.panTo(latlng);
  };

  map.on('click', e => setMarker(e.latlng));

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      setMarker({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      map.setView([pos.coords.latitude, pos.coords.longitude], 15);
    }, err => console.warn("Geolocation failed"));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (marker) {
      const p = marker.getLatLng();
      document.getElementById('lat').value = p.lat;
      document.getElementById('lng').value = p.lng;
    }

    const formData = {
      formType: "vehicleBreakdown",
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
      repVehicleOdo: document.getElementById("repVehicleOdo").value
    };

    const readFileAsBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });

    if (document.getElementById("breakOdoPhoto").files[0])
      formData.breakOdoPhoto = await readFileAsBase64(document.getElementById("breakOdoPhoto").files[0]);
    if (document.getElementById("repVehicleOdoPhoto").files[0])
      formData.repVehicleOdoPhoto = await readFileAsBase64(document.getElementById("repVehicleOdoPhoto").files[0]);

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "Text/plain" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === "success") {
        alert("✅ Vehicle breakdown data saved!");
        form.reset();
        document.getElementById("previewBreakOdo").innerHTML = "";
        document.getElementById("previewRepOdo").innerHTML = "";
        if (marker) { map.removeLayer(marker); marker = null; }
      } else alert("❌ Submission error: " + data.message);
    } catch (err) {
      alert("⚠️ Submission failed: " + err.message);
    }
  });
});