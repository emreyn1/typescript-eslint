// components/ExampleSection.tsx
export default function ExampleSection() {
  return (
    <section className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
      {/* Bu div istediğin kadar büyük olabilir */}
      <div className="max-w-4xl mx-auto px-8 text-center">
        
        <h2 className="text-6xl md:text-8xl font-bold mb-8">
          Bu Bölüm İstediğin Kadar Uzun Olabilir
        </h2>

        <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12">
          Aşağıda 5000px yüksekliğinde kırmızı bir div var.<br />
          Ama hâlâ bu yazıyı görüyorsun çünkü hiçbir şey ezilmiyor!
        </p>

        {/* İSTEDİĞİN KADAR BÜYÜK YAPABİLİRSİN - TEST ET! */}
        <div className="h-[5000px] bg-red-600 rounded-3xl flex items-center justify-center text-5xl font-bold">
          5000 PX YÜKSEKLİĞİNDE DEV BİR DİV
          <br />
          (Ama alttaki buton hâlâ görünecek!)
        </div>

        {/* Bu buton hâlâ burada, ezilmedi! */}
        <div className="mt-16">
          <button className="bg-white text-black px-12 py-6 rounded-full text-2xl font-bold hover:scale-110 transition transform">
            Call to Action - Ben Hâlâ Buradayım!
          </button>
        </div>

        <p className="mt-20 text-3xl animate-bounce">↓ Scroll aşağı devam et ↓</p>
      </div>
    </section>
  );
}