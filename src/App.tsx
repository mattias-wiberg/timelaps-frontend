import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Image {
  filename: string;
  path: string;
  timestamp: number;
}

function App() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState('gallery') // 'gallery', 'timeline', 'live'
  const [playbackSpeed, setPlaybackSpeed] = useState(1) // frames per second
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [liveImage, setLiveImage] = useState<Image | null>(null)
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch all images on component mount
  useEffect(() => {
    fetchImages()
  }, [])

  // Set up live image refresh interval
  useEffect(() => {
    if (viewMode === 'live') {
      fetchLiveImage()
      liveIntervalRef.current = setInterval(fetchLiveImage, 5000) // refresh every 5 seconds
    } else if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current)
    }

    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current)
      }
    }
  }, [viewMode])

  // Handle playback for timeline view
  useEffect(() => {
    if (isPlaying && viewMode === 'timeline') {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentImageIndex(prevIndex => {
          // Loop back to start if we reach the end
          return prevIndex >= images.length - 1 ? 0 : prevIndex + 1
        })
      }, 1000 / playbackSpeed)
    } else if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current)
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, images.length, viewMode])

  // Fetch all images from the API
  const fetchImages = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3000/timelapse/images')
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const data = await response.json()
      setImages(data)
      
      // Set current image to the most recent one
      if (data.length > 0) {
        setCurrentImageIndex(0)
      }
    } catch (err) {
      console.error('Error fetching images:', err)
      setError(`Failed to load images. ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Fetch the latest image for live view
  const fetchLiveImage = async () => {
    try {
      const response = await fetch('http://localhost:3000/timelapse/latest')
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const data = await response.json()
      setLiveImage(data)
    } catch (err) {
      console.error('Error fetching live image:', err)
    }
  }

  // Toggle playback for timeline view
  const togglePlayback = () => {
    setIsPlaying(prev => !prev)
  }

  // Create a video from timelapse images
  const createVideo = () => {
    // This would typically involve sending a request to the server
    // to create a video from the timelapse images
    alert('Video creation would be implemented here')
    
    // Example implementation would be:
    // 1. Send a request to a server endpoint that generates a video
    // 2. The server would use ffmpeg or similar to create the video
    // 3. Return a link to download the completed video
  }

  // Format a timestamp for display
  const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Render loading state
  if (loading && images.length === 0) {
    return (
      <div className="app-container">
        <h1>Timelapse Viewer</h1>
        <div className="loading">Loading images...</div>
      </div>
    )
  }

  // Render error state
  if (error && images.length === 0) {
    return (
      <div className="app-container">
        <h1>Timelapse Viewer</h1>
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={fetchImages}>
          Retry
        </button>
      </div>
    )
  }

  // Render no images state
  if (images.length === 0) {
    return (
      <div className="app-container">
        <h1>Timelapse Viewer</h1>
        <div className="no-images">
          No images available. Start capturing with the camera app first.
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <h1>Timelapse Viewer</h1>

      {/* View mode tabs */}
      <div className="view-tabs">
        <button 
          className={`tab-button ${viewMode === 'gallery' ? 'active' : ''}`}
          onClick={() => setViewMode('gallery')}
        >
          Gallery
        </button>
        <button 
          className={`tab-button ${viewMode === 'timeline' ? 'active' : ''}`}
          onClick={() => setViewMode('timeline')}
        >
          Timeline
        </button>
        <button 
          className={`tab-button ${viewMode === 'live' ? 'active' : ''}`}
          onClick={() => setViewMode('live')}
        >
          Live View
        </button>
      </div>

      {/* Gallery View */}
      {viewMode === 'gallery' && (
        <div className="gallery-container">
          <div className="image-grid">
            {images.map((image, index) => (
              <div key={image.filename} className="image-tile">
                <img 
                  src={`http://localhost:3000${image.path}`}
                  alt={`Timelapse frame ${index}`}
                  loading="lazy"
                  onClick={() => {
                    setCurrentImageIndex(index)
                    setViewMode('timeline')
                  }}
                />
                <div className="image-timestamp">
                  {formatTimestamp(image.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="timeline-container">
          <div className="current-image">
            <img 
              src={`http://localhost:3000${images[currentImageIndex].path}`}
              alt={`Timelapse frame ${currentImageIndex}`}
            />
            <div className="image-info">
              <span>{`Frame ${currentImageIndex + 1} of ${images.length}`}</span>
              <span>{formatTimestamp(images[currentImageIndex].timestamp)}</span>
            </div>
          </div>

          <div className="timeline-controls">
            <button 
              className="control-button"
              onClick={() => setCurrentImageIndex(0)}
            >
              ⏮️ First
            </button>
            <button 
              className="control-button"
              onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentImageIndex === 0}
            >
              ⏪ Previous
            </button>
            <button 
              className="control-button play-button"
              onClick={togglePlayback}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            <button 
              className="control-button"
              onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
              disabled={currentImageIndex === images.length - 1}
            >
              ⏩ Next
            </button>
            <button 
              className="control-button"
              onClick={() => setCurrentImageIndex(images.length - 1)}
            >
              ⏭️ Last
            </button>
          </div>

          <div className="speed-controls">
            <label htmlFor="playback-speed">Playback Speed (fps): </label>
            <input 
              id="playback-speed"
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            />
            <span>{playbackSpeed} fps</span>
          </div>

          <button className="create-video-button" onClick={createVideo}>
            Create Video from Timelapse
          </button>

          <div className="timeline-scrubber">
            <input 
              type="range"
              min="0"
              max={images.length - 1}
              value={currentImageIndex}
              onChange={(e) => setCurrentImageIndex(parseInt(e.target.value))}
              className="scrubber"
            />
          </div>
        </div>
      )}

      {/* Live View */}
      {viewMode === 'live' && (
        <div className="live-container">
          {liveImage ? (
            <>
              <div className="live-image">
                <img 
                  src={`http://localhost:3000${liveImage.path}`}
                  alt="Live camera view"
                />
                <div className="live-indicator">LIVE</div>
              </div>
              <div className="live-timestamp">
                Last update: {formatTimestamp(liveImage.timestamp)}
              </div>
            </>
          ) : (
            <div className="no-live-image">
              No live image available. Make sure the camera is running.
            </div>
          )}
          <button className="refresh-button" onClick={fetchLiveImage}>
            Refresh Now
          </button>
        </div>
      )}
    </div>
  )
}

export default App
