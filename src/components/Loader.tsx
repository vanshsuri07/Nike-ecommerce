import { Html, useProgress } from '@react-three/drei';

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-500"></div>
      </div>
      <p className="text-white text-center mt-4">{progress.toFixed(2)}% loaded</p>
    </Html>
  );
};

export default Loader;
