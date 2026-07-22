const fs = require('fs');

const path = 'src/components/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace standard images with OptimizedImage
content = content.replace(/<img[^>]*src="\/logo.png"[^>]*>/, '<OptimizedImage src="/logo.png" width={200} height={80} alt="EduMessenger Logo" className="hidden md:block h-20 w-auto bg-transparent" objectFit="contain" priority />');
content = content.replace(/<img[^>]*src="\/logo-small.png"[^>]*className="md:hidden[^>]*>/, '<OptimizedImage src="/logo-small.png" width={100} height={100} alt="EduMessenger Logo" className="md:hidden h-16 w-auto bg-transparent" objectFit="contain" priority />');
content = content.replace(/<img[^>]*src="\/hero.png"[^>]*>/, '<OptimizedImage src="/hero.png" width={1200} height={800} alt="EduMessenger Hero" className="w-full h-auto bg-transparent" objectFit="cover" priority />');
content = content.replace(/<img[^>]*src={feature.image}[^>]*>/, '<OptimizedImage src={feature.image} alt={feature.title} className="w-full h-full group-hover:scale-105 transition-transform duration-500 bg-transparent" objectFit="cover" />');
content = content.replace(/<img[^>]*src="\/logo-small.png"[^>]*className="h-10 w-auto[^>]*>/, '<OptimizedImage src="/logo-small.png" width={100} height={100} alt="EduMessenger Logo" className="h-10 w-auto bg-transparent" objectFit="contain" />');

fs.writeFileSync(path, content);
