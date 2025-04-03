function Screensaver() {
  return (
    <div
      className="w-full h-full bg-black flex items-center justify-center"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
        color: "#fff",
        fontSize: "calc(16px * 0.8)",
      }}
    >
      <p>화면보호기</p>
    </div>
  );
}
export default Screensaver;
