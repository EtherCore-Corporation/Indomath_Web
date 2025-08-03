export default function Background() {
  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 w-full h-full bg-gray-100"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg width='1920' height='1080' viewBox='0 0 1920 1080' fill='none' xmlns='http://www.w3.org/2000/svg'><polygon points='0,0 1920,0 1920,1080' fill='%23e5e7eb' opacity='0.85'/><polygon points='0,0 0,1080 1920,1080' fill='%23f3f4f6' opacity='0.7'/><polygon points='0,0 1920,0 0,1080' fill='%23d1d5db' opacity='0.6'/><line x1='0' y1='200' x2='1920' y2='400' stroke='%23fff' stroke-width='2' opacity='0.25'/><line x1='0' y1='800' x2='1920' y2='1000' stroke='%23fff' stroke-width='2' opacity='0.18'/><line x1='400' y1='0' x2='800' y2='1080' stroke='%23fff' stroke-width='2' opacity='0.13'/><line x1='1520' y1='0' x2='1120' y2='1080' stroke='%23fff' stroke-width='2' opacity='0.13'/></svg>")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
    </div>
  );
}
