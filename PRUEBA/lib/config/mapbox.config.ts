// lib/config/mapbox.config.ts
import * as mapboxgl from 'mapbox-gl';
import * as dotenv from 'dotenv';

dotenv.config();

const mapboxConfig = {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
    style: 'mapbox://styles/mapbox/outdoors-v12', // Estilo optimizado para actividades al aire libre
    initialZoom: 13,
    initialCenter: [-3.7038, 40.4168] as [number, number], // Explicitly type the coordinates// Madrid como ejemplo
    
    // Configuración para tracking
    trackingOptions: {
        enableHighAccuracy: true,
        maximumAge: 10000,        // 10 segundos
        timeout: 5000             // 5 segundos
    },
    
    // Configuración para dibujo de rutas
    routeStyle: {
        lineWidth: 4,
        lineColor: '#ff4400'
    }
};

export const initializeMap = (containerId: string): mapboxgl.Map => {
    const map = new mapboxgl.Map({
        container: containerId,
        style: mapboxConfig.style,
        center: mapboxConfig.initialCenter,
        zoom: mapboxConfig.initialZoom,
        accessToken: mapboxConfig.accessToken
    });

    // Añadir controles necesarios
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: mapboxConfig.trackingOptions,
        trackUserLocation: true
    }));

    return map;
};

export default mapboxConfig;