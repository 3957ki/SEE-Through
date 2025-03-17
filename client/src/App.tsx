import Header from "@/components/layout/Header";
import MainPage from "@/pages/MainPage";
import Providers from "@/Providers";

function App() {
  return (
    <Providers>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Header />
        <MainPage />
      </div>
    </Providers>
  );
}

export default App;
