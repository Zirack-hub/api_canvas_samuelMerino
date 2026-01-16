/*
Alumno: Samuel Merino Prado
*/

document.addEventListener("DOMContentLoaded", function () {
  // VARIABLES PRINCIPALES
  const mapa = L.map("map").setView([40.416, -3.703], 6);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapa);

  const canvas = document.getElementById("miCanvas");
  const ctx = canvas.getContext("2d");

  const inputLat = document.getElementById("lat");
  const inputLng = document.getElementById("lng");

  let puntos = JSON.parse(localStorage.getItem("locations") || "[]");
  let marcadores = [];
  let zonasBorrado = [];

  // DIBUJA EL HISTORIAL EN EL CANVAS
  function dibujarCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    zonasBorrado = [];

    if (puntos.length === 0) return;

    const alturaFila = 40;
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    puntos.forEach((punto, i) => {
      const y = 30 + i * alturaFila;

      ctx.fillStyle = "#7a4b5a";
      ctx.fillText(
        `P${i + 1}: ${punto.lat.toFixed(3)}, ${punto.lng.toFixed(3)}`,
        10,
        y
      );

      const posX = canvas.width - 30;
      ctx.fillStyle = "red";
      ctx.font = "bold 16px Arial";
      ctx.fillText("X", posX, y);

      zonasBorrado.push({
        x: posX - 10,
        y: y - 10,
        w: 20,
        h: 20,
        index: i,
      });
    });
  }

  // ACTUALIZA LOS MARCADORES DEL MAPA
  function actualizarMapa() {
    marcadores.forEach((m) => mapa.removeLayer(m));
    marcadores = [];

    puntos.forEach((punto, i) => {
      const marker = L.marker([punto.lat, punto.lng])
        .addTo(mapa)
        .bindPopup(`Ubicación ${i + 1}`);
      marcadores.push(marker);
    });
  }

  // GUARDA EN LOCALSTORAGE
  function guardarDatos() {
    localStorage.setItem("locations", JSON.stringify(puntos));
    actualizarMapa();
    dibujarCanvas();
  }

  // BORRAR UN PUNTO
  function borrarPunto(indice) {
    puntos.splice(indice, 1);
    guardarDatos();
  }

  // MOSTRAR COORDENADAS EN TIEMPO REAL
  mapa.on("mousemove", function (e) {
    inputLat.value = e.latlng.lat.toFixed(5);
    inputLng.value = e.latlng.lng.toFixed(5);
  });

  // GUARDAR PUNTO AL HACER CLICK
  mapa.on("click", function (e) {
    puntos.push({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    });
    guardarDatos();
  });

  // DETECTAR CLICK EN LA X DEL CANVAS
  canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const zona = zonasBorrado.find(
      (z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h
    );

    if (zona) {
      borrarPunto(zona.index);
    }
  });

  // AJUSTAR CANVAS AL REDIMENSIONAR
  window.addEventListener("resize", dibujarCanvas);

  // INICIO
  actualizarMapa();
  dibujarCanvas();
});
