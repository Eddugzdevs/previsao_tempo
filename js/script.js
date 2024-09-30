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
    const temp = data.main.temp;  // Temperatura atual
    const weather = data.weather[0].main.toLowerCase();  // Condição climática (ex: "rain", "clear")
    const sunrise = new Date(data.sys.sunrise * 1000);  // Hora do nascer do sol
    const sunset = new Date(data.sys.sunset * 1000);    // Hora do pôr do sol
    const currentTime = new Date();                     // Hora atual no local

    let backgroundImage = '';

    // Verificar se é dia ou noite com base no horário de nascer e pôr do sol
    const isDayTime = currentTime >= sunrise && currentTime < sunset;

    // Definir a imagem de fundo com base na condição climática e horário
    if (weather.includes('rain')) {
        backgroundImage = isDayTime ? 'url("/img/tebela.jpg")' : 'url("/img/tebela.jpg")';
    } else if (weather.includes('cloud')) {
        backgroundImage = isDayTime ? 'url("/img/tebela.jpg")' : 'url("/img/tebela.jpg")';
    } else if (weather.includes('clear')) {
        backgroundImage = isDayTime ? 'url("/img/tebela.jpg")' : 'url("/img/tebela.jpg")';
    } else if (temp <= 0) {
        backgroundImage = 'url("/img/tebela.jpg")';  // Temperatura abaixo de 0, exibe imagem de neve
    } else if (temp > 30) {
        backgroundImage = 'url("/img/tebela.jpg")';  // Temperatura acima de 30, exibe imagem quente
    } else if (temp < 15) {
        backgroundImage = 'url("/img/tebela.jpg")'; // Temperatura abaixo de 15, exibe imagem fria
    } else {
        backgroundImage = isDayTime ? 'url("default_day.jpg")' : 'url("default_night.jpg")';
    }

    // Aplicar a imagem de fundo ao body
    document.body.style.backgroundImage = backgroundImage;
}

// Adicionando evento ao botão de busca
searchButton.addEventListener('click', function () {
    const city = locationInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        showError('Por favor, insira uma localidade.');
    }
});

// Ao carregar a página, buscar automaticamente a previsão para uma localidade padrão
document.addEventListener('DOMContentLoaded', function () {
    locationInput.value = 'Macacos';
    fetchWeather('Macacos');
});