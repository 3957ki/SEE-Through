function WebcamView() {
  return (
    <div className="bg-black rounded-md w-full h-full flex items-center justify-center">
      <p className="text-gray-400 text-center text-sm">
        웹캠 연결 대기중...
        <br />
        (Webcam feed will appear here)
      </p>
    </div>
  );
}

export default WebcamView;
