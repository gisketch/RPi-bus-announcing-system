# 🚌 Bus Arrival Announcement System with GPS Tracking

This repository contains the source code for the Bus Arrival Announcement System with GPS Tracking, as described in the research paper titled "RPI-BASED AUDIO-VISUAL BUS ANNOUNCING SYSTEM FOR ENHANCED PASSENGER TRAVEL EXPERIENCE" by Noreen Culiao, a former classmate of mine. The system aims to address the shortcomings of the current bus arrival announcement system by providing clear and audible announcements, along with real-time tracking of the bus's location.

## Overview

The Bus Arrival Announcement System incorporates both visual and audio outputs, along with GPS tracking, to improve the accessibility and efficiency of bus transportation. Noreen Culiao conducted the research and wrote the associated paper, while I served as the programmer of the device. The system utilizes a Raspberry Pi as the central processing unit and includes the following key components:

- 🖥️ **Raspberry Pi**: Serves as the core component of the bus tracking device, providing computational power for data processing.
- 🛰️ **NEO6M GPS module**: Interfaces with the Raspberry Pi to obtain accurate GPS data for real-time tracking of the bus.
- 🌐 **React JS and React Leaflet**: JavaScript libraries used to create a dynamic and interactive map rendering interface, allowing users to visualize the bus's position and the locations of bus stops.
- 🗺️ **Open Street Map Routing (OSRM)**: Open-source routing service that generates optimized route paths based on bus stops' locations.
- 🔊 **Audio speaker**: Provides audible announcements to passengers when the bus approaches or arrives at a bus stop.
- 🖥️ **LCD screen**: Serves as a visual display for monitoring the bus's real-time location and displaying relevant notifications.

## Usage

To set up and run the Bus Arrival Announcement System, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/bus-arrival-announcement-system.git
   ```

2. Install the required dependencies:

   ```bash
   cd bus-arrival-announcement-system
   npm install
   ```

3. Configure the system by providing necessary details such as bus stops' locations, bus route, and GPS module settings.

4. Run the system:

   ```bash
   npm run dev
   ```

5. Access the system by opening the provided URL in a web browser.

## Contributing

Contributions to the Bus Arrival Announcement System are welcome! If you find any issues or have suggestions for improvement, please feel free to submit a pull request or open an issue in the repository.
