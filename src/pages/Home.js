import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CountryCard from '../components/CountryCard';
import { Row } from 'react-bootstrap';

const Home = () => {
    const [countriesList, setCountriesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState(null)

    useEffect(() => {
        if (!searchTerm) {
            axios.get('https://restcountries.com/v3.1/all')
                .then(response => {
                    console.log(response.data);
                    setCountriesList(response.data);
                })
                .catch(error => {
                    console.error(error)
                });
        }

        setCountriesList(countriesList.filter((country) => {
            return country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
        }))

    }, [searchTerm]);

    const handleChange = (e) => {
        setSearchTerm(e.target.value)
    }

    let countryCards = countriesList.map((country, index) => {
        return (

            <CountryCard
                key={country.ccn3}
                flag={country.flags.png}
                name={country.name.common}
                region={country.region}
            />
        );
    });

    return (
        <div style={{ paddingBottom: '100vw' }}>
            <input placeholder='Search' onChange={handleChange} style={{ marginBottom: '10px' }}></input>
            <Row md={3} xs={1}>
                {countryCards}
            </Row>
        </div>
    );
};

export default Home;
