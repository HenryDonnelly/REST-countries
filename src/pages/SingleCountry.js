import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Row, Col, Image } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet default icon fix (ensure marker icon displays correctly)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

const SingleCountry = () => {
    const { name } = useParams();
    const [country, setCountry] = useState(null);
    const [lat, setLat] = useState(0); // state latitude
    const [lng, setLng] = useState(0); // state longitude
    const [cuisines, setCuisines] = useState([]);  // State for cuisines

    const openWeatherApiKey = 'YOUR_OPENWEATHER_API_KEY';  // Replace with your OpenWeather API key

    // Function to map country names to cuisine types
    const cuisineMapping = {
        "Canada": "Canadian",
        "United States": "American",
        "France": "French",
        // Add more mappings as needed
    };

    const getCuisineType = (countryName, primaryLanguage) => {
        // First try the cuisine mapping for specific countries
        if (cuisineMapping[countryName]) {
            return cuisineMapping[countryName];
        }
        // Otherwise, use the primary language as the fallback
        return primaryLanguage;
    };

    useEffect(() => {
        // Fetch country data from REST Countries API
        axios.get(`https://restcountries.com/v3.1/name/${name}?fullText=true`)
            .then((res) => {
                const countryData = res.data[0];
                setCountry(countryData);
                setLat(countryData.latlng[0]);  // Set latitude
                setLng(countryData.latlng[1]);  // Set longitude

                // Fetch weather data from OpenWeather API
                const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${countryData.latlng[0]}&lon=${countryData.latlng[1]}&appid=${openWeatherApiKey}&units=metric`;

                // Get the first language from the country's language object
                const primaryLanguage = Object.values(countryData.languages)[0];
                const cuisineType = getCuisineType(countryData.name.common, primaryLanguage);

                // Fetch cuisine data from TheMealDB API based on the cuisine type
                if (cuisineType) {
                    axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisineType}`)
                        .then((mealRes) => {
                            setCuisines(mealRes.data.meals || []);  // Update cuisines state
                        })
                        .catch((mealErr) => {
                            console.error('Error fetching meals:', mealErr);
                        });
                }
            })
            .catch((e) => {
                console.error(e);
            });

    }, [name]);

    if (!country) {
        return <div>Loading...</div>;
    }

    return (
        <Row>
            <Col>
                <Image src={country.flags.png} alt={`${country.name.common}'s flag`} />
            </Col>

            <Col>
                <h1>{country.name.common}</h1>
                <h2>Official name: {country.name.official}</h2>


                <p>Region: {country.region}</p>
                {country.subregion && <p>Sub-Region: {country.subregion}</p>}


                <p>Languages:</p>
                <ul>
                    {Object.values(country.languages).map((language, idx) => (
                        <li key={idx}>{language}</li>
                    ))}
                </ul>


                <p>Currency: {Object.values(country.currencies)[0].name} ({Object.values(country.currencies)[0].symbol})</p>


                {/* Leaflet Map */}
                <MapContainer center={[lat, lng]} zoom={5} scrollWheelZoom={false} style={{ height: "400px", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[lat, lng]}>
                        <Popup>
                            {country.name.common}
                        </Popup>
                    </Marker>
                </MapContainer>


                {/* Weather Information */}

                {/* Cuisine Information */}
                <h3>Local Dishes:</h3>
                <ul>
                    {cuisines.length > 0 ? cuisines.map((cuisine, idx) => (
                        <li key={idx}>{cuisine.strMeal}</li>
                    )) : <li>No local dishes found for this country.</li>}
                </ul>
            </Col>
        </Row>
    );
};

export default SingleCountry;
