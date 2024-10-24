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
    const [weather, setWeather] = useState(null);  // State for weather
    const [timezone, setTimezone] = useState(null); // State for timezone
    const [holidays, setHolidays] = useState([]); // State for holidays


    const openWeatherApiKey = '6e0d12dc9671546041567b565f72ae9b';  // Replace with your OpenWeather API key
    const ipgeolocationApiKey='ab29fa7a98114118b70ab3584e54cba9';
    const calendarificApiKey ='8W0LAlgAsOCEF5SE6qklPS6lYyKiCEfv';

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
                axios.get(weatherApiUrl)
                .then((weatherRes) => {
                    setWeather(weatherRes.data);  // Set weather data
                    console.log('Weather Data:', weatherRes.data);
                })
                .catch((weatherErr) => {
                    console.error('Error fetching weather:', weatherErr);
                });

                // Get the first language from the country's language object
                const primaryLanguage = Object.values(countryData.languages)[0];
                console.log('Primary Language:', primaryLanguage);
                const cuisineType = getCuisineType(countryData.name.common, primaryLanguage);

                // Fetch timezone data from IPGeolocation API
                axios.get(`https://api.ipgeolocation.io/timezone?apiKey=${ipgeolocationApiKey}&lat=${countryData.latlng[0]}&long=${countryData.latlng[1]}`)
                .then((timezoneRes) => {
                    setTimezone(timezoneRes.data);  // Update timezone state
                    console.log('Timezone Data:', timezoneRes.data);
                })
                .catch((timezoneErr) => {
                    console.error('Error fetching timezone:', timezoneErr);
                });

                // fetch data from calandarific

                const countryCode = countryData.cca2; // Use country code for holidays
                const currentYear = new Date().getFullYear();

                axios.get(`https://calendarific.com/api/v2/holidays?api_key=${calendarificApiKey}&country=${countryCode}&year=${currentYear}`)
                .then((holidayRes) => {
                    setHolidays(holidayRes.data.response.holidays);
                    console.log('Holiday Data:', holidayRes.data);
                })
                .catch((holidayErr) => {
                    console.error('Error fetching holidays:', holidayErr);
                });

                // Fetch cuisine data from TheMealDB API based on the cuisine type
                if (cuisineType) {
                    axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisineType}`)
                        .then((mealRes) => {
                            setCuisines(mealRes.data.meals || []);  // Update cuisines state
                            console.log('Meal Data:', mealRes.data);
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
            <Col className="text-white">
                <Image src={country.flags.png} alt={`${country.name.common}'s flag`} style={{ marginLeft: '10vw', marginTop: '5vw' }} />
            </Col>

            <Col className="text-white">
            <div>
                <h1>{country.name.common}</h1>
                <h2>Official name: {country.name.official}</h2>
                </div>

               <div>
                <p>Region: {country.region}</p>
                {country.subregion && <p>Sub-Region: {country.subregion}</p>}
                </div>

                <div>
                <p>Languages:</p>
                <ul>
                    {Object.values(country.languages).map((language, idx) => (
                        <li key={idx}>{language}</li>
                    ))}
                </ul>
                </div>

                <div>
                    <p>Currency: {Object.values(country.currencies)[0].name} ({Object.values(country.currencies)[0].symbol})</p>
                </div>


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
                {weather ? (
              <div>
              <h3>Weather in {country.name.common}</h3>
               <p>Temperature: {weather.main.temp} °C</p>
              <p>Weather: {weather.weather[0].description}</p>
              <p>Humidity: {weather.main.humidity}%</p>
              <p>Wind Speed: {weather.wind.speed} m/s</p>
              </div>
                 ) : (
                      <p>Loading weather...</p>
                )}


                 {/* Display timezone information */}
               {timezone && (
                    <div>
                        <h3>Local Timezone: {timezone.timezone}</h3>
                        <p>Local Time: {timezone.date_time_txt}</p>
                    </div>
                )}

                {/* Display holidays */}
                {holidays.length > 0 && (
                    <div>
                        <h3>Holidays in {new Date().getFullYear()}:</h3>
                        <ul>
                            {holidays.map((holiday, idx) => (
                                <li key={idx}>{holiday.name} - {holiday.date.iso}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Cuisine Information */}
                <div>
                <h3>Local Dishes:</h3>
                <ul>
                    {cuisines.length > 0 ? cuisines.map((cuisine, idx) => (
                        <li key={idx}>{cuisine.strMeal}</li>
                    )) : <li>No local dishes found for this country.</li>}
                </ul>
                </div>
            </Col>
        </Row>
    );
};

export default SingleCountry;
