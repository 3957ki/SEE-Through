import Header from "@/components/layout/Header";
import MainPage from "@/pages/MainPage";
import Providers from "@/Providers";

function FridgeDisplay() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Header />
      <MainPage />
    </div>
  );
}
function App() {
  return (
    <Providers>
      <FridgeDisplay />
    </Providers>
  );
}

export default App;
