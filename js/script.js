// Chave da API do OpenWeatherMap (substitua pela sua própria se necessário)
const apiKey = 'a302580f95ded9ebc4aa9b0e0e602186';

// Selecionando os elementos da interface
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const weatherIcon = document.getElementById('weather-icon');
const locationInput = document.getElementById('location-input');
const searchButton = document.getElementById('search-button');
const forecast = document.getElementById('forecast');
const errorMessage = document.getElementById('error-message');
const localTime = document.getElementById('local-time');

// Função para buscar os dados de previsão do tempo e previsão simultaneamente
async function fetchWeather(city) {
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`;

        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        if (weatherData.cod === '404' || forecastData.cod === '404') {
            showError('Local não encontrado.');
            return;
        }

        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
        updateLocalTime(weatherData.timezone);  // Atualiza o horário local com base no timezone retornado
        updateBackground(weatherData);          // Atualiza o fundo conforme o clima e horário
    } catch (error) {
        console.error('Erro ao buscar os dados', error);
        showError('Erro ao buscar os dados. Tente novamente mais tarde.');
    }
}

// Função para mostrar mensagens de erro na interface
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Função para atualizar a interface com os dados do tempo
function updateWeatherUI(data) {
    cityName.textContent = data.name;
    temperature.textContent = Math.round(data.main.temp) + '°C';
    condition.textContent = data.weather[0].description;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

// Função para atualizar a interface com a previsão do tempo
function updateForecastUI(data) {
    forecast.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const dayForecast = data.list[i];
        const date = new Date(dayForecast.dt_txt).toLocaleDateString('pt-BR');
        const temp = Math.round(dayForecast.main.temp);
        const weather = dayForecast.weather[0].description;
        const icon = `http://openweathermap.org/img/wn/${dayForecast.weather[0].icon}@2x.png`;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p><strong>${date}</strong></p>
            <p>Temp: ${temp}°C</p>
            <p>Condições: ${weather}</p>
            <img src="${icon}" alt="Ícone do tempo">
        `;
        forecast.appendChild(forecastItem);
    }
}

// Função para atualizar o horário local com base no fuso horário retornado pela API
function updateLocalTime(timezoneOffset) {
    const now = new Date();
    const localTimeOffset = now.getTimezoneOffset() * 60000; // Offset em milissegundos
    const cityTime = new Date(now.getTime() + localTimeOffset + timezoneOffset * 1000);
    localTime.textContent = cityTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Função para alterar o fundo com base na temperatura e clima
function updateBackground(data) {
    const temp = data.main.temp;
    const weather = data.weather[0].main.toLowerCase();
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    const currentTime = new Date();

    let backgroundImage = '';

    const isDayTime = currentTime >= sunrise && currentTime < sunset;

    if (weather.includes('rain')) {
        backgroundImage = 'url("img/tebela.jpg")';
    } else if (weather.includes('cloud')) {
        backgroundImage = 'url("img/tebela.jpg")';
    } else if (weather.includes('clear')) {
        backgroundImage = 'url("img/tebela.jpg")';
    } else if (temp <= 0) {
        backgroundImage = 'url("img/tebela.jpg")';
    } else if (temp > 30) {
        backgroundImage = 'url("img/tebela.jpg")';
    } else if (temp < 15) {
        backgroundImage = 'url("img/tebela.jpg")';
    } else {
        backgroundImage = isDayTime ? 'url("default_day.jpg")' : 'url("default_night.jpg")';
    }

    document.body.style.backgroundImage = backgroundImage;
}

// Função para pesquisar ao clicar no botão ou pressionar "Enter"
function handleSearch() {
    const city = locationInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        showError('Por favor, insira uma localidade.');
    }
}

// Evento para o botão de busca
searchButton.addEventListener('click', handleSearch);

// Evento para buscar ao pressionar "Enter"
locationInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Função para atualizar horários globais
function atualizarHorarios() {
    try {
        const timezones = {
            "brasilia-time": "America/Sao_Paulo",
            "washington-time": "America/New_York",
            "london-time": "Europe/London",
            "tokyo-time": "Asia/Tokyo",
            "canberra-time": "Australia/Sydney"
        };

        Object.keys(timezones).forEach(id => {
            const element = document.getElementById(id);
            const timezone = timezones[id];
            if (element) {
                const data = new Date().toLocaleString('pt-BR', { timeZone: timezone });
                element.innerHTML = data;
            }
        });
    } catch (error) {
        console.error("Erro ao atualizar os horários: ", error);
    }
}

// Atualiza os horários a cada segundo
setInterval(atualizarHorarios, 1000);

// Ao carregar a página, buscar automaticamente a previsão para uma localidade padrão
document.addEventListener('DOMContentLoaded', function () {
    locationInput.value = 'Macacos';
    fetchWeather('Macacos');
    atualizarHorarios();
});
