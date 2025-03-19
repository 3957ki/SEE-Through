import Header from "@/components/layout/Header";
import MainPage from "@/pages/MainPage";
import Providers from "@/Providers";

function App() {
  return (
    <Providers>
      <div className="w-full h-full bg-white">
        <Header />
        <MainPage />
      </div>
    </Providers>
  );
}

export default App;
