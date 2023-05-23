// @src/app.jsx
import busLogo from './assets/bus.png'
import busA from './assets/a.png'
import busB from './assets/b.png'
import busC from './assets/c.png'

import hundredA from './assets/100A.mp3'
import hundredB from './assets/100B.mp3'
import hundredC from './assets/100C.mp3'
import arriveA from './assets/arriveA.mp3'
import arriveB from './assets/arriveB.mp3'
import arriveC from './assets/arriveC.mp3'
import finalA from './assets/finalA.mp3'
import finalC from './assets/finalC.mp3'

import React, { useEffect, useState, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from 'react-leaflet'
import L from 'leaflet'

//AUDIO FILES
const playSound = (audioFile) => {
  new Audio(audioFile).play()
}

function interpolate(pointA, pointB, fraction) {
  return [
    pointA[0] + (pointB[0] - pointA[0]) * fraction,
    pointA[1] + (pointB[1] - pointA[1]) * fraction,
  ]
}

function haversineDistance([lat1, lon1], [lat2, lon2]) {
  function toRad(x) {
    return (x * Math.PI) / 180
  }

  var R = 6371 // km
  var x1 = lat2 - lat1
  var dLat = toRad(x1)
  var x2 = lon2 - lon1
  var dLon = toRad(x2)
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c

  return d * 1000 // meters
}

const BASE_URL = 'localhost'

const App = () => {
  const busStops = [
    { name: 'A', coords: [7.10488, 124.83347] },
    { name: 'B', coords: [7.1059, 124.83141] },
    { name: 'C', coords: [7.10556, 124.82827] },
  ]
  const routePath = [
    [7.10488, 124.83347],
    [7.10534, 124.83365],
    [7.10564, 124.83245],
    [7.1059, 124.83143],
    [7.1059, 124.83141],
    [7.10624, 124.83011],
    [7.10638, 124.8295],
    [7.10652, 124.829],
    [7.10543, 124.82872],
    [7.10556, 124.82827],
  ]

  const centerPosition = [7.1059, 124.83141]

  const [currentPosition, setCurrentPosition] = useState(routePath[0])
  const [isLocNull, setIsLocNull] = useState(true)
  // const [currentPosition, setCurrentPosition] = useState(routePath[0])
  const [sliderValue, setSliderValue] = useState(0)
  const [distances, setDistances] = useState(busStops.map(() => 0))
  const [accumulatedDistances, setAccumulatedDistances] = useState([])
  // Add state to check whether the route has started
  const [routeStarted, setRouteStarted] = useState(false)
  // Add state for the current route
  const [route, setRoute] = useState('AtoC')
  const [busStopIndex, setBusStopIndex] = useState(0) // Index of the current bus stop in the route
  const [withinRange, setWithinRange] = useState(false) // If we are within 30m of a bus stop// The initial value is set to a large number that's more than any possible distance
  const [previousDistance, setPreviousDistance] = useState(1e6) // add this to your state declarations
  const [lastAnnouncedDistance, setLastAnnouncedDistance] = useState(null)
  const [finalAnnouncementMade, setFinalAnnouncementMade] = useState(false) // Add a new state to keep track of the next stop
  const [nextStopIndex, setNextStopIndex] = useState(0)
  const [mode, setMode] = useState('GPS')

  const fetchGPSInterval = useRef(null)

  const fetchGPSData = async () => {
    try {
      const response = await fetch(`http://${BASE_URL}:5000/gpsdata`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      console.log(data)
      try {
        if (data.latitude !== null) {
          setIsLocNull(false)
          setCurrentPosition([data.latitude, data.longitude])
        } else {
          console.log("Not reading data, it's null")
          setIsLocNull(true)
        }
      } catch (err) {
        console.log("Can't get GPS data")
      }
    } catch (error) {
      console.error('Failed to fetch GPS data:', error)
    }
  }

  // Create function to start route
  const startRoute = (route) => {
    setRoute(route)
    setRouteStarted(true)
  }

  const busIcon = L.icon({
    iconUrl: busLogo,
    iconSize: [50, 50],
  })

  const busStopIcons = [
    L.icon({
      iconUrl: busA,
      iconSize: [50, 50],
    }),
    L.icon({
      iconUrl: busB,
      iconSize: [50, 50],
    }),
    L.icon({
      iconUrl: busC,
      iconSize: [50, 50],
    }),
  ]

  useEffect(() => {
    if (mode === 'GPS') {
      fetchGPSData() // fetch immediately upon switching to GPS mode
      fetchGPSInterval.current = setInterval(fetchGPSData, 1000)
    } else {
      if (fetchGPSInterval.current) {
        clearInterval(fetchGPSInterval.current)
        fetchGPSInterval.current = null
      }
    }
    return () => {
      if (fetchGPSInterval.current) {
        clearInterval(fetchGPSInterval.current)
        fetchGPSInterval.current = null
      }
    }
  }, [mode])

  useEffect(() => {
    let distance = 0
    const distances = [0]

    for (let i = 0; i < routePath.length - 1; i++) {
      const pointA = routePath[i]
      const pointB = routePath[i + 1]
      distance += haversineDistance(pointA, pointB)
      distances.push(distance)
    }

    setAccumulatedDistances(distances)
  }, [])

  useEffect(() => {
    if (accumulatedDistances.length === 0) return

    let newDistances = busStops.map((stop) => {
      const stopCoords = stop.coords
      return haversineDistance(currentPosition, stopCoords)
    })

    setDistances(newDistances)
  }, [currentPosition, accumulatedDistances])

  // Add this to your useEffect that calculates distances
  useEffect(() => {
    if (accumulatedDistances.length === 0) return

    let newDistances = busStops.map((stop) => {
      const stopCoords = stop.coords
      return haversineDistance(currentPosition, stopCoords)
    })

    setDistances(newDistances)

    if (newDistances[busStopIndex] <= 30) {
      setWithinRange(true)
    } else {
      setWithinRange(false)
    }

    if (route === 'AtoC' && busStopIndex < busStops.length - 1) {
      if (newDistances[busStopIndex] <= 30) {
        setBusStopIndex(busStopIndex + 1)
      }
    } else if (route === 'CtoA' && busStopIndex > 0) {
      if (newDistances[busStopIndex] <= 30) {
        setBusStopIndex(busStopIndex - 1)
      }
    }

    if (newDistances[nextStopIndex] <= 30 && lastAnnouncedDistance !== 30) {
      // Check here for final bus stop and whether the final announcement has been made
      if (
        (route === 'AtoC' && nextStopIndex === busStops.length - 1) ||
        (route === 'CtoA' && nextStopIndex === 0)
      ) {
        if (!finalAnnouncementMade) {
          // const utterance = new SpeechSynthesisUtterance(
          //   `We have arrived at the final destination, bus stop ${busStops[nextStopIndex].name}`
          // )
          // window.speechSynthesis.speak(utterance)
          if (busStops[nextStopIndex].name === 'A') {
            playSound(finalA)
          } else if (busStops[nextStopIndex].name === 'C') {
            playSound(finalC)
          }
          setFinalAnnouncementMade(true)
        }
      } else {
        if (busStops[nextStopIndex].name === 'A') {
          playSound(arriveA)
        } else if (busStops[nextStopIndex].name === 'B') {
          playSound(arriveB)
        } else if (busStops[nextStopIndex].name === 'C') {
          playSound(arriveC)
        }
      }
      setLastAnnouncedDistance(30)
      setBusStopIndex(nextStopIndex)
      setNextStopIndex(route === 'AtoC' ? nextStopIndex + 1 : nextStopIndex - 1)
    } else if (
      newDistances[nextStopIndex] <= 100 &&
      lastAnnouncedDistance !== 100
    ) {
      if (!finalAnnouncementMade) {
        if (busStops[nextStopIndex].name === 'A') {
          playSound(hundredA)
        } else if (busStops[nextStopIndex].name === 'B') {
          playSound(hundredB)
        } else if (busStops[nextStopIndex].name === 'C') {
          playSound(hundredC)
        }
        setLastAnnouncedDistance(100)
      }
    }

    setPreviousDistance(newDistances[busStopIndex])
  }, [
    currentPosition,
    accumulatedDistances,
    route,
    busStopIndex,
    nextStopIndex,
    previousDistance,
    lastAnnouncedDistance,
    finalAnnouncementMade,
  ])

  // This function handles the click event of the route toggle button
  // Update the handleRouteClick
  const handleRouteClick = () => {
    if (route === 'AtoC') {
      setRoute('CtoA')
      setBusStopIndex(busStops.length - 1)
      // We are currently at the final stop of route AtoC
      // Set the next stop to the previous stop on the route
      setNextStopIndex(busStops.length - 2)
    } else {
      setRoute('AtoC')
      setBusStopIndex(0)
      // We are currently at the final stop of route CtoA
      // Set the next stop to the second stop on the route
      setNextStopIndex(1)
    }
    setFinalAnnouncementMade(false)
    setLastAnnouncedDistance(null)
  }

  const handleSliderChange = (event) => {
    const newSliderValue = event.target.value
    setSliderValue(newSliderValue)
    const index = Math.floor(newSliderValue * (routePath.length - 1))
    let fraction = newSliderValue * (routePath.length - 1) - index
    fraction = Math.min(fraction, 1)

    if (index >= routePath.length - 1) {
      setCurrentPosition(routePath[routePath.length - 1])
    } else {
      const pointA = routePath[index]
      const pointB = routePath[index + 1]
      setCurrentPosition(interpolate(pointA, pointB, fraction))
    }
  }

  const [coordsInput, setCoordsInput] = useState('')

  const handleCoordsInputChange = (event) => {
    setCoordsInput(event.target.value)
  }

  const handleSetPositionClick = () => {
    const splitInput = coordsInput.split(',')
    if (splitInput.length !== 2) {
      alert('Invalid input. Please enter latitude,longitude.')
      return
    }

    const newLat = parseFloat(splitInput[0].trim())
    const newLng = parseFloat(splitInput[1].trim())

    // Ensure values are valid before setting position
    if (newLat >= -90 && newLat <= 90 && newLng >= -180 && newLng <= 180) {
      setCurrentPosition([newLat, newLng])
    } else {
      alert('Invalid latitude or longitude')
    }
  }

  return (
    <div className="container">
      <MapContainer
        center={centerPosition}
        zoom={25}
        scrollWheelZoom={true}
        style={{ height: '75vh', width: '100vw' }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {busStops.map((stop, i) => (
          <Marker key={i} position={stop.coords} icon={busStopIcons[i]} />
        ))}
        <Marker position={currentPosition} icon={busIcon} />
        <Polyline positions={routePath} color="blue" />
      </MapContainer>
      <button
        style={{
          position: 'absolute',
          right: '30px',
          top: '10px',
          zIndex: 9999,
        }}
        onClick={() => setMode(mode === 'DEMO' ? 'GPS' : 'DEMO')}
      >
        Switch to {mode === 'DEMO' ? 'GPS' : 'DEMO'} mode
      </button>

      <div
        style={{
          position: 'absolute',
          left: '60px',
          top: '10px',
          zIndex: 9999,
          fontSize: '1.5rem',
          background: 'black',
          padding: '1rem',
          borderRadius: '1rem',
        }}
      >
        Current position: <br></br>
        {currentPosition[0]}
        <br></br>
        {currentPosition[1]}
      </div>
      {!routeStarted ? (
        <div className="bottomContainer buttonsStart">
          <button onClick={() => startRoute('AtoC')}>Start route A to C</button>
          <button onClick={() => startRoute('CtoA')}>Start route C to A</button>
        </div>
      ) : (
        <div className="bottomContainer">
          {mode === 'DEMO' && (
            <div className="testContainer">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={sliderValue}
                onChange={handleSliderChange}
              />
              <div>
                <label>
                  Coords (lat,lng):
                  <input
                    type="text"
                    value={coordsInput}
                    onChange={handleCoordsInputChange}
                  />
                </label>
                <button onClick={handleSetPositionClick}>Set Position</button>
              </div>
            </div>
          )}
          {busStops.map((stop, i) => {
            if (route === 'AtoC' && i === busStopIndex) {
              return (
                <div key={i} className="distanceText">
                  <p>
                    {Math.round(distances[i])}m from BUS STOP {stop.name}
                  </p>
                </div>
              )
            } else if (route === 'CtoA' && i === busStopIndex) {
              return (
                <div key={i} className="distanceText">
                  <p>
                    {Math.round(distances[i])}m from BUS STOP {stop.name}
                  </p>
                </div>
              )
            }
            return null
          })}
          {withinRange &&
          (busStopIndex === 0 || busStopIndex === busStops.length - 1) ? (
            <button
              style={{
                position: 'absolute',
                right: '30px',
                top: '70px',
                zIndex: 9999,
                fontSize: '2rem',
              }}
              onClick={handleRouteClick}
            >
              {route === 'AtoC'
                ? 'Change route to C to A'
                : 'Change route to A to C'}
            </button>
          ) : null}
          {/* {busStops.map((stop, i) => (
        <div key={i}>
          {stop.name}: {Math.round(distances[i])}m from bus
        </div>
      ))} */}
        </div>
      )}
    </div>
  )
}

export default App
