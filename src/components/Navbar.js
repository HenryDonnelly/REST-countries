import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Navbar = () => {
    const [countries, setCountries] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('https://restcountries.com/v3.1/all')
            .then(response => {
                const countryNames = response.data.map(country => country.name.common);
                setCountries(countryNames);
            })
            .catch(error => {
                console.error("Error fetching countries:", error);
            });
    }, []);

    const handleRandomCountryClick = () => {
        if (countries.length > 0) {
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            navigate(`/country/${randomCountry}`);
        }
    };

    
    return (
        <div className='pb-4 pt-4'>
             <Link to='/' >
            <Button variant="secondary">Home</Button>
            </Link>
            <Button variant="secondary" onClick={handleRandomCountryClick} style={{ marginLeft: '10px' }}>
                Pick a random country
            </Button>
        </div>
    );
};

export default Navbar;