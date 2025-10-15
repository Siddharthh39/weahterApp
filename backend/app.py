from fastapi import FastAPI
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["https://pkala-weather-app.vercel.app", "https://weather-app-two-opal-uc1v1a5rv3.vercel.app"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Weather API is running with Open-Meteo"}

@app.get("/weather")
def get_weather(lat: float, lon: float):
    """
    Get weather data using Open-Meteo API (No API key required!)
    Open-Meteo provides free weather data with 10,000 requests/day
    """
    try:
        # Open-Meteo API endpoint with current weather data
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,"
            f"weather_code,wind_speed_10m,wind_direction_10m"
            f"&temperature_unit=celsius&wind_speed_unit=ms"
        )
        
        response = requests.get(url, timeout=10)
        
        # Check if request was successful
        if response.status_code != 200:
            return {
                "error": f"Weather API error: {response.status_code}", 
                "message": "Failed to fetch weather data from Open-Meteo"
            }
        
        data = response.json()
        
        # Check if we have the expected data structure
        if "current" not in data:
            return {"error": "Invalid API response", "response": data}
        
        current = data["current"]
        
        # Map WMO weather codes to descriptions
        weather_descriptions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }
        
        weather_code = current.get("weather_code", 0)
        weather_description = weather_descriptions.get(weather_code, "Unknown")
        
        # Get location name using reverse geocoding (optional - Open-Meteo doesn't provide city names)
        # We'll use a free geocoding service to get the location name
        location_name = get_location_name(lat, lon)
        
        return {
            "location": location_name,
            "feels_like": current.get("apparent_temperature", current.get("temperature_2m")),
            "lat": lat,
            "lon": lon,
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "weather": weather_description,
            "wind_speed": current.get("wind_speed_10m"),
            "wind_direction": current.get("wind_direction_10m")
        }
    
    except requests.exceptions.Timeout:
        return {
            "error": "Request timeout",
            "message": "The weather service took too long to respond"
        }
    except Exception as e:
        return {
            "error": "Server error",
            "message": f"An error occurred: {str(e)}"
        }


def get_location_name(lat: float, lon: float) -> str:
    """
    Get location name using reverse geocoding
    Uses OpenStreetMap's Nominatim service (free, no API key required)
    """
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10"
        headers = {"User-Agent": "WeatherApp/1.0"}
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            address = data.get("address", {})
            
            # Try to get city, town, village, or county
            location = (
                address.get("city") or 
                address.get("town") or 
                address.get("village") or 
                address.get("county") or
                address.get("state") or
                "Unknown Location"
            )
            return location
        
    except Exception:
        pass
    
    # Fallback to coordinates if geocoding fails
    return f"{lat:.2f}, {lon:.2f}"