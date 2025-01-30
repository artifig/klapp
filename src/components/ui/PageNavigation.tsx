import {usePathname, Link, routes} from '@/navigation';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {useAssessment} from '@/context/AssessmentContext';

const pageOrder = [
  routes.home,
  routes.setup,
  routes.assessment,
  routes.results
] as const;

export function PageNavigation() {
  
  const pathname = usePathname() as typeof pageOrder[number];
  const currentIndex = pageOrder.indexOf(pathname);
  const {state, setGoal, setFormData, setAnswer} = useAssessment();
  
  // Check if previous steps are completed
  const isStepAccessible = (index: number) => {
    if (index === 0) return true; // Home is always accessible
    
    // Check previous step requirements
    switch(index) {
      case 1: // Setup
        return state.goal.trim().length > 0; // Can only proceed if goal is set
      case 2: // Assessment
        return state.goal.trim().length > 0 && // Must have goal
               state.formData.name && 
               state.formData.company && 
               state.formData.email && 
               state.formData.companyType;
      case 3: // Results
        return state.goal.trim().length > 0 && // Must have goal
               state.formData.name && // Must have setup data
               state.formData.company && 
               state.formData.email && 
               state.formData.companyType &&
               Object.keys(state.answers).length === 2; // Must have all answers
      default:
        return false;
    }
  };
  
  const showBack = currentIndex > 0;
  const showNext = currentIndex < pageOrder.length - 1 && pathname !== routes.results;
  const nextIndex = currentIndex + 1;
  
  const backPath = showBack ? pageOrder[currentIndex - 1] : '';
  const nextPath = showNext && isStepAccessible(nextIndex) ? pageOrder[nextIndex] : '';

  const handleNavigation = (e: React.MouseEvent) => {
    // Handle goal submission on home page
    if (pathname === routes.home && nextPath === routes.setup) {
      if (!state.goal.trim()) {
        e.preventDefault();
        return;
      }
      setGoal(state.goal);
    }
    
    // Handle setup form submission
    if (pathname === routes.setup && nextPath === routes.assessment) {
      const {name, company, email, companyType} = state.formData;
      if (!name?.trim() || !company?.trim() || !email?.trim() || !companyType) {
        e.preventDefault();
        return;
      }
      setFormData(state.formData);
    }
    
    // Handle assessment completion
    if (pathname === routes.assessment && nextPath === routes.results) {
      if (Object.keys(state.answers).length < 2) { // Assuming 2 questions total
        e.preventDefault();
        return;
      }
    }
  };
  
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
          <div
            className={`absolute right-[-60px] pointer-events-auto
              w-12 h-12 rounded-full backdrop-blur
              flex items-center justify-center
              transform transition-all duration-200
              ${nextPath ? 'bg-gray-800/80 text-gray-400 hover:text-white hover:scale-110 hover:bg-gray-800 cursor-pointer' : 'bg-gray-900/80 text-gray-600 cursor-not-allowed'}
              group`}
          >
            {nextPath ? (
              <Link 
                href={nextPath} 
                onClick={handleNavigation}
                className="w-full h-full flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6 transform transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 