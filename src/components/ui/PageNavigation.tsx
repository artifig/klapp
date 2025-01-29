import {usePathname, Link, routes} from '@/navigation';
import {ChevronLeft, ChevronRight} from 'lucide-react';

type RouteType = keyof typeof routes;
type PathType = typeof routes[RouteType];

const pageOrder = [
  routes.home,
  routes.setup,
  routes.assessment,
  routes.results
] as const;

export function PageNavigation() {
  const pathname = usePathname() as PathType;
  const currentIndex = pageOrder.indexOf(pathname);
  
  const showBack = currentIndex > 0;
  const showNext = currentIndex < pageOrder.length - 1 && pathname !== routes.results;
  
  const backPath = showBack ? pageOrder[currentIndex - 1] : '';
  const nextPath = showNext ? pageOrder[currentIndex + 1] : '';
  
  return (
    <div className="fixed top-1/2 -translate-y-1/2 w-full pointer-events-none">
      <div className="container mx-auto max-w-4xl relative">
        {showBack && (
          <Link
            href={backPath}
            className="absolute left-[-60px] pointer-events-auto
              w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur
              flex items-center justify-center
              text-gray-400 hover:text-white
              transform transition-all duration-200
              hover:scale-110 hover:bg-gray-800
              group"
          >
            <ChevronLeft className="w-6 h-6 transform transition-transform group-hover:-translate-x-0.5" />
          </Link>
        )}
        
        {showNext && (
          <Link
            href={nextPath}
            className="absolute right-[-60px] pointer-events-auto
              w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur
              flex items-center justify-center
              text-gray-400 hover:text-white
              transform transition-all duration-200
              hover:scale-110 hover:bg-gray-800
              group"
          >
            <ChevronRight className="w-6 h-6 transform transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
} 