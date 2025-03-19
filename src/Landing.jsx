import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex flex-col justify-center items-center p-4">
      <h1 className="text-5xl font-extrabold mb-8 text-white drop-shadow-md">
        Capture Your Moments
      </h1>
      <p className="text-lg mb-6 text-white max-w-md text-center">
        Experience the magic of capturing your special moments with our interactive photo booth. Click below to get started!
      </p>
      <button
        onClick={() => navigate('/booth')}
        className="bg-white text-purple-500 px-8 py-4 rounded-full shadow-lg hover:bg-purple-100 transition-transform transform hover:scale-105"
      >
        Go to Photo Booth
      </button>
    </div>
  )
}

export default Landing

