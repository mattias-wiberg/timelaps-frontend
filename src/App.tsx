import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/timelapse/images`);
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/timelapse/latest`);
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
      <div className="flex flex-col items-center gap-6 max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold">Timelapse Viewer</h1>
        <Card className="w-full">
          <CardContent className="flex justify-center items-center p-8">
            <p>Loading images...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render error state
  if (error && images.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold">Timelapse Viewer</h1>
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 items-center p-8">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchImages}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render no images state
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold">Timelapse Viewer</h1>
        <Card className="w-full">
          <CardContent className="flex justify-center items-center p-8">
            <p>No images available. Start capturing with the camera app first.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold">Timelapse Viewer</h1>

      <Tabs 
        value={viewMode} 
        onValueChange={setViewMode} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="live">Live View</TabsTrigger>
        </TabsList>

        {/* Gallery View */}
        <TabsContent value="gallery">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <Card key={image.filename} className="overflow-hidden">
                <CardContent className="p-0">
                  <img
                    key={image.path} // Using image.path as the key
                    src={`${import.meta.env.VITE_API_BASE_URL}${image.path}`}
                    alt={`Timelapse image ${index + 1}`}
                    className="w-full h-48 object-cover cursor-pointer"
                    loading="lazy"
                    onClick={() => {
                      setCurrentImageIndex(index)
                      setViewMode('timeline')
                    }}
                  />
                </CardContent>
                <CardFooter className="p-2 text-xs text-gray-500">
                  {formatTimestamp(image.timestamp)}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline">
          <Card className="mb-4">
            <CardContent className="p-0 relative">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${images[currentImageIndex].path}`}
                alt="Timelapse image"
                className="w-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 flex justify-between text-sm">
                <span>{`Frame ${currentImageIndex + 1} of ${images.length}`}</span>
                <span>{formatTimestamp(images[currentImageIndex].timestamp)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent className="p-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentImageIndex(0)}
                className="flex-1"
              >
                ⏮️ First
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                disabled={currentImageIndex === 0}
                className="flex-1"
              >
                ⏪ Previous
              </Button>
              <Button
                variant={isPlaying ? "destructive" : "default"}
                onClick={togglePlayback}
                className="flex-1"
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                disabled={currentImageIndex === images.length - 1}
                className="flex-1"
              >
                ⏩ Next
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentImageIndex(images.length - 1)}
                className="flex-1"
              >
                ⏭️ Last
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">
                Playback Speed: {playbackSpeed} fps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                min={0.5}
                max={10}
                step={0.5}
                value={[playbackSpeed]}
                onValueChange={(values) => setPlaybackSpeed(values[0])}
              />
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={createVideo}
          >
            Create Video from Timelapse
          </Button>

          <div className="mt-4 w-full">
            <Slider
              min={0}
              max={images.length - 1}
              value={[currentImageIndex]}
              onValueChange={(values) => setCurrentImageIndex(values[0])}
              className="w-full"
            />
          </div>
        </TabsContent>

        {/* Live View */}
        <TabsContent value="live">
          {liveImage ? (
            <Card className="mb-4">
              <CardContent className="p-0 relative">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${liveImage.path}`}
                  alt="Live image"
                  className="w-full"
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md animate-pulse">
                  LIVE
                </div>
              </CardContent>
              <CardFooter>
                Last update: {formatTimestamp(liveImage.timestamp)}
              </CardFooter>
            </Card>
          ) : (
            <Card className="mb-4">
              <CardContent className="p-8 flex justify-center items-center">
                No live image available. Make sure the camera is running.
              </CardContent>
            </Card>
          )}
          <Button 
            onClick={fetchLiveImage}
            className="w-full"
          >
            Refresh Now
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
